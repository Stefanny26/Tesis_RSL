# Capítulo III: Metodología, Diseño y Documentación de Software

## Sistema Web para Gestión y Automatización de Revisiones Sistemáticas de Literatura

---

## 1. TECNOLOGÍAS RECOMENDADAS

### 1.1 Frontend
| Tecnología | Versión | Justificación |
|------------|---------|---------------|
| **Next.js** | 14.2.x | Framework React con SSR, optimización automática, routing file-based |
| **React** | 19.x | Biblioteca UI moderna, componentes reutilizables, ecosistema maduro |
| **TypeScript** | 5.x | Tipado estático, reducción de errores, mejor mantenibilidad |
| **shadcn/ui** | Latest | Sistema de componentes accesible, personalizable, Radix UI |
| **TailwindCSS** | 3.x | Utilidades CSS, diseño responsivo, desarrollo ágil |
| **Lucide React** | Latest | Iconografía moderna, consistente, tree-shakeable |
| **TanStack Query** | 5.x | Gestión de estado servidor, caché inteligente, sincronización |
| **React Hook Form** | 7.x | Manejo de formularios complejos, validación, rendimiento |
| **Recharts** | 2.x | Visualizaciones interactivas para estadísticas PRISMA |

### 1.2 Backend
| Tecnología | Versión | Justificación |
|------------|---------|---------------|
| **Node.js** | 20.x LTS | Runtime JavaScript, ecosistema npm, compatibilidad IA |
| **Express.js** | 4.x | Framework minimalista, middleware flexible, amplia adopción |
| **Passport.js** | 0.7.x | Autenticación modular (JWT, OAuth2, Local) |
| **JWT** | 9.x | Tokens stateless, seguridad API REST |
| **bcrypt** | 5.x | Hash seguro de contraseñas, resistente a rainbow tables |
| **Axios** | 1.x | Cliente HTTP para APIs externas (Scopus, PubMed) |
| **pdf-parse** | 1.x | Extracción de texto de PDFs para análisis |
| **mammoth** | 1.x | Conversión de DOCX a texto plano |
| **xlsx** | 0.18.x | Lectura/escritura de archivos Excel para reportes |
| **csv-parser** | 3.x | Importación de referencias bibliográficas |
| **Papa Parse** | 5.x | Parser CSV robusto, manejo de grandes volúmenes |

### 1.3 Base de Datos
| Tecnología | Versión | Justificación |
|------------|---------|---------------|
| **PostgreSQL** | 15.x | RDBMS robusto, ACID, extensiones avanzadas |
| **pgvector** | 0.5.x | Extensión para embeddings vectoriales, búsqueda semántica |
| **pg (node-postgres)** | 8.x | Driver nativo PostgreSQL para Node.js |
| **Redis** (opcional) | 7.x | Caché de sesiones, rate limiting, colas de tareas |

### 1.4 ORMs y Query Builders
| Tecnología | Versión | Justificación |
|------------|---------|---------------|
| **Raw SQL + pg** | - | Control total, rendimiento óptimo, consultas complejas |
| **Knex.js** (alternativa) | 3.x | Query builder flexible, migraciones, transacciones |

**Decisión arquitectónica:** Raw SQL para máximo control y rendimiento en operaciones vectoriales (pgvector).

### 1.5 APIs Externas e Integraciones

#### APIs de Inteligencia Artificial
| API | Modelo | Propósito |
|-----|--------|-----------|
| **Google Gemini** | gemini-2.0-flash-exp | Análisis PICO, generación de criterios, screening rápido |
| **OpenAI ChatGPT** | gpt-4o-mini | Análisis complejo, síntesis de evidencias, validación cruzada |
| **Sentence Transformers** | paraphrase-MiniLM-L6-v2 | Embeddings semánticos (384 dims), clasificación automática |

#### APIs Académicas
| API | Propósito | Límites/Consideraciones |
|-----|-----------|------------------------|
| **Scopus API** | Búsqueda automatizada, metadatos completos | API Key institucional, 20,000 req/semana |
| **IEEE Xplore API** | Literatura ingeniería/computación | API Key gratuita, rate limiting |
| **PubMed E-utilities** | Literatura biomédica, acceso gratuito | 3 req/segundo sin API Key, 10 req/s con Key |
| **Crossref API** | Metadatos DOI, referencias citadas | Acceso gratuito, plus con email identificador |
| **Unpaywall API** | Acceso a versiones OA de artículos | Gratuito, requiere email válido |

#### Integración Manual (sin API oficial)
| Fuente | Método de Integración |
|--------|----------------------|
| **Google Scholar** | Upload CSV exportado desde Publish or Perish |
| **Web of Science** | Import de archivos .ris/.bib |
| **ACM Digital Library** | Import CSV/BibTeX manual |
| **Springer Link** | Import CSV/BibTeX manual |

### 1.6 Librerías de IA y Machine Learning
| Librería | Versión | Propósito |
|----------|---------|-----------|
| **@xenova/transformers** | 2.x | Embeddings en el navegador (opcional) |
| **langchain** | 0.1.x | Orquestación LLM, chains, agentes |
| **tiktoken** | 1.x | Conteo de tokens, optimización de prompts |

### 1.7 Seguridad y Autenticación
| Tecnología | Propósito |
|-----------|-----------|
| **Helmet.js** | Headers de seguridad HTTP |
| **express-rate-limit** | Rate limiting contra ataques DDoS |
| **cors** | Control de CORS, whitelist de orígenes |
| **express-validator** | Validación y sanitización de inputs |
| **crypto (Node.js)** | Cifrado de datos sensibles |
| **dotenv** | Gestión segura de variables de entorno |

