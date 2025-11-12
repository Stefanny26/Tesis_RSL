# 🎯 Wizard de Protocolo de Investigación - Nueva Arquitectura

## 📋 Descripción

Sistema completo de creación de protocolos de revisión sistemática siguiendo metodología Cochrane/PRISMA, con asistencia de IA en cada paso.

## 🏗️ Estructura

```
components/project-wizard/
├── wizard-context.tsx          # Context global del wizard (estado compartido)
├── wizard-header.tsx            # Header sticky con progreso
├── wizard-navigation.tsx        # Footer con botones Back/Next/Cancelar
└── steps/
    ├── 1-proposal-step.tsx     # Propuesta breve del proyecto
    ├── 2-pico-matrix-step.tsx  # Marco PICO + Matriz Es/No Es
    ├── 3-titles-step.tsx       # Generación de 5 títulos con IA
    ├── 4-search-plan-step.tsx  # Estrategia de búsqueda + Criterios
    ├── 5-screening-step.tsx    # Cribado de referencias
    ├── 6-prisma-check-step.tsx # Checklist PRISMA/WPOM (13 ítems)
    └── 7-confirmation-step.tsx # Confirmación y guardado final
```

## 🚀 Flujo de 7 Pasos

### Paso 1: Propuesta Breve
- **Input:** Nombre del proyecto + Descripción (1-2 frases)
- **Objetivo:** Entrada mínima para iniciar
- **Salida:** Contexto base para IA

### Paso 2: PICO + Matriz Es/No Es
- **Input:** Botón "Generar con IA" (Gemini/ChatGPT)
- **Objetivo:** Estructurar pregunta y delimitar alcance
- **Salida:** 
  - Marco PICO completo (P, I, C, O)
  - Listas ES/NO ES editables
- **PRISMA resuelto:** Items 3, 4, 5 (parcial)

### Paso 3: Generación de Títulos
- **Input:** PICO + Matriz del paso anterior
- **Objetivo:** Generar 5 opciones de títulos académicos
- **Salida:** 
  - 5 títulos con justificación
  - Badge de cumplimiento Cochrane
  - Título seleccionado editable
- **PRISMA resuelto:** Item 1 (Title)

### Paso 4: Plan de Búsqueda + Criterios
- **Input:** Selección de bases de datos + Rango temporal
- **Objetivo:** Crear cadenas específicas por BD y criterios I/E
- **Salida:**
  - Tabla con cadenas adaptadas (Scopus, IEEE, ACM, etc.)
  - Listas de criterios de inclusión/exclusión
- **PRISMA resuelto:** Items 5 (formal), 6, 7

### Paso 5: Cribado de Referencias (Screening)
- **Input:** Importar JSON con referencias
- **Objetivo:** Etiquetar referencias como Incluir/Excluir/Dudoso
- **Salida:**
  - Estadísticas (total, pendientes, incluidas, excluidas, dudosas)
  - Referencias categorizadas
- **PRISMA resuelto:** Items 8, 16 (datos de selección)

### Paso 6: Verificación PRISMA
- **Input:** Botón "Auto-evaluar" extrae evidencias de pasos anteriores
- **Objetivo:** Completar checklist de calidad
- **Salida:**
  - 13 ítems WPOM con evidencias
  - Porcentaje de cumplimiento
- **PRISMA resuelto:** Items 1, 2, 10-15, 17-22, 24-27

### Paso 7: Confirmación Final
- **Input:** Revisión de todo el protocolo
- **Objetivo:** Guardar proyecto completo
- **Salida:**
  - Resumen visual (PICO, Matriz, Estadísticas)
  - Exportar JSON
  - Crear proyecto en base de datos

## 🔄 Context API

### WizardContext

```typescript
interface WizardData {
  projectName: string
  projectDescription: string
  pico: { population, intervention, comparison, outcome }
  matrixIsNot: { is: string[], isNot: string[] }
  generatedTitles: Array<{ title, justification, cochraneCompliance }>
  selectedTitle: string
  searchPlan: { databases, keywords, temporalRange }
  inclusionCriteria: string[]
  exclusionCriteria: string[]
  references: Array<{ id, title, authors, year, abstract, status }>
  screeningStats: { total, pending, included, excluded, doubt }
  prismaItems: Array<{ number, item, complies, evidence, stage }>
  aiProvider: 'chatgpt' | 'gemini'
  lastSaved: Date | null
  currentStep: number
}
```

### Hooks disponibles

```typescript
const { data, updateData, resetData, currentStep, setCurrentStep, totalSteps } = useWizard()
```

## 🎨 Componentes Principales

