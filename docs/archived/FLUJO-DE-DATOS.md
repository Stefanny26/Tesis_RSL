# 🔄 Flujo de Datos - IA en Protocol Wizard

## 📊 Diagrama del Flujo

```
┌─────────────────────────────────────────────┐
│  Base de Datos PostgreSQL (tabla projects)  │
│  - id: "abc-123"                            │
│  - title: "Object Document Mapping..."      │
│  - description: "Esta revisión..."          │
└──────────────────┬──────────────────────────┘
                   │
                   ↓ (GET /api/projects/:id)
┌─────────────────────────────────────────────┐
│  Backend API (src/api/routes/project.js)    │
│  Devuelve el proyecto con título y desc.    │
└──────────────────┬──────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────┐
│  Frontend: lib/mock-data.ts                 │
│  (datos de ejemplo temporales)              │
│  export const mockProjects = [...]          │
└──────────────────┬──────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────┐
│  Page: app/projects/[id]/protocol/page.tsx  │
│                                             │
│  const project = mockProjects.find(...)     │
│                                             │
│  <ProtocolWizard                            │
│    projectId={params.id}                    │
│    projectTitle={project?.title || ""}      │ ← AQUÍ SE PASA
│    projectDescription={project?.desc || ""} │ ← AQUÍ SE PASA
│  />                                         │
└──────────────────┬──────────────────────────┘
                   │
                   ↓
┌────────────────────────────────────────────────────────────┐
│  Component: components/protocol/protocol-wizard.tsx        │
│                                                            │
│  export function ProtocolWizard({                          │
│    projectId,                                              │
│    projectTitle,      ← RECIBE                             │
│    projectDescription ← RECIBE                             │
│  }) {                                                      │
│                                                            │
│    // Pasa a cada paso:                                    │ 
│    {currentStep === 1 && (                                 │
│      <IsNotMatrixStep                                      │
│        projectTitle={projectTitle}          ← PASA         │
│        projectDescription={projectDescription} ← PASA      │
│      />                                                    │
│    )}                                                      │
│                                                            │
│    {currentStep === 2 && (                                 │
│      <PicoFrameworkStep                                    │
│        projectTitle={projectTitle}          ← PASA         │
│        projectDescription={projectDescription} ← PASA      │
│      />                                                    │
│    )}                                                      │
│                                                            │
│    {currentStep === 4 && (                                 │
│      <CriteriaStep                                         │
│        projectTitle={projectTitle}          ← PASA         │
│        projectDescription={projectDescription} ← PASA      │
│      />                                                    │
│    )}                                                      │
│                                                            │
│    {currentStep === 5 && (                                 │
│      <SearchStrategyStep                                   │
│        projectTitle={projectTitle}          ← PASA         │
│        projectDescription={projectDescription} ← PASA      │
│        researchQuestion={questions[0]}      ← PASA         │
│      />                                                    │
│    )}                                                      │
│  }                                                         │
└──────────────────┬─────────────────────────────────────────┘
                   │
                   ↓
┌──────────────────────────────────────────────────────────────┐
│  Pasos individuales (is-not-matrix-step.tsx, etc.)           │
│                                                              │
│  export function IsNotMatrixStep({                           │
│    projectTitle,      ← RECIBE                               │
│    projectDescription ← RECIBE                               │
│  }) {                                                        │
│                                                              │
│    const handleAIGeneration = async (provider) => {          │
│      // USA projectTitle y projectDescription                │
│      const result = await aiService.generateProtocolAnalysis(│
│        projectTitle,         ← USA AQUÍ                      │
│        projectDescription,   ← USA AQUÍ                      │
│        provider                                              │
│      )                                                       │
│    }                                                         │
│                                                              │
│    return (                                                  │
│      <Button onClick={() => handleAIGeneration('gemini')}>   │
│        Generar con IA                                        │
│      </Button>                                               │
│    )                                                         │
│  }                                                           │
└──────────────────┬───────────────────────────────────────────┘
                   │
                   ↓
┌──────────────────────────────────────────────────────────────┐
│  Frontend Service: lib/ai-service.ts                         │
│                                                              │
│  async generateProtocolAnalysis(                             │
│    title,         ← RECIBE                                   │
│    description,   ← RECIBE                                   │
│    aiProvider                                                │
│  ) {                                                         │
│    const response = await fetch(                             │
│      `${API_URL}/api/ai/protocol-analysis`,                  │
│      {                                                       │
│        method: 'POST',                                       │
│        body: JSON.stringify({                                │
│          title,          ← ENVÍA AL BACKEND                  │
│          description,    ← ENVÍA AL BACKEND                  │
│          aiProvider                                          │
│        })                                                    │
│      }                                                       │
│    )                                                         │
│  }                                                           │
└──────────────────┬───────────────────────────────────────────┘
                   │
                   ↓ (POST http://localhost:3001/api/ai/protocol-analysis)
┌──────────────────────────────────────────────────────────────┐
│  Backend Controller: src/api/controllers/ai.controller.js    │
│                                                              │
│  async function generateProtocolAnalysis(req, res) {         │
│    const { title, description, aiProvider } = req.body       │
│                      ↑            ↑                          │
│                   RECIBE       RECIBE                        │
│                                                              │
│    const useCase = new GenerateProtocolAnalysisUseCase(...)  │
│    const result = await useCase.execute(                     │
│      title,         ← USA                                    │
│      description,   ← USA                                    │
│      aiProvider                                              │
│    )                                                         │
│  }                                                           │
└──────────────────┬───────────────────────────────────────────┘
                   │
                   ↓
┌──────────────────────────────────────────────────────────────┐
│  Backend Use Case: generate-protocol-analysis.use-case.js    │
│                                                              │
│  async execute(title, description, aiProvider) {             │
│    if (aiProvider === 'gemini') {                            │
│      return await this.generateWithGemini(                   │
│        title,         ← USA EN EL PROMPT                     │
│        description    ← USA EN EL PROMPT                     │
│      )                                                       │
│    }                                                         │
│                                                              │
│    // Construye el prompt:                                   │
│    const prompt = `                                          │
│      Título: ${title}                                        │
│      Descripción: ${description}                             │
│                                                              │
│      Genera el análisis PRISMA completo...                   │
│    `                                                         │
│  }                                                           │
└──────────────────┬───────────────────────────────────────────┘
                   │
                   ↓
┌──────────────────────────────────────────────────────────────┐
│  API Externa: Gemini API                                     │
│  https://generativelanguage.googleapis.com/                  │
│                                                              │
│  POST /v1beta/models/gemini-pro:generateContent              │
│                                                              │
│  Genera el análisis PRISMA basado en el prompt               │
└──────────────────┬───────────────────────────────────────────┘
                   │
                   ↓ (Respuesta JSON)
                   │
         ┌─────────┴─────────┐
         │  Análisis PRISMA  │
         │  - Fase 1: PICO   │
         │  - Fase 2: Es/No  │
         │  - Fase 6: Criter.│
         │  - Fase 7: Búsq.  │
         └─────────┬─────────┘
                   │
                   ↓ (Regresa por toda la cadena)
                   │
         ┌─────────┴─────────────────────┐
         │  Frontend Component           │
         │  Muestra los resultados en UI │
         └───────────────────────────────┘
```