### 1.8 Despliegue y DevOps
| Tecnología | Propósito |
|-----------|-----------|
| **Vercel** | Hosting frontend (Next.js), CI/CD automático |
| **Railway / Render** | Hosting backend (Node.js + PostgreSQL) |
| **Supabase** (alternativa) | BaaS con PostgreSQL + Auth + Storage |
| **Docker** | Contenedores, entornos reproducibles |
| **GitHub Actions** | CI/CD, testing automatizado |
| **PM2** | Process manager para Node.js en producción |

---

## 2. MÓDULOS DEL SISTEMA

### 2.1 Módulo de Autenticación y Gestión de Usuarios
**Funcionalidades:**
- Registro de usuarios con validación de email
- Login con credenciales (email/contraseña)
- OAuth2 con Google/Microsoft (opcional)
- Recuperación de contraseña
- Gestión de perfil de usuario
- Roles: Investigador principal, Colaborador, Revisor, Admin

**Tecnologías:** Passport.js, JWT, bcrypt

---

### 2.2 Módulo de Gestión de Proyectos RSL
**Funcionalidades:**
- Crear/editar/eliminar proyectos de revisión
- Asignar colaboradores con roles
- Dashboard con estadísticas globales
- Gestión de fases (Protocolo → Búsqueda → Screening → Extracción → Síntesis)
- Historial de actividad (activity log)
- Exportar proyecto completo (ZIP con todos los archivos)

**Estructura de datos:**
```sql
projects (id, owner_id, title, description, status, created_at)
project_members (project_id, user_id, role, permissions)
```

---

### 2.3 Módulo PICO y Formulación de Pregunta
**Funcionalidades:**
- Asistente interactivo para definir PICO
  - **P**opulation (población objetivo)
  - **I**ntervention (intervención/tecnología)
  - **C**omparison (comparación/control)
  - **O**utcome (resultados esperados)
- Generación de pregunta de investigación estructurada
- Validación con IA (claridad, especificidad, alcance)
- Generación automática de títulos candidatos
- Matriz "Es / No Es" para acotar el alcance

**IA:** Gemini/ChatGPT para sugerencias y validación

---

### 2.4 Módulo de Definición de Protocolo
**Funcionalidades:**
- Definición de términos clave (tecnología, dominio, focos temáticos)
- Normalización y detección de duplicados en términos
- Generación automática de sinónimos con IA
- Definición de criterios de inclusión/exclusión (6 categorías):
  1. Cobertura temática
  2. Tecnologías abordadas
  3. Tipo de estudio
  4. Tipo de documento
  5. Rango temporal
  6. Idioma
- Generación de protocolo completo en formato exportable

**Salida:** Documento protocolo PDF/DOCX con metodología PRISMA

---

### 2.5 Módulo de Estrategia de Búsqueda
**Funcionalidades:**
- Selección de bases de datos académicas (8 soportadas)
- Generación automática de cadenas de búsqueda por base de datos:
  - Scopus: `TITLE-ABS-KEY(query)`
  - Web of Science: `TS=(query)`
  - PubMed: `term[TIAB]`
  - IEEE/ACM/Springer: Boolean simple
- Adaptación de sintaxis específica por motor
- Validación de sintaxis antes de ejecutar
- Contador de resultados estimados (API)
- Exportar estrategia de búsqueda (para documentación de metodología)

**Bases de datos soportadas:**
1. Scopus (API) ✅
2. IEEE Xplore (API) ⏳
3. PubMed (API) ⏳
4. Web of Science (API) ⏳
5. Google Scholar (manual)
6. ACM Digital Library (manual)
7. Springer Link (manual)
8. ScienceDirect (API) ⏳

---

### 2.6 Módulo de Importación de Referencias
**Funcionalidades:**
- **Búsqueda automatizada via API:**
  - Conexión directa con Scopus, IEEE, PubMed
  - Ejecución de queries y guardado automático
  - Paginación de resultados (25-100 por página)
  - Rate limiting inteligente
- **Importación manual:**
  - Upload de archivos CSV, RIS, BibTeX, EndNote XML
  - Parser robusto con validación de campos
  - Mapeo automático de columnas
- **Deduplicación inteligente:**
  - Por DOI (prioridad 1)
  - Por título normalizado + primer autor + año (prioridad 2)
  - Detección de similitud semántica (Levenshtein distance > 0.9)
- **Enriquecimiento de metadatos:**
  - Obtención de DOI faltantes via Crossref
  - Descarga de abstracts desde APIs
  - Identificación de versiones Open Access (Unpaywall)

**Formatos soportados:**
- CSV (columnas: title, authors, year, journal, doi, abstract, keywords)
- RIS (Reference Manager format)
- BibTeX (.bib)
- EndNote XML

---

### 2.7 Módulo de Screening (Cribado)
**Funcionalidades:**
- **Screening por título/abstract:**
  - Vista de tabla con filtros avanzados
  - Estados: Pendiente, Incluida, Excluida, Duplicada, En revisión
  - Acciones bulk (incluir/excluir múltiples)
  - Asignación de revisores
- **Screening automatizado con IA:**
  - **Método 1:** Embeddings semánticos (paraphrase-MiniLM-L6-v2)
    - Generar embedding del protocolo
    - Calcular similitud coseno con cada referencia
    - Umbral configurable (0.5-0.8)
  - **Método 2:** LLM (Gemini/ChatGPT)
    - Análisis de relevancia con criterios I/E
    - Justificación de decisión (incluir/excluir)
    - Confidence score
- **Screening colaborativo:**
  - Asignación de referencias a revisores
  - Doble ciego (2+ revisores por referencia)
  - Resolución de conflictos (tercero en discordia)
  - Cálculo de Cohen's Kappa (acuerdo inter-revisor)
- **Visualización PRISMA Flow:**
  - Diagrama de flujo interactivo
  - Conteo automático por fase
  - Exportar imagen PNG/SVG

**Estados de referencia:**
```
pending → screening → (included | excluded | duplicated)
included → full_text_review → (included_final | excluded_final)
```

---