### WizardHeader
- Breadcrumbs con 7 pasos
- Barra de progreso
- Botón "Guardar borrador"
- Link "Volver al Dashboard"

### WizardNavigation
- Botón "Cancelar" con AlertDialog de confirmación
- Botón "Atrás" (habilitado desde paso 2)
- Botón "Siguiente" con validación
- Auto-scroll al cambiar de paso

### Validaciones por Paso

1. **Paso 1:** Nombre y descripción requeridos
2. **Paso 2:** PICO (P, I, O obligatorios) + Matriz (mín 1 ES y 1 NO ES)
3. **Paso 3:** Título seleccionado
4. **Paso 4:** Al menos 1 cadena generada
5. **Paso 5:** Sin validación (opcional)
6. **Paso 6:** Sin validación (opcional)
7. **Paso 7:** Botón final "Guardar y Crear Proyecto"

## 🔗 Integración con Backend

### Endpoints usados

```typescript
// Paso 2
apiClient.generateProtocolAnalysis(projectName, projectDescription, aiProvider)

// Paso 3
apiClient.generateTitles(matrixData, picoData, aiProvider)

// Paso 4
apiClient.generateSearchStrategies(matrixData, picoData, databases, keyTerms, aiProvider)

// Paso 7
apiClient.createProject({ title, description })
```

## 💾 Guardado de Borradores

El botón "Guardar borrador" en el header guarda el estado completo en localStorage:

```typescript
localStorage.setItem('project-wizard-draft', JSON.stringify({
  data: wizardData,
  timestamp: new Date().toISOString()
}))
```

Para recuperar un borrador (implementar en futuro):

```typescript
const draft = JSON.parse(localStorage.getItem('project-wizard-draft'))
if (draft) {
  updateData(draft.data)
}
```

## 🎯 Mapeo PRISMA por Etapa

| Etapa | Items PRISMA Completados |
|-------|--------------------------|
| Paso 2 (PICO/Matriz) | 3, 4, 5 (parcial) |
| Paso 4 (Búsqueda) | 5 (formal), 6, 7 |
| Paso 5 (Screening) | 8, 16 (datos) |
| Paso 6 (PRISMA Check) | 1, 2, 10-15, 17-22, 24-27 |

## 📊 Exportación de Datos

El paso 7 permite exportar todo el protocolo en formato JSON:

```json
{
  "metadata": {
    "exportDate": "ISO-8601",
    "projectName": "...",
    "aiProvider": "gemini"
  },
  "project": { "title", "description", "pico", "matrix" },
  "search": { "databases", "temporalRange", "criteria" },
  "screening": { "stats", "references" },
  "prisma": { "items", "compliance": 85 }
}
```

## 🚀 Cómo Usar

1. Usuario va a `/new-project`
2. Completa Paso 1 (propuesta breve)
3. En Paso 2, hace clic en "Generar PICO + Matriz"
4. IA analiza y rellena campos (usuario puede editar)
5. En Paso 3, genera 5 títulos y selecciona uno
6. En Paso 4, selecciona bases de datos y genera cadenas
7. En Paso 5, importa referencias JSON y las etiqueta
8. En Paso 6, usa "Auto-evaluar" para verificar PRISMA
9. En Paso 7, revisa resumen y hace clic en "Guardar y Crear Proyecto"
10. Redirige a `/projects/{id}/protocol`

## 🛠️ Mejoras Futuras

- [ ] Recuperación automática de borradores al abrir `/new-project`
- [ ] Active learning en screening (paso 5)
- [ ] Compartir protocolo con colaboradores (paso 7)
- [ ] Exportar a formato Markdown y CSV
- [ ] Diagrama de flujo PRISMA automático
- [ ] Integración con APIs de búsqueda (IEEE, Scopus, etc.)
- [ ] Sugerencias de keywords con embeddings
- [ ] Comparación de múltiples borradores

## 📝 Notas de Implementación

- **No usar** `research-wizard.tsx` ni `project-wizard.tsx` viejos
- Toda la lógica está en `components/project-wizard/`
- El estado es inmutable (usa `updateData()` para cambios)
- Cada paso es independiente y puede reutilizarse
- La navegación es manejada por `WizardNavigation`
- El header es sticky para siempre estar visible

## 🧪 Testing

Para probar el wizard completo:

```bash
cd frontend
npm run dev
```

Navegar a: `http://localhost:3000/new-project`

Completar los 7 pasos y verificar:
- [x] Generación con IA funciona
- [x] Validaciones por paso funcionan
- [x] Navegación Back/Next funciona
- [x] Guardar borrador guarda en localStorage
- [x] Cancelar muestra confirmación
- [x] Exportar JSON descarga archivo
- [x] Guardar proyecto crea en BD y redirige
