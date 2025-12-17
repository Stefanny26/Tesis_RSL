# 🚀 Plan de Implementación - Mejoras Críticas PRISMA 2020

## 🎯 Objetivo
Implementar las funcionalidades faltantes para cumplir al 100% con PRISMA 2020, priorizando doble revisión y evaluación de calidad.

---

## 📋 FASE 1: DOBLE REVISIÓN INDEPENDIENTE (CRÍTICO)

### 1.1 Migración de Base de Datos

**Archivo**: `scripts/20-add-dual-review-fields.sql`

```sql
-- Agregar campos para doble revisión independiente
ALTER TABLE references
  -- Revisor 1
  ADD COLUMN reviewer1_id UUID REFERENCES users(id),
  ADD COLUMN reviewer1_decision VARCHAR(50) 
    CHECK (reviewer1_decision IN ('include', 'exclude', 'uncertain', NULL)),
  ADD COLUMN reviewer1_reason TEXT,
  ADD COLUMN reviewer1_notes TEXT,
  ADD COLUMN reviewer1_reviewed_at TIMESTAMP WITH TIME ZONE,
  
  -- Revisor 2
  ADD COLUMN reviewer2_id UUID REFERENCES users(id),
  ADD COLUMN reviewer2_decision VARCHAR(50) 
    CHECK (reviewer2_decision IN ('include', 'exclude', 'uncertain', NULL)),
  ADD COLUMN reviewer2_reason TEXT,
  ADD COLUMN reviewer2_notes TEXT,
  ADD COLUMN reviewer2_reviewed_at TIMESTAMP WITH TIME ZONE,
  
  -- Resolución de conflictos
  ADD COLUMN has_conflict BOOLEAN DEFAULT FALSE,
  ADD COLUMN conflict_resolved BOOLEAN DEFAULT FALSE,
  ADD COLUMN conflict_resolver_id UUID REFERENCES users(id),
  ADD COLUMN final_decision VARCHAR(50) 
    CHECK (final_decision IN ('include', 'exclude', NULL)),
  ADD COLUMN final_reason TEXT,
  ADD COLUMN resolution_method VARCHAR(100), -- 'consensus', 'third_reviewer', 'discussion'
  ADD COLUMN resolved_at TIMESTAMP WITH TIME ZONE;

-- Índices
CREATE INDEX idx_references_reviewer1 ON references(reviewer1_id);
CREATE INDEX idx_references_reviewer2 ON references(reviewer2_id);
CREATE INDEX idx_references_has_conflict ON references(has_conflict);

-- Migrar datos existentes
UPDATE references 
SET reviewer1_id = reviewed_by,
    reviewer1_decision = CASE 
      WHEN screening_status = 'Incluida' THEN 'include'
      WHEN screening_status = 'Excluida' THEN 'exclude'
      ELSE NULL
    END,
    reviewer1_reviewed_at = reviewed_at
WHERE reviewed_by IS NOT NULL;

-- Función para detectar conflictos
CREATE OR REPLACE FUNCTION detect_conflict()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reviewer1_decision IS NOT NULL AND NEW.reviewer2_decision IS NOT NULL THEN
    NEW.has_conflict := (NEW.reviewer1_decision != NEW.reviewer2_decision);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_detect_conflict
  BEFORE UPDATE ON references
  FOR EACH ROW
  EXECUTE FUNCTION detect_conflict();
```

### 1.2 Modelo de Dominio

**Archivo**: `backend/src/domain/models/reference.model.js`

```javascript
class Reference {
  constructor(data) {
    // ... campos existentes
    
    // Doble revisión
    this.reviewer1 = {
      userId: data.reviewer1_id,
      decision: data.reviewer1_decision,
      reason: data.reviewer1_reason,
      notes: data.reviewer1_notes,
      reviewedAt: data.reviewer1_reviewed_at
    }
    
    this.reviewer2 = {
      userId: data.reviewer2_id,
      decision: data.reviewer2_decision,
      reason: data.reviewer2_reason,
      notes: data.reviewer2_notes,
      reviewedAt: data.reviewer2_reviewed_at
    }
    
    // Conflictos
    this.hasConflict = data.has_conflict || false
    this.conflictResolved = data.conflict_resolved || false
    this.conflictResolver = data.conflict_resolver_id
    this.finalDecision = data.final_decision
    this.finalReason = data.final_reason
    this.resolutionMethod = data.resolution_method
    this.resolvedAt = data.resolved_at
  }
  
  toJSON() {
    return {
      // ... campos existentes
      reviewer1: this.reviewer1,
      reviewer2: this.reviewer2,
      hasConflict: this.hasConflict,
      conflictResolved: this.conflictResolved,
      finalDecision: this.finalDecision
    }
  }
}
```