### 2.8 Módulo de Revisión de Texto Completo
**Funcionalidades:**
- Upload de PDFs de artículos incluidos
- Extracción de texto con pdf-parse
- Visor de PDF embebido
- Checklist de criterios de elegibilidad
- Anotaciones y resaltado de texto
- Decisión final: Incluir / Excluir + motivo
- Tracking de progreso (X de Y artículos revisados)

**Almacenamiento:** PostgreSQL bytea o servicio externo (S3, Supabase Storage)

---

### 2.9 Módulo de Extracción de Datos
**Funcionalidades:**
- Definición de plantilla de extracción personalizada:
  - Autor, Año, País, Metodología
  - Variables de estudio, Resultados clave
  - Nivel de evidencia, Riesgo de sesgo
- Formulario dinámico por referencia
- Asistencia con IA para extracción automática:
  - Prompt: "Extrae de este abstract: metodología, resultados, conclusiones"
  - Validación manual posterior
- Exportar datos extraídos a Excel/CSV
- Vista de tabla consolidada con filtros

**Tabla en BD:**
```sql
extracted_data (
  id, reference_id, field_name, field_value, extracted_by, extracted_at
)
```

---

### 2.10 Módulo de Síntesis y Análisis
**Funcionalidades:**
- Agrupación por temática/metodología
- Generación de tablas de evidencia
- Análisis cualitativo con IA:
  - Identificación de patrones/tendencias
  - Síntesis narrativa automatizada
  - Detección de gaps en la literatura
- Visualizaciones:
  - Gráfico de distribución temporal
  - Nube de palabras clave
  - Mapa de co-ocurrencias
- Meta-análisis básico (estadísticas descriptivas)

**IA:** ChatGPT-4o-mini para síntesis narrativa compleja

---

### 2.11 Módulo de Reportes y Exportación
**Funcionalidades:**
- Generación automática de reportes PDF:
  - Informe completo PRISMA
  - Checklist PRISMA 2020
  - Diagrama de flujo
  - Tablas de evidencia
- Exportar referencias en múltiples formatos:
  - BibTeX, EndNote, RIS, CSV
- Exportar datos extraídos a Excel con formato
- Plantillas de reporte personalizables
- Estadísticas del proyecto:
  - Artículos por año, revista, país
  - Metodologías más usadas
  - Distribución de niveles de evidencia

**Librería:** jsPDF o Puppeteer para generación de PDFs

---

### 2.12 Módulo de Validación PRISMA
**Funcionalidades:**
- Checklist interactivo PRISMA 2020 (27 ítems)
- Validación automática de cumplimiento
- Identificación de secciones faltantes
- Sugerencias de mejora con IA
- Score de completitud (0-100%)
- Exportar checklist completado

**Referencia:** PRISMA 2020 Statement (Page et al., 2021)

---

### 2.13 Módulo de Administración
**Funcionalidades:**
- Dashboard de métricas globales
- Gestión de usuarios y permisos
- Logs de actividad del sistema
- Monitoreo de uso de APIs (OpenAI, Gemini, Scopus)
- Gestión de cuotas y límites
- Respaldo y restauración de proyectos

---

## 3. REQUERIMIENTOS FUNCIONALES

### RF-01: Gestión de Usuarios
El sistema debe permitir el registro de usuarios mediante email y contraseña, con validación por correo electrónico. Debe soportar autenticación OAuth2 con Google y Microsoft. Los usuarios deben poder recuperar contraseñas mediante token temporal enviado por email.

### RF-02: Creación y Gestión de Proyectos RSL
El sistema debe permitir crear proyectos de revisión sistemática con título, descripción, área de investigación y estado (borrador, activo, finalizado). Debe permitir asignar colaboradores con roles diferenciados (investigador principal, revisor, observador).

### RF-03: Asistente PICO Guiado
El sistema debe proporcionar un asistente paso a paso para definir el marco PICO (Población, Intervención, Comparación, Resultado), con validación de campos obligatorios y sugerencias contextuales generadas por IA.

### RF-04: Generación Automática de Protocolo
El sistema debe generar automáticamente un documento de protocolo estructurado basándose en los datos PICO, criterios I/E y estrategia de búsqueda, exportable en formato PDF siguiendo lineamientos PRISMA.

### RF-05: Generación de Cadenas de Búsqueda Multi-Base
El sistema debe generar automáticamente cadenas de búsqueda adaptadas a la sintaxis específica de cada base de datos académica (Scopus, IEEE, PubMed, Web of Science), a partir de los términos del protocolo.

### RF-06: Búsqueda Automatizada en APIs Académicas
El sistema debe conectarse a APIs académicas (Scopus, IEEE, PubMed) para ejecutar búsquedas automatizadas, recuperar metadatos (título, autores, año, DOI, abstract, keywords) y almacenarlos en la base de datos del proyecto.

### RF-07: Importación Multi-Formato de Referencias
El sistema debe permitir importar referencias bibliográficas desde archivos CSV, RIS, BibTeX y EndNote XML, con detección automática de formato y mapeo de campos.

### RF-08: Deduplicación Inteligente de Referencias
El sistema debe detectar y eliminar referencias duplicadas mediante tres métodos: coincidencia exacta de DOI, similitud de título normalizado + primer autor + año, y similitud semántica de texto usando embeddings.

### RF-09: Screening Manual con Interfaz Interactiva
El sistema debe proporcionar una interfaz de tabla para revisar referencias por título y abstract, permitiendo marcarlas como Incluida, Excluida, Duplicada o Pendiente, con filtros, búsqueda y acciones masivas.

### RF-10: Screening Automatizado con IA
El sistema debe ofrecer dos métodos de screening automatizado: (1) clasificación por similitud semántica usando embeddings vectoriales con umbral configurable, y (2) análisis con LLM (Gemini/ChatGPT) que evalúa relevancia según criterios I/E y proporciona justificación textual.

