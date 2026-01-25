# FLUJOGRAMAS DEL SISTEMA RSL CON GATEKEEPER IA

**Fecha**: Enero 25, 2026  
**Autores**: Stefanny Mishel Hernández Buenaño, Adriana Pamela González Orellana  
**Tutor**: Ing. Paulo César Galarza Sánchez, MSc.  
**Institución**: Universidad de las Fuerzas Armadas ESPE

---

## 📋 ÍNDICE

1. [Flujo General del Sistema](#1-flujo-general-del-sistema)
2. [Flujo del Gatekeeper PRISMA](#2-flujo-del-gatekeeper-prisma-innovación-principal)
3. [Flujo de Cribado con IA](#3-flujo-de-cribado-con-ia)
4. [Flujo de Generación de Artículo](#4-flujo-de-generación-de-artículo)

---

## 1. FLUJO GENERAL DEL SISTEMA

### Diagrama de Flujo Completo

```mermaid
flowchart TD
    Start([Usuario inicia sesión]) --> CreateProject[Crear Proyecto]
    CreateProject --> Phase1[FASE 1: Protocolo PICO]
    
    Phase1 --> InputQuestion[Ingresar pregunta de investigación]
    InputQuestion --> PICO[IA genera análisis PICO]
    PICO --> Terms[IA genera términos del protocolo]
    Terms --> Criteria[IA genera criterios inclusión/exclusión]
    Criteria --> SearchStrings[IA genera cadenas de búsqueda]
    SearchStrings --> ProtocolComplete{¿Protocolo completo?}
    
    ProtocolComplete -->|No| InputQuestion
    ProtocolComplete -->|Sí| Phase2[FASE 2: Búsqueda y Cribado]
    
    Phase2 --> Import[Importar referencias<br/>BibTeX, RIS, CSV]
    Import --> Duplicates[Detección automática<br/>de duplicados]
    Duplicates --> Screen[Cribado con IA]
    
    Screen --> ScreenMethod{Método de cribado}
    ScreenMethod -->|Embeddings| EmbedScreen[Cribado con MiniLM-L6-v2<br/>Similitud semántica]
    ScreenMethod -->|LLM| LLMScreen[Cribado con ChatGPT<br/>Análisis contextual]
    
    EmbedScreen --> ManualReview[Revisión manual]
    LLMScreen --> ManualReview
    ManualReview --> PRISMADiagram[Generar diagrama PRISMA]
    PRISMADiagram --> Phase3[FASE 3: Validación PRISMA]
    
    Phase3 --> Gatekeeper[Gatekeeper IA<br/>27 ítems PRISMA]
    Gatekeeper --> AllValidated{¿27/27 ítems<br/>validados?}
    
    AllValidated -->|No| Gatekeeper
    AllValidated -->|Sí| Phase4[FASE 4: Artículo]
    
    Phase4 --> GenArticle[IA genera borrador<br/>desde PRISMA]
    GenArticle --> Review[Revisar y editar]
    Review --> Export[Exportar<br/>Word, PDF, LaTeX]
    Export --> End([Artículo completo])
    
    style Phase1 fill:#e3f2fd
    style Phase2 fill:#fff3e0
    style Phase3 fill:#f3e5f5
    style Phase4 fill:#e8f5e9
    style Gatekeeper fill:#ff9800,stroke:#e65100,stroke-width:3px
```

---

## 2. FLUJO DEL GATEKEEPER PRISMA (Innovación Principal)

### Diagrama Detallado del Gatekeeper

```mermaid
flowchart TD
    Start([Usuario en Fase 3:<br/>Validación PRISMA]) --> CheckItem[Verificar ítem actual]
    
    CheckItem --> Item1{¿Es ítem 1?}
    Item1 -->|Sí| Unlocked1[Ítem 1 desbloqueado 🔓]
    Item1 -->|No| CheckPrevious{¿Ítem anterior<br/>aprobado?}
    
    CheckPrevious -->|No| Locked[Ítem bloqueado 🔒<br/>Mensaje: Completa ítem anterior]
    Locked --> End1([No puede continuar])
    
    CheckPrevious -->|Sí| Unlocked[Ítem desbloqueado 🔓]
    Unlocked1 --> WriteContent[Usuario escribe contenido<br/>en editor]
    Unlocked --> WriteContent
    
    WriteContent --> ClickValidate[Clic en Validar con IA]
    ClickValidate --> CallAI[Llamar a ChatGPT gpt-4o-mini]
    
    CallAI --> SendPrompt[Enviar prompt específico<br/>del ítem + contenido usuario]
    SendPrompt --> AIAnalyze[IA analiza contra<br/>criterios PRISMA 2020]
    
    AIAnalyze --> AIDecision{Decisión de IA}
    
    AIDecision -->|APROBADO| Approved[✅ APROBADO<br/>Score: 85-100%]
    AIDecision -->|NECESITA_MEJORAS| NeedsWork[⚠️ NECESITA MEJORAS<br/>Score: 50-84%]
    AIDecision -->|RECHAZADO| Rejected[❌ RECHAZADO<br/>Score: 0-49%]
    
    Approved --> SaveStatus[Guardar estado APROBADO]
    SaveStatus --> UnlockNext[Desbloquear siguiente ítem]
    UnlockNext --> CheckComplete{¿Es ítem 27?}
    
    CheckComplete -->|No| NextItem[Permitir avanzar<br/>al ítem N+1]
    CheckComplete -->|Sí| Complete([✅ PRISMA Completo<br/>27/27 ítems])
    
    NeedsWork --> ShowFeedback[Mostrar feedback IA:<br/>- Problemas detectados<br/>- Sugerencias mejora]
    Rejected --> ShowFeedback
    
    ShowFeedback --> UserChoice{Usuario decide}
    UserChoice -->|Editar| WriteContent
    UserChoice -->|Forzar aprobación| Override[Usuario ingresa<br/>justificación]
    Override --> SaveStatus
    
    NextItem --> CheckItem
    
    style Approved fill:#4caf50,color:#fff
    style NeedsWork fill:#ff9800,color:#fff
    style Rejected fill:#f44336,color:#fff
    style Gatekeeper fill:#9c27b0,color:#fff
    style Complete fill:#00e676,color:#000
```

### Ejemplo Concreto del Gatekeeper

```mermaid
sequenceDiagram
    participant U as Usuario
    participant UI as Interfaz Web
    participant BE as Backend
    participant AI as ChatGPT gpt-4o-mini
    participant DB as PostgreSQL
    
    U->>UI: Escribe título: "Aplicaciones de IA en Educación"
    U->>UI: Clic en "Validar con IA"
    
    UI->>BE: POST /api/prisma/validate/item/1
    BE->>BE: Cargar prompt específico ítem 1
    
    Note over BE: Prompt Ítem 1:<br/>Verificar que título identifique<br/>como "revisión sistemática"
    
    BE->>AI: Enviar prompt + contenido usuario
    AI->>AI: Analizar según criterios PRISMA
    
    AI-->>BE: Respuesta JSON:<br/>{decision: "RECHAZADO",<br/>score: 30,<br/>reasoning: "No dice 'revisión sistemática'",<br/>suggestions: ["Agregar 'Revisión Sistemática'"]}
    
    BE-->>UI: Enviar validación
    UI-->>U: Mostrar feedback:<br/>❌ RECHAZADO<br/>Falta: "revisión sistemática"<br/>Sugerencia: Cambiar título
    
    U->>UI: Edita: "Aplicaciones de IA en Educación:<br/>Una Revisión Sistemática"
    U->>UI: Clic en "Validar con IA" nuevamente
    
    UI->>BE: POST /api/prisma/validate/item/1
    BE->>AI: Enviar prompt + nuevo contenido
    AI->>AI: Analizar nuevamente
    
    AI-->>BE: {decision: "APROBADO",<br/>score: 95,<br/>reasoning: "Cumple criterios PRISMA"}
    
    BE->>DB: UPDATE prisma_items<br/>SET status='APROBADO', ai_score=95
    BE->>DB: UPDATE prisma_items<br/>SET is_unlocked=TRUE<br/>WHERE item_number=2
    
    BE-->>UI: Validación exitosa
    UI-->>U: ✅ APROBADO<br/>Ítem 2 desbloqueado
```

---

## 3. FLUJO DE CRIBADO CON IA

### Comparación de Métodos

```mermaid
flowchart TD
    Start([Referencias importadas]) --> Choose{Método de cribado}
    
    Choose -->|Embeddings| EmbedPath[CRIBADO CON EMBEDDINGS]
    Choose -->|LLM| LLMPath[CRIBADO CON LLM]
    
    EmbedPath --> LoadModel[Cargar MiniLM-L6-v2<br/>modelo local]
    LoadModel --> EmbedProtocol[Generar embedding<br/>del protocolo PICO]
    EmbedProtocol --> LoopEmbed[Para cada referencia]
    
    LoopEmbed --> EmbedRef[Generar embedding<br/>título + abstract]
    EmbedRef --> CalcSim[Calcular similitud coseno]
    CalcSim --> Threshold{Similitud ≥ 70%?}
    
    Threshold -->|Sí| MarkInclude[Marcar INCLUIR]
    Threshold -->|No| MarkExclude[Marcar EXCLUIR]
    
    MarkInclude --> NextEmbed{¿Más referencias?}
    MarkExclude --> NextEmbed
    NextEmbed -->|Sí| LoopEmbed
    NextEmbed -->|No| ResultsEmbed[Resultados:<br/>- Rápido ~1-3 min/1000 refs<br/>- Costo: $0.00<br/>- Reproducible]
    
    LLMPath --> LoopLLM[Para cada referencia]
    LoopLLM --> BuildPrompt[Construir prompt con:<br/>- Protocolo PICO<br/>- Criterios I/E<br/>- Título + abstract ref]
    
    BuildPrompt --> CallChatGPT[Llamar ChatGPT gpt-4o-mini]
    CallChatGPT --> Analyze[IA analiza cumplimiento<br/>de criterios]
    Analyze --> LLMDecision{Decisión IA}
    
    LLMDecision -->|INCLUIR| MarkIncludeLLM[Marcar INCLUIR<br/>+ justificación]
    LLMDecision -->|EXCLUIR| MarkExcludeLLM[Marcar EXCLUIR<br/>+ razón]
    
    MarkIncludeLLM --> NextLLM{¿Más referencias?}
    MarkExcludeLLM --> NextLLM
    NextLLM -->|Sí| LoopLLM
    NextLLM -->|No| ResultsLLM[Resultados:<br/>- Lento ~20-30 min/1000 refs<br/>- Costo: ~$0.30/1000 refs<br/>- Alta precisión]
    
    ResultsEmbed --> Manual[Revisión manual<br/>obligatoria]
    ResultsLLM --> Manual
    
    Manual --> Final([Referencias clasificadas])
    
    style EmbedPath fill:#4caf50,color:#fff
    style LLMPath fill:#2196f3,color:#fff
    style ResultsEmbed fill:#81c784
    style ResultsLLM fill:#64b5f6
```

---

## 4. FLUJO DE GENERACIÓN DE ARTÍCULO

### De PRISMA a Artículo Científico

```mermaid
flowchart TD
    Start([27 ítems PRISMA<br/>validados]) --> CheckComplete{¿PRISMA<br/>completo?}
    
    CheckComplete -->|No| Block[Función bloqueada<br/>Completar PRISMA primero]
    Block --> End1([No puede generar])
    
    CheckComplete -->|Sí| ClickGen[Usuario: Clic en<br/>Generar Artículo]
    
    ClickGen --> LoadPRISMA[Cargar 27 ítems<br/>desde BD]
    LoadPRISMA --> LoadRefs[Cargar referencias<br/>incluidas]
    LoadRefs --> LoadRQS[Cargar datos RQS<br/>extraídos]
    
    LoadRQS --> BuildPrompt[Construir prompt maestro:<br/>- PRISMA completo<br/>- Estadísticas cribado<br/>- RQS entries<br/>- Plantilla IMRaD]
    
    BuildPrompt --> CallAI[Llamar ChatGPT gpt-4o-mini<br/>Temperature: 0.7<br/>Max tokens: 8000]
    
    CallAI --> GenSections[IA genera secciones]
    
    GenSections --> Abstract[Abstract<br/>250-300 palabras]
    GenSections --> Intro[Introduction<br/>Marco teórico + Gap]
    GenSections --> Methods[Methods<br/>Protocolo PICO +<br/>Estrategia búsqueda +<br/>Proceso cribado]
    GenSections --> Results[Results<br/>Diagrama PRISMA +<br/>Características estudios +<br/>Síntesis hallazgos]
    GenSections --> Discussion[Discussion<br/>Interpretación +<br/>Limitaciones +<br/>Implicaciones]
    GenSections --> Conclusion[Conclusion<br/>Resumen + Futuro]
    
    Abstract --> Assemble[Ensamblar artículo completo]
    Intro --> Assemble
    Methods --> Assemble
    Results --> Assemble
    Discussion --> Assemble
    Conclusion --> Assemble
    
    Assemble --> GenerateCharts[Generar gráficos<br/>con Python matplotlib:<br/>- Diagrama PRISMA<br/>- Tabla búsqueda<br/>- Scree plot]
    
    GenerateCharts --> SaveVersion[Guardar versión 1.0<br/>en article_versions]
    
    SaveVersion --> ShowEditor[Mostrar en editor<br/>WYSIWYG]
    
    ShowEditor --> UserReview{Usuario revisa}
    
    UserReview -->|Editar| EditManual[Editar manualmente]
    EditManual --> SaveNewVersion[Guardar nueva versión]
    SaveNewVersion --> ShowEditor
    
    UserReview -->|Exportar| ExportChoice{Formato}
    
    ExportChoice -->|Word| ExportWord[Generar .docx]
    ExportChoice -->|PDF| ExportPDF[Generar .pdf]
    ExportChoice -->|LaTeX| ExportLaTeX[Generar .tex]
    ExportChoice -->|Markdown| ExportMD[Generar .md]
    
    ExportWord --> Download[Descargar archivo]
    ExportPDF --> Download
    ExportLaTeX --> Download
    ExportMD --> Download
    
    Download --> End2([Artículo completo])
    
    style GenSections fill:#9c27b0,color:#fff
    style GenerateCharts fill:#ff9800,color:#fff
    style Download fill:#4caf50,color:#fff
```

---

## 5. ARQUITECTURA DEL GATEKEEPER

### Componentes del Sistema

```mermaid
graph TB
    subgraph Frontend["Frontend (Next.js 14 + React 19)"]
        UI[Interfaz de Usuario<br/>Editor PRISMA]
        ValidateBtn[Botón: Validar con IA]
        Feedback[Panel de Feedback]
    end
    
    subgraph Backend["Backend (Node.js 20 + Express 4.18)"]
        API[API REST<br/>POST /api/prisma/validate]
        Controller[PRISMA Controller<br/>validateWithAI()]
        Prompts[27 Prompts<br/>prisma-validation-prompts.js]
    end
    
    subgraph AI["Servicios IA"]
        ChatGPT[ChatGPT gpt-4o-mini<br/>OpenAI API]
        Embeddings[MiniLM-L6-v2<br/>Local @xenova/transformers]
    end
    
    subgraph Database["Base de Datos (PostgreSQL 15)"]
        PrismaTable[(Tabla: prisma_items<br/>- item_number<br/>- content<br/>- status<br/>- ai_score<br/>- is_unlocked)]
    end
    
    UI --> ValidateBtn
    ValidateBtn --> API
    API --> Controller
    Controller --> Prompts
    Prompts --> ChatGPT
    ChatGPT --> Controller
    Controller --> PrismaTable
    PrismaTable --> Controller
    Controller --> API
    API --> Feedback
    Feedback --> UI
    
    style ChatGPT fill:#00a67e,color:#fff
    style Prompts fill:#ff6b6b,color:#fff
    style PrismaTable fill:#4dabf7,color:#fff
```

---

## 6. MÉTRICAS Y ESTADÍSTICAS

### KPIs del Gatekeeper

```mermaid
graph LR
    subgraph Métricas["Métricas de Validación"]
        A[Precisión IA<br/>Target: 85-95%]
        B[Tiempo validación<br/>3-5 segundos/ítem]
        C[Tasa aprobación<br/>primera vez: ~60%]
        D[Iteraciones promedio<br/>1.5 por ítem]
    end
    
    subgraph Beneficios["Beneficios vs Manual"]
        E[Reducción tiempo<br/>Semanas → Horas]
        F[Consistencia<br/>100% criterios PRISMA]
        G[Feedback inmediato<br/>vs semanas de revisión]
        H[Trazabilidad completa<br/>Cada decisión registrada]
    end
    
    Métricas --> Beneficios
    
    style A fill:#4caf50
    style B fill:#2196f3
    style C fill:#ff9800
    style D fill:#9c27b0
    style E fill:#00bcd4
    style F fill:#4caf50
    style G fill:#ff5722
    style H fill:#3f51b5
```

---

## 7. INNOVACIÓN CIENTÍFICA

### Contribución de la Tesis

```mermaid
mindmap
  root((Gatekeeper<br/>PRISMA IA))
    Innovación 1
      Primera aplicación de IA generativa<br/>para validación metodológica
      Sistema secuencial con desbloqueo<br/>progresivo
      27 prompts especializados<br/>uno por ítem PRISMA
    Innovación 2
      Feedback accionable inmediato
      Reduce tiempo validación<br/>semanas → horas
      Garantiza cumplimiento 100%<br/>estándar PRISMA 2020
    Innovación 3
      Arquitectura escalable<br/>Backend + Frontend
      Costo operacional mínimo<br/>~$0.08/proyecto
      Open source para comunidad<br/>académica
    Validación
      Experimento con 2000 ejemplos<br/>10 ítems × 200 casos
      F1-Score objetivo ≥ 0.80
      Comparación vs evaluadores<br/>humanos expertos
```

---

## 📝 NOTAS PARA LA REVISORA

### Puntos Clave a Destacar

1. **Gatekeeper es la innovación central**: Sistema automatizado de validación PRISMA nunca antes implementado con IA generativa.

2. **Desbloqueo secuencial garantiza calidad**: No se puede avanzar sin aprobar cada ítem, forzando cumplimiento metodológico riguroso.

3. **Feedback explicativo**: La IA no solo rechaza, sino que explica QUÉ falta y CÓMO corregirlo.

4. **Validación experimental**: Se incluye experimento científico (Anexo C) con 2,000 ejemplos para medir precisión vs humanos.

5. **Costo accesible**: Solo ~$0.08 por proyecto usando ChatGPT gpt-4o-mini + embeddings locales gratuitos.

6. **Impacto**: Reduce tiempo de validación PRISMA de semanas a horas, democratizando RSL de calidad.

---

## 🎓 CONCLUSIÓN

Este sistema representa la **primera implementación documentada** de un gatekeeper de IA para validación automatizada de revisiones sistemáticas siguiendo el estándar PRISMA 2020.

La combinación de:
- ✅ Validación secuencial obligatoria
- ✅ Feedback inmediato y accionable  
- ✅ 27 prompts especializados
- ✅ Arquitectura web escalable
- ✅ Bajo costo operacional

Constituye una **contribución científica significativa** al área de metodología de investigación y sistemas de información.

---

**Elaborado por**:  
Stefanny Mishel Hernández Buenaño - smhernandez2@espe.edu.ec  
Adriana Pamela González Orellana - apgonzales1@espe.edu.ec

**Tutor**:  
Ing. Paulo César Galarza Sánchez, MSc. - pcgalarza@espe.edu.ec

**Universidad de las Fuerzas Armadas ESPE**  
Departamento de Ciencias de la Computación  
Enero 25, 2026