### 1.3 Componente Frontend: Asignación de Revisores

**Archivo**: `frontend/components/screening/reviewer-assignment.tsx`

```tsx
export function ReviewerAssignment({ projectId }: { projectId: string }) {
  const [teamMembers, setTeamMembers] = useState<User[]>([])
  const [reviewer1, setReviewer1] = useState<string>('')
  const [reviewer2, setReviewer2] = useState<string>('')
  
  const handleAssign = async () => {
    await apiClient.assignReviewers(projectId, {
      reviewer1Id: reviewer1,
      reviewer2Id: reviewer2
    })
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Asignación de Revisores</CardTitle>
        <CardDescription>
          Cumplimiento PRISMA: Dos revisores independientes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label>Revisor 1</Label>
            <Select value={reviewer1} onValueChange={setReviewer1}>
              {teamMembers.map(m => (
                <SelectItem key={m.id} value={m.id}>
                  {m.fullName}
                </SelectItem>
              ))}
            </Select>
          </div>
          
          <div>
            <Label>Revisor 2</Label>
            <Select value={reviewer2} onValueChange={setReviewer2}>
              {teamMembers.filter(m => m.id !== reviewer1).map(m => (
                <SelectItem key={m.id} value={m.id}>
                  {m.fullName}
                </SelectItem>
              ))}
            </Select>
          </div>
          
          <Button onClick={handleAssign}>
            Asignar Revisores
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

### 1.4 Componente: Panel de Revisión por Revisor

**Archivo**: `frontend/components/screening/reviewer-panel.tsx`

```tsx
export function ReviewerPanel({ 
  reference, 
  reviewerNumber, // 1 o 2
  onSubmit 
}: ReviewerPanelProps) {
  const [decision, setDecision] = useState<'include' | 'exclude'>('include')
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  
  const handleSubmit = async () => {
    await apiClient.submitReview(reference.id, {
      reviewerNumber,
      decision,
      reason,
      notes
    })
    onSubmit()
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Revisión - Revisor {reviewerNumber}
        </CardTitle>
        <Badge variant={reviewerNumber === 1 ? 'default' : 'secondary'}>
          Independiente
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold">{reference.title}</h4>
          <p className="text-sm text-muted-foreground">{reference.abstract}</p>
        </div>
        
        <RadioGroup value={decision} onValueChange={setDecision}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="include" id="include" />
            <Label htmlFor="include">✅ Incluir</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="exclude" id="exclude" />
            <Label htmlFor="exclude">❌ Excluir</Label>
          </div>
        </RadioGroup>
        
        <Textarea
          placeholder="Justificación de la decisión..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        
        <Textarea
          placeholder="Notas adicionales (opcional)..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        
        <Button onClick={handleSubmit}>
          Enviar Revisión
        </Button>
      </CardContent>
    </Card>
  )
}
```

### 1.5 Componente: Resolución de Conflictos

**Archivo**: `frontend/components/screening/conflict-resolution-panel.tsx`

```tsx
export function ConflictResolutionPanel({ projectId }: { projectId: string }) {
  const [conflicts, setConflicts] = useState<Reference[]>([])
  
  useEffect(() => {
    loadConflicts()
  }, [projectId])
  
  const loadConflicts = async () => {
    const refs = await apiClient.getReferences(projectId)
    const conflicted = refs.filter(r => r.hasConflict && !r.conflictResolved)
    setConflicts(conflicted)
  }
  
  const handleResolve = async (refId: string, finalDecision: string, method: string) => {
    await apiClient.resolveConflict(refId, {
      finalDecision,
      resolutionMethod: method
    })
    loadConflicts()
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resolución de Conflictos</CardTitle>
        <CardDescription>
          {conflicts.length} referencias con decisiones divergentes
        </CardDescription>
      </CardHeader>
      <CardContent>
        {conflicts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <p>No hay conflictos pendientes</p>
          </div>
        ) : (
          <div className="space-y-4">
            {conflicts.map(ref => (
              <Card key={ref.id} className="border-amber-200">
                <CardHeader>
                  <CardTitle className="text-base">{ref.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-3 bg-blue-50 rounded">
                      <p className="text-xs font-semibold text-blue-700">Revisor 1</p>
                      <Badge variant={ref.reviewer1.decision === 'include' ? 'default' : 'destructive'}>
                        {ref.reviewer1.decision}
                      </Badge>
                      <p className="text-sm mt-2">{ref.reviewer1.reason}</p>
                    </div>
                    
                    <div className="p-3 bg-purple-50 rounded">
                      <p className="text-xs font-semibold text-purple-700">Revisor 2</p>
                      <Badge variant={ref.reviewer2.decision === 'include' ? 'default' : 'destructive'}>
                        {ref.reviewer2.decision}
                      </Badge>
                      <p className="text-sm mt-2">{ref.reviewer2.reason}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleResolve(ref.id, 'include', 'consensus')}
                      variant="outline"
                      size="sm"
                    >
                      ✅ Incluir (Consenso)
                    </Button>
                    <Button 
                      onClick={() => handleResolve(ref.id, 'exclude', 'consensus')}
                      variant="outline"
                      size="sm"
                    >
                      ❌ Excluir (Consenso)
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                    >
                      👥 Tercer Revisor
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

### 1.6 Métrica: Cohen's Kappa

**Archivo**: `frontend/components/screening/agreement-metrics.tsx`

```tsx
export function AgreementMetrics({ projectId }: { projectId: string }) {
  const [metrics, setMetrics] = useState({
    totalReviewed: 0,
    agreements: 0,
    disagreements: 0,
    cohensKappa: 0,
    percentAgreement: 0
  })
  
  useEffect(() => {
    calculateMetrics()
  }, [projectId])
  
  const calculateMetrics = async () => {
    const refs = await apiClient.getReferences(projectId)
    const reviewed = refs.filter(r => 
      r.reviewer1.decision && r.reviewer2.decision
    )
    
    const agreements = reviewed.filter(r => 
      r.reviewer1.decision === r.reviewer2.decision
    ).length
    
    const disagreements = reviewed.length - agreements
    const percentAgreement = (agreements / reviewed.length) * 100
    
    // Calcular Cohen's Kappa
    const kappa = calculateCohensKappa(reviewed)
    
    setMetrics({
      totalReviewed: reviewed.length,
      agreements,
      disagreements,
      cohensKappa: kappa,
      percentAgreement
    })
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Acuerdo Inter-Revisor</CardTitle>
        <CardDescription>Métricas de confiabilidad PRISMA</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-muted-foreground">Acuerdos</p>
            <p className="text-3xl font-bold text-green-900">{metrics.agreements}</p>
            <p className="text-xs text-green-600">{metrics.percentAgreement.toFixed(1)}%</p>
          </div>
          
          <div className="p-4 bg-amber-50 rounded-lg">
            <p className="text-sm text-muted-foreground">Desacuerdos</p>
            <p className="text-3xl font-bold text-amber-900">{metrics.disagreements}</p>
          </div>
          
          <div className="col-span-2 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-muted-foreground">Cohen's Kappa</p>
            <p className="text-4xl font-bold text-blue-900">{metrics.cohensKappa.toFixed(3)}</p>
            <p className="text-xs text-blue-600 mt-1">
              {metrics.cohensKappa > 0.8 ? 'Excelente' : 
               metrics.cohensKappa > 0.6 ? 'Sustancial' : 
               metrics.cohensKappa > 0.4 ? 'Moderado' : 'Bajo'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function calculateCohensKappa(references: Reference[]): number {
  // Implementación de Cohen's Kappa
  const n = references.length
  const observed = references.filter(r => 
    r.reviewer1.decision === r.reviewer2.decision
  ).length / n
  
  const includesR1 = references.filter(r => r.reviewer1.decision === 'include').length / n
  const excludesR1 = 1 - includesR1
  const includesR2 = references.filter(r => r.reviewer2.decision === 'include').length / n
  const excludesR2 = 1 - includesR2
  
  const expected = (includesR1 * includesR2) + (excludesR1 * excludesR2)
  
  return (observed - expected) / (1 - expected)
}
```

---

## 📊 Resumen de Archivos a Crear/Modificar

### Backend
1. `scripts/20-add-dual-review-fields.sql` - Migración BD
2. `backend/src/domain/models/reference.model.js` - Actualizar modelo
3. `backend/src/api/controllers/reference.controller.js` - Nuevos endpoints
4. `backend/src/infrastructure/repositories/reference.repository.js` - Queries

### Frontend
1. `frontend/components/screening/reviewer-assignment.tsx`
2. `frontend/components/screening/reviewer-panel.tsx`
3. `frontend/components/screening/conflict-resolution-panel.tsx`
4. `frontend/components/screening/agreement-metrics.tsx`
5. `frontend/app/projects/[id]/screening/page.tsx` - Actualizar

### Estimación
- **Tiempo**: 8-12 horas de desarrollo
- **Complejidad**: Media-Alta
- **Impacto**: CRÍTICO para PRISMA compliance

---

**Siguiente paso**: ¿Quieres que implemente estos componentes o prefieres que primero hagamos el plan para las Fases H, I, J?