### RF-11: Visualización de Diagrama PRISMA Flow
El sistema debe generar automáticamente el diagrama de flujo PRISMA con conteos de referencias en cada fase (identificación, screening, elegibilidad, inclusión), actualizado en tiempo real, exportable como imagen PNG/SVG.

### RF-12: Gestión de Revisión de Texto Completo
El sistema debe permitir subir PDFs de artículos, extraer texto automáticamente, visualizarlos en un visor embebido, y aplicar criterios de elegibilidad finales con decisión justificada.

### RF-13: Extracción de Datos Estructurada
El sistema debe permitir definir plantillas de extracción personalizadas (campos: autor, año, metodología, resultados, conclusiones) y extraer datos de cada referencia incluida mediante formularios dinámicos, con asistencia de IA para autocompletar.

### RF-14: Síntesis Narrativa Automatizada
El sistema debe generar síntesis narrativas utilizando LLM, identificando patrones temáticos, tendencias temporales, gaps de investigación y agrupando estudios por metodología o enfoque, exportables a documentos Word/PDF.

### RF-15: Generación de Reportes PRISMA Completos
El sistema debe generar reportes PDF estructurados que incluyan checklist PRISMA 2020, diagrama de flujo, tablas de evidencia, estadísticas descriptivas y referencias bibliográficas formateadas.

### RF-16: Cálculo de Acuerdo Inter-Revisor
En proyectos colaborativos con screening doble-ciego, el sistema debe calcular automáticamente el coeficiente Kappa de Cohen para medir concordancia entre revisores e identificar referencias con conflicto para resolución.

### RF-17: Exportación Multi-Formato de Resultados
El sistema debe permitir exportar referencias en formatos BibTeX, EndNote (RIS), CSV y Excel, con filtros aplicables (incluidas solamente, por año, por revista).

### RF-18: Dashboard de Métricas del Proyecto
El sistema debe proporcionar un dashboard con gráficos y estadísticas: distribución temporal de publicaciones, revistas más frecuentes, países, metodologías, palabras clave, y progreso de screening/extracción.

---

## 4. REQUERIMIENTOS NO FUNCIONALES

### RNF-01: Seguridad - Autenticación y Autorización
El sistema debe implementar autenticación basada en JWT con refresh tokens, hash de contraseñas usando bcrypt (salt rounds ≥ 10), y control de acceso basado en roles (RBAC) para proteger recursos sensibles.

### RNF-02: Seguridad - Protección de Datos Sensibles
Las API Keys de servicios externos (OpenAI, Gemini, Scopus) deben almacenarse exclusivamente en variables de entorno del servidor (.env), nunca expuestas al cliente. Los archivos PDF y datos extraídos deben cifrarse en reposo usando AES-256.

### RNF-03: Seguridad - Validación de Entrada
Todas las entradas de usuario deben validarse y sanitizarse usando express-validator para prevenir inyecciones SQL, XSS y otras vulnerabilidades OWASP Top 10.

### RNF-04: Seguridad - HTTPS y Headers
El sistema debe forzar comunicación HTTPS en producción y configurar headers de seguridad usando Helmet.js (CSP, HSTS, X-Frame-Options, X-Content-Type-Options).

### RNF-05: Rendimiento - Tiempo de Respuesta
Las operaciones de lectura (listar referencias, obtener protocolo) deben responder en < 500ms p95. Las operaciones de escritura (crear proyecto, guardar referencia) deben completarse en < 1s p95.

### RNF-06: Rendimiento - Screening con IA
El screening automatizado mediante embeddings debe procesar hasta 1000 referencias en < 30 segundos. El screening con LLM debe procesar al menos 50 referencias/minuto respetando rate limits de APIs.

### RNF-07: Escalabilidad - Manejo de Proyectos Grandes
El sistema debe soportar proyectos con hasta 10,000 referencias sin degradación perceptible de rendimiento. La búsqueda y filtrado deben usar índices de base de datos optimizados.

### RNF-08: Escalabilidad - Procesamiento Asíncrono
Las tareas pesadas (generación de embeddings, screening masivo, generación de reportes PDF) deben ejecutarse de forma asíncrona con feedback de progreso en tiempo real (WebSockets o polling).

### RNF-09: Disponibilidad y Confiabilidad
El sistema debe tener disponibilidad ≥ 99.5% (downtime máximo ~3.6h/mes). Debe implementar manejo robusto de errores con logging estructurado y reintentos automáticos en llamadas a APIs externas.

### RNF-10: Usabilidad y Accesibilidad
La interfaz debe ser responsiva (mobile-first), cumplir WCAG 2.1 nivel AA (contraste, navegación por teclado, lectores de pantalla), y proporcionar feedback visual claro para todas las acciones.

### RNF-11: Mantenibilidad - Código Limpio
El código debe seguir principios SOLID, separación de capas (controladores, casos de uso, repositorios), y convenciones de nomenclatura consistentes. Cobertura de tests unitarios ≥ 70%.

### RNF-12: Observabilidad - Logging y Monitoreo
El sistema debe registrar todas las operaciones críticas (autenticación, uso de APIs IA, errores) con niveles apropiados (INFO, WARN, ERROR). Debe exponer métricas de uso de APIs para control de cuotas.

### RNF-13: Compatibilidad - Navegadores Web
La aplicación debe funcionar correctamente en Chrome, Firefox, Safari y Edge (últimas 2 versiones). Debe degradarse gracefully en navegadores sin soporte de ciertas funcionalidades.

### RNF-14: Privacidad y GDPR
Los datos de usuario deben poder exportarse completamente (portabilidad) y eliminarse permanentemente bajo solicitud (derecho al olvido). Debe implementarse anonimización de logs.

### RNF-15: Rate Limiting y Protección Anti-Abuso
Debe implementarse rate limiting por IP (100 req/15min) y por usuario autenticado (1000 req/hora) para prevenir abuso. Las llamadas a APIs de IA deben tener quotas configurables por proyecto.