## 🎯 Resumen del Flujo

### 1. **Origen de los Datos**
```typescript
// app/projects/[id]/protocol/page.tsx
const project = mockProjects.find((p) => p.id === params.id)
// project = {
//   id: "1",
//   title: "Object Document Mapping with Mongoose...",
//   description: "Esta revisión sistemática tiene como objetivo..."
// }
```

### 2. **Se pasan al Wizard**
```typescript
<ProtocolWizard
  projectId={params.id}
  projectTitle={project?.title || ""}          // ← DATOS VIENEN DE AQUÍ
  projectDescription={project?.description || ""} // ← DATOS VIENEN DE AQUÍ
/>
```

### 3. **El Wizard los distribuye**
```typescript
// En cada paso del wizard:
<IsNotMatrixStep
  projectTitle={projectTitle}          // ← PASA LOS DATOS
  projectDescription={projectDescription} // ← PASA LOS DATOS
/>
```

### 4. **Los pasos usan los datos para IA**
```typescript
// is-not-matrix-step.tsx
const handleAIGeneration = async (provider) => {
  const result = await aiService.generateProtocolAnalysis(
    projectTitle,         // ← USA ESTOS DATOS
    projectDescription,   // ← USA ESTOS DATOS
    provider
  )
}
```

## ✅ Todo Está Conectado Correctamente

**SÍ**, el flujo está bien. Los datos fluyen así:

1. Base de datos → mockProjects
2. mockProjects → Page
3. Page → ProtocolWizard
4. ProtocolWizard → Pasos individuales
5. Pasos → AI Service → Backend → Gemini API

## 🔧 Únicos Problemas Actuales

1. ❌ **Modelo de Gemini incorrecto** → Ya lo arreglé a `gemini-pro`
2. ❌ **Backend no reiniciado** → Necesitas reiniciar para tomar cambios
3. ⚠️ **ChatGPT sin cuota** → Usa solo Gemini

## 🚀 Próximo Paso

Reinicia el backend para que tome el cambio del modelo.