---

## 5. ARQUITECTURA DEL SISTEMA

### 5.1 Tipo de Arquitectura: **Arquitectura en Capas (Layered Architecture)**

**Justificación:**
- Separación clara de responsabilidades
- Facilita testing unitario e integración
- Escalabilidad horizontal y vertical
- Mantenibilidad a largo plazo

### 5.2 Capas del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                     CAPA DE PRESENTACIÓN                    │
│  (Next.js 14 + React 19 + TypeScript + TailwindCSS)        │
│  - Componentes UI (shadcn/ui)                               │
│  - Gestión de estado (Context API, TanStack Query)         │
│  - Formularios y validación (React Hook Form)              │
│  - Visualizaciones (Recharts)                               │
└─────────────────────────────────────────────────────────────┘
                              ↓ HTTP/REST + JWT
┌─────────────────────────────────────────────────────────────┐
│                   CAPA DE API / ROUTING                     │
│  (Express.js + Middleware)                                  │
│  - Rutas RESTful (/api/projects, /api/references, etc.)   │
│  - Autenticación (Passport.js + JWT)                        │
│  - Validación de entrada (express-validator)               │
│  - Rate limiting y seguridad (Helmet, CORS)                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                 CAPA DE LÓGICA DE NEGOCIO                   │
│  (Use Cases / Domain Logic)                                 │
│  - GenerateProtocolAnalysisUseCase                          │
│  - ScreenReferencesWithAIUseCase                            │
│  - GenerateSearchQueriesUseCase                             │
│  - ScopusSearchUseCase                                      │
│  - DeduplicateReferencesUseCase                             │
│  - GeneratePRISMAReportUseCase                              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              CAPA DE ACCESO A DATOS (Repository)            │
│  (PostgreSQL + pg)                                          │
│  - ProjectRepository                                        │
│  - ReferenceRepository                                      │
│  - ProtocolRepository                                       │
│  - UserRepository                                           │
│  - Transacciones y queries optimizadas                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   CAPA DE INFRAESTRUCTURA                   │
│  - PostgreSQL 15 + pgvector (Embeddings)                   │
│  - Redis (Caché de sesiones, rate limiting)                │
│  - APIs Externas (Gemini, OpenAI, Scopus, IEEE, PubMed)   │
│  - Storage (PDFs, archivos generados)                       │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 Flujo Completo de Datos - Ejemplo: Screening Automatizado con IA

```
1. Usuario hace clic en "Ejecutar Screening con IA (Embeddings)"
   ↓
2. Frontend envía POST /api/ai/run-screening-embeddings
   { projectId: "uuid", threshold: 0.6 }
   ↓
3. Middleware de autenticación valida JWT
   ↓
4. Controller recibe request y delega a:
   RunProjectScreeningUseCase.execute({ projectId, threshold })
   ↓
5. Use Case:
   a) Obtiene protocolo del proyecto (ReferenceRepository)
   b) Genera embedding del protocolo usando ScreenReferencesWithEmbeddingsUseCase
   c) Obtiene todas las referencias con status='pending'
   d) Para cada referencia:
      - Calcula similitud coseno entre embeddings
      - Decide: included (sim > threshold) | excluded (sim <= threshold)
      - Actualiza status en BD
   e) Retorna resultados con estadísticas
   ↓
6. Controller envía respuesta JSON:
   {
     success: true,
     processed: 250,
     included: 78,
     excluded: 172,
     avgSimilarity: 0.52
   }
   ↓
7. Frontend actualiza UI:
   - Recarga lista de referencias
   - Muestra toast con resultados
   - Actualiza diagrama PRISMA Flow
```

### 5.4 Propuesta de Endpoints de API

#### Autenticación
```
POST   /api/auth/register          - Registrar usuario
POST   /api/auth/login             - Iniciar sesión (retorna JWT)
POST   /api/auth/refresh           - Renovar access token
POST   /api/auth/forgot-password   - Solicitar reset de contraseña
POST   /api/auth/reset-password    - Confirmar nueva contraseña
GET    /api/auth/me                - Obtener usuario actual
```

#### Proyectos
```
GET    /api/projects               - Listar proyectos del usuario
POST   /api/projects               - Crear nuevo proyecto
GET    /api/projects/:id           - Obtener detalles de proyecto
PUT    /api/projects/:id           - Actualizar proyecto
DELETE /api/projects/:id           - Eliminar proyecto
POST   /api/projects/:id/members   - Añadir colaborador
GET    /api/projects/:id/stats     - Estadísticas del proyecto
```

#### Protocolo
```
GET    /api/projects/:id/protocol  - Obtener protocolo del proyecto
PUT    /api/projects/:id/protocol  - Actualizar protocolo completo
POST   /api/ai/protocol-analysis   - Generar análisis PICO con IA
POST   /api/ai/generate-titles     - Generar títulos candidatos
POST   /api/ai/generate-protocol-terms - Generar términos del protocolo
POST   /api/ai/generate-inclusion-exclusion-criteria - Generar criterios I/E
```

#### Búsqueda y Estrategia
```
POST   /api/ai/generate-search-queries - Generar cadenas de búsqueda
GET    /api/ai/supported-databases     - Listar bases de datos soportadas
POST   /api/ai/scopus-count            - Contar resultados en Scopus
POST   /api/ai/scopus-search           - Buscar artículos en Scopus
POST   /api/ai/scopus-fetch            - Buscar y guardar en BD
GET    /api/ai/scopus-validate         - Validar conexión API Scopus
```

#### Referencias
```
GET    /api/references/:projectId           - Listar referencias del proyecto
POST   /api/references/:projectId           - Crear referencia manual
POST   /api/references/:projectId/import    - Importar archivo (CSV/RIS/BibTeX)
PUT    /api/references/:id/status           - Actualizar estado (screening)
DELETE /api/references/:id                  - Eliminar referencia
POST   /api/references/:projectId/deduplicate - Deduplicar referencias
GET    /api/references/:projectId/export    - Exportar referencias (formato query param)
```

#### Screening con IA
```
POST   /api/ai/screen-reference             - Screening individual con LLM
POST   /api/ai/screen-reference-batch       - Screening batch con LLM
POST   /api/ai/screen-reference-embeddings  - Screening individual con embeddings
POST   /api/ai/run-screening-embeddings     - Screening masivo con embeddings
POST   /api/ai/run-screening-llm            - Screening masivo con LLM
POST   /api/ai/analyze-screening-results    - Análisis de resultados de screening
```

#### Extracción de Datos
```
GET    /api/extracted-data/:projectId       - Obtener datos extraídos
POST   /api/extracted-data/:referenceId     - Guardar datos extraídos de referencia
GET    /api/extracted-data/:projectId/export - Exportar a Excel
```

#### Reportes y PRISMA
```
GET    /api/prisma/:projectId/checklist     - Obtener checklist PRISMA
PUT    /api/prisma/:projectId/checklist     - Actualizar checklist
GET    /api/prisma/:projectId/flow-diagram  - Generar diagrama de flujo (JSON)
GET    /api/reports/:projectId/generate     - Generar reporte completo PDF
```

### 5.5 Esquema de Base de Datos (PostgreSQL)

```sql
-- =============================================
-- USUARIOS Y AUTENTICACIÓN
-- =============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  institution VARCHAR(255),
  role VARCHAR(50) DEFAULT 'researcher', -- researcher | admin
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- =============================================
-- PROYECTOS DE REVISIÓN SISTEMÁTICA
-- =============================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  research_area VARCHAR(255),
  status VARCHAR(50) DEFAULT 'draft', -- draft | active | completed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_projects_owner ON projects(owner_id);
CREATE INDEX idx_projects_status ON projects(status);

-- =============================================
-- MIEMBROS DEL PROYECTO
-- =============================================
CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL, -- principal_investigator | reviewer | observer
  permissions JSONB, -- { canEdit: true, canDelete: false, canInvite: true }
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_project_members_user ON project_members(user_id);

-- =============================================
-- PROTOCOLOS (1:1 con projects)
-- =============================================
CREATE TABLE protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID UNIQUE NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- PICO Framework
  pico JSONB, -- { population, intervention, comparison, outcome }
  
  -- Matriz Es/No Es
  matrix_is_not JSONB, -- { is: [], isNot: [] }
  
  -- Términos del protocolo
  protocol_terms JSONB, -- { tecnologia: [], dominio: [], focosTematicos: [] }
  
  -- Criterios I/E (6 categorías)
  inclusion_criteria JSONB, -- ["criterio1", "criterio2", ...]
  exclusion_criteria JSONB,
  
  -- Estrategia de búsqueda
  search_plan JSONB, -- { databases: [], searchQueries: [], uploadedFiles: [] }
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_protocols_project ON protocols(project_id);

-- =============================================
-- REFERENCIAS BIBLIOGRÁFICAS
-- =============================================
CREATE TABLE references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Metadatos bibliográficos
  title TEXT NOT NULL,
  authors TEXT, -- JSON array serializado: ["Author1", "Author2"]
  year INTEGER,
  journal VARCHAR(500),
  doi VARCHAR(255),
  abstract TEXT,
  keywords TEXT, -- JSON array
  url TEXT,
  
  -- Estados de revisión
  screening_status VARCHAR(50) DEFAULT 'pending',
    -- pending | included | excluded | duplicated | in_review
  full_text_status VARCHAR(50),
    -- not_retrieved | retrieved | included_final | excluded_final
  
  -- IA y clasificación automática
  ai_classification VARCHAR(50), -- included | excluded | uncertain
  ai_confidence_score DECIMAL(5,4), -- 0.0000 - 1.0000
  ai_reasoning TEXT,
  embedding_vector vector(384), -- pgvector: embeddings semánticos
  
  -- Revisión manual
  manual_review_status VARCHAR(50),
  manual_review_notes TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  -- Resolución de conflictos (screening doble-ciego)
  reviewer_1_decision VARCHAR(50),
  reviewer_2_decision VARCHAR(50),
  conflict_resolved_by UUID REFERENCES users(id),
  
  -- Metadatos de importación
  source VARCHAR(100), -- Scopus | IEEE | PubMed | Manual | CSV
  external_id VARCHAR(255), -- ID de la base de datos original
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar búsquedas
CREATE INDEX idx_references_project ON references(project_id);
CREATE INDEX idx_references_screening_status ON references(screening_status);
CREATE INDEX idx_references_ai_classification ON references(ai_classification);
CREATE INDEX idx_references_year ON references(year);
CREATE INDEX idx_references_doi ON references(doi);

-- Índice vectorial para búsqueda semántica (pgvector)
CREATE INDEX idx_references_embedding ON references 
  USING ivfflat (embedding_vector vector_cosine_ops)
  WITH (lists = 100);

-- =============================================
-- DATOS EXTRAÍDOS (extracción de variables)
-- =============================================
CREATE TABLE extracted_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_id UUID NOT NULL REFERENCES references(id) ON DELETE CASCADE,
  field_name VARCHAR(255) NOT NULL, -- author | year | methodology | results | etc.
  field_value TEXT,
  extracted_by UUID REFERENCES users(id),
  extraction_method VARCHAR(50), -- manual | ai_assisted
  extracted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_extracted_data_reference ON extracted_data(reference_id);
CREATE INDEX idx_extracted_data_field ON extracted_data(field_name);

-- =============================================
-- CHECKLIST PRISMA 2020
-- =============================================
CREATE TABLE prisma_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  section VARCHAR(100) NOT NULL, -- title | abstract | introduction | methods | etc.
  item_number INTEGER NOT NULL, -- 1-27
  item_description TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  location_in_manuscript TEXT, -- "Página 5, párrafo 2"
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(project_id, item_number)
);

CREATE INDEX idx_prisma_items_project ON prisma_items(project_id);

-- =============================================
-- LOG DE ACTIVIDAD
-- =============================================
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL, -- created_project | updated_protocol | imported_references | etc.
  entity_type VARCHAR(50), -- project | reference | protocol
  entity_id UUID,
  details JSONB, -- Metadata adicional
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activity_log_project ON activity_log(project_id);
CREATE INDEX idx_activity_log_user ON activity_log(user_id);
CREATE INDEX idx_activity_log_created ON activity_log(created_at DESC);

-- =============================================
-- VERSIONES DE ARTÍCULOS (para síntesis y redacción)
-- =============================================
CREATE TABLE article_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  section VARCHAR(100) NOT NULL, -- introduction | methods | results | discussion
  content TEXT NOT NULL,
  version INTEGER NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_article_versions_project ON article_versions(project_id);

-- =============================================
-- USO DE APIs (para tracking de cuotas)
-- =============================================
CREATE TABLE api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  api_provider VARCHAR(50) NOT NULL, -- openai | gemini | scopus | ieee
  endpoint VARCHAR(255), -- /v1/chat/completions | /search/scopus
  tokens_used INTEGER, -- para OpenAI/Gemini
  cost_usd DECIMAL(10,6), -- costo estimado
  response_time_ms INTEGER,
  status_code INTEGER,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_api_usage_user ON api_usage(user_id);
CREATE INDEX idx_api_usage_project ON api_usage(project_id);
CREATE INDEX idx_api_usage_created ON api_usage(created_at DESC);
CREATE INDEX idx_api_usage_provider ON api_usage(api_provider);
```

---

## 6. LISTA DE SPRINTS SUGERIDOS

### **Sprint 1: Fundamentos y Análisis PICO** (2 semanas)
**Objetivo:** Establecer arquitectura base, autenticación y módulo PICO completo.

**Entregables:**
- Setup de proyecto (Next.js + Node.js + PostgreSQL + pgvector)
- Sistema de autenticación (registro, login, JWT)
- Módulo de gestión de proyectos (CRUD básico)
- Asistente PICO con validación IA
- Generación de títulos candidatos con IA
- Matriz "Es/No Es"
- Dashboard básico de usuario

**Tecnologías clave:** Next.js, Express, PostgreSQL, Passport.js, Gemini API

**Criterios de aceptación:**
- Usuario puede registrarse y autenticarse
- Usuario puede crear proyecto RSL
- Asistente PICO genera pregunta de investigación válida
- Tests unitarios para autenticación y CRUD de proyectos

---

### **Sprint 2: Protocolo y Criterios de Inclusión/Exclusión** (2 semanas)
**Objetivo:** Definir protocolo completo con términos normalizados y criterios I/E.

**Entregables:**
- Definición de términos del protocolo (tecnología, dominio, focos)
- Normalización y detección de duplicados con IA
- Generación de criterios I/E con IA (6 categorías)
- Interfaz de edición de criterios (tabla dinámica)
- Generación de documento de protocolo PDF
- Validación de completitud de protocolo

**Tecnologías clave:** Gemini/ChatGPT, jsPDF, React Hook Form

**Criterios de aceptación:**
- Sistema genera 6 categorías de criterios I/E automáticamente
- Términos del protocolo se normalizan eliminando duplicados
- Protocolo exportable a PDF con formato PRISMA
- Validación de campos obligatorios antes de avanzar

---

### **Sprint 3: Estrategia de Búsqueda y APIs Académicas** (2 semanas)
**Objetivo:** Generación de cadenas de búsqueda y conexión con APIs académicas.

**Entregables:**
- Generación automática de cadenas de búsqueda (8 bases de datos)
- Adaptación de sintaxis por motor (Scopus, IEEE, PubMed, etc.)
- Integración con Scopus API (búsqueda y conteo)
- Guardado automático de referencias en BD
- Importador manual (CSV, RIS, BibTeX)
- Deduplicación inteligente (DOI + título + embeddings)

**Tecnologías clave:** Scopus API, Axios, Papa Parse, csv-parser

**Criterios de aceptación:**
- Cadenas de búsqueda generadas para 8 bases de datos
- Conexión exitosa con Scopus API (conteo y búsqueda)
- Referencias guardadas automáticamente con metadatos completos
- Deduplicación detecta >95% de duplicados reales
- Importación exitosa de CSV, RIS, BibTeX

---

### **Sprint 4: Screening Manual y Automatizado con IA** (3 semanas)
**Objetivo:** Implementar screening completo con dos métodos de IA.

**Entregables:**
- Interfaz de tabla de referencias con filtros avanzados
- Screening manual (incluir/excluir por título/abstract)
- Screening automatizado con embeddings (MiniLM-L6-v2 + pgvector)
- Screening automatizado con LLM (Gemini/ChatGPT)
- Cálculo de similitud coseno y umbral configurable
- Sistema de revisión colaborativa (asignación de revisores)
- Cálculo de Cohen's Kappa (acuerdo inter-revisor)
- Resolución de conflictos

**Tecnologías clave:** pgvector, Sentence Transformers, Gemini/ChatGPT API

**Criterios de aceptación:**
- Screening manual funcional con estados (Incluida/Excluida/Pendiente)
- Screening con embeddings procesa 1000 refs en <30 segundos
- Screening con LLM proporciona justificación textual
- Cohen's Kappa calculado correctamente para revisores
- Interfaz permite resolver conflictos identificando diferencias

---

### **Sprint 5: Revisión de Texto Completo y Extracción de Datos** (2 semanas)
**Objetivo:** Gestión de PDFs, revisión full-text y extracción estructurada.

**Entregables:**
- Upload y almacenamiento de PDFs
- Extracción de texto con pdf-parse
- Visor de PDF embebido
- Checklist de elegibilidad de texto completo
- Plantillas de extracción personalizables
- Formularios dinámicos para extracción de datos
- Asistencia de IA para autocompletar extracción
- Exportación de datos a Excel

**Tecnologías clave:** pdf-parse, xlsx, React PDF Viewer

**Criterios de aceptación:**
- PDFs se cargan y visualizan correctamente
- Extracción de texto automática con >90% precisión
- Plantillas de extracción personalizables por proyecto
- IA sugiere datos extraídos con >70% precisión
- Exportación a Excel con formato adecuado

---

### **Sprint 6: Síntesis, PRISMA Flow y Reportes** (2 semanas)
**Objetivo:** Visualización PRISMA, síntesis narrativa y generación de reportes.

**Entregables:**
- Diagrama de flujo PRISMA interactivo (actualizado en tiempo real)
- Exportar diagrama como PNG/SVG
- Checklist PRISMA 2020 (27 ítems)
- Validación automática de cumplimiento
- Síntesis narrativa con IA (identificación de patrones/gaps)
- Generación de reportes PDF completos
- Tablas de evidencia
- Visualizaciones (gráficos de distribución temporal, nube de palabras)

**Tecnologías clave:** Recharts, jsPDF/Puppeteer, ChatGPT-4o-mini

**Criterios de aceptación:**
- Diagrama PRISMA Flow actualizado en tiempo real
- Exportación a PNG/SVG funcional
- Checklist PRISMA 2020 completo (27 ítems)
- Síntesis narrativa identifica patrones temáticos
- Reporte PDF incluye todas las secciones requeridas
- Visualizaciones muestran tendencias temporales

---

### **Sprint 7: Testing, Optimización y Despliegue** (2 semanas)
**Objetivo:** Asegurar calidad, rendimiento y poner en producción.

**Entregables:**
- Tests unitarios de casos de uso críticos (≥70% cobertura)
- Tests de integración de APIs externas
- Optimización de queries de BD (índices, explain analyze)
- Implementación de caché con Redis
- Rate limiting y protección anti-abuso
- Logging estructurado y monitoreo
- Configuración de CI/CD (GitHub Actions)
- Despliegue en producción (Vercel + Railway/Render)
- Documentación técnica completa
- Video demo del sistema

**Tecnologías clave:** Jest, Supertest, Redis, Docker, GitHub Actions

**Criterios de aceptación:**
- Cobertura de tests ≥70%
- Todas las APIs externas testeadas con mocks
- Queries de BD optimizadas (tiempo de respuesta <500ms)
- Rate limiting configurado (100 req/15min por IP)
- Sistema desplegado en producción con HTTPS
- Documentación técnica completa (README + API docs)
- Video demo mostrando flujo completo de RSL

---

## 7. RECOMENDACIONES FINALES

### 7.1 Gestión de Dependencias de IA
- **Fallback gracioso:** Si Gemini falla, usar ChatGPT automáticamente
- **Retry con backoff exponencial** para APIs con rate limiting
- **Caché de respuestas** frecuentes (ej: términos de protocolo similares)
- **Monitoreo de cuotas:** Dashboard con consumo de tokens por proyecto

### 7.2 Seguridad
- **Nunca** almacenar API Keys en frontend o repositorio Git
- Implementar **2FA** (opcional) para investigadores principales
- **Auditoría completa:** Registrar todas las acciones críticas en `activity_log`
- **Cifrado en reposo:** AES-256 para PDFs y datos sensibles
- **HTTPS obligatorio** en producción con certificado SSL válido

### 7.3 UX/UI
- **Feedback visual inmediato:** Spinners, toasts, progress bars
- **Onboarding guiado:** Tour interactivo para nuevos usuarios
- **Tooltips explicativos:** Ayudar a entender metodología PRISMA
- **Responsive design:** Mobile-first, adaptable a tablets
- **Accesibilidad:** WCAG 2.1 AA (contraste, navegación teclado)

### 7.4 Documentación
- **README técnico:** Setup local, variables de entorno, arquitectura
- **API Documentation:** OpenAPI/Swagger para endpoints
- **Manual de usuario:** Guía paso a paso para crear una RSL completa
- **Diagramas de arquitectura:** C4 Model o similar
- **Changelog:** Registro de versiones y cambios significativos

### 7.5 Monitoreo y Observabilidad
- **Logging estructurado:** Winston o Pino con niveles (INFO, WARN, ERROR)
- **Métricas de negocio:** Referencias procesadas, screening completados
- **Alertas:** Notificaciones por fallos de APIs externas
- **Performance monitoring:** Tiempos de respuesta, uso de memoria

### 7.6 Escalabilidad Futura
- **Microservicios:** Separar screening IA en servicio independiente
- **Procesamiento distribuido:** Bull/BullMQ para colas de tareas
- **CDN:** CloudFlare para assets estáticos y PDFs generados
- **Caché distribuida:** Redis Cluster para alta disponibilidad

---

**Este documento constituye la base técnica completa para el Capítulo III de la tesis, proporcionando una visión exhaustiva de tecnologías, arquitectura, requerimientos y planificación del Sistema de Gestión de Revisiones Sistemáticas de Literatura.**

---

## Referencias Bibliográficas

- Page, M. J., McKenzie, J. E., Bossuyt, P. M., et al. (2021). The PRISMA 2020 statement: an updated guideline for reporting systematic reviews. *BMJ*, 372, n71.
- Elsevier. (2024). Scopus Search API Guide. https://dev.elsevier.com/
- OpenAI. (2024). GPT-4 Technical Report. https://openai.com/research/gpt-4
- Google DeepMind. (2024). Gemini: A Family of Highly Capable Multimodal Models.
- PostgreSQL Global Development Group. (2024). PostgreSQL 15 Documentation.
- Vercel. (2024). Next.js 14 Documentation. https://nextjs.org/docs
