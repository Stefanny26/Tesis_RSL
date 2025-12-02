# 📚 Sistema RSL - Revisión Sistemática de Literatura con IA

> Sistema completo para gestionar revisiones sistemáticas siguiendo protocolos **PRISMA** y **Cochrane**, con generación automática mediante **Inteligencia Artificial**.

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🚀 Inicio Rápido

### 1. Backend (Puerto 3001)
```bash
cd backend
npm install
node src/server.js
```

### 2. Frontend (Puerto 3000)
```bash
cd frontend
npm install
npm run dev
```

### 3. Acceder
Abre http://localhost:3000 en tu navegador.

---

## ✨ Funcionalidades

### 🔬 Protocolo de Investigación (7 Pasos)
1. **Pregunta de Investigación** → Análisis con IA
2. **Títulos** → Genera 5 títulos válidos (Cochrane)
3. **PICO** → Population, Intervention, Comparison, Outcome
4. **Términos del Protocolo** → Tecnología, Dominio, Focos (IA)
5. **Criterios I/E** → Inclusión/Exclusión (IA)
6. **Cadenas de Búsqueda** → Para 8 bases de datos
7. **Estrategia** → Plan completo de búsqueda

### 📊 Búsqueda Académica
- **Scopus** (API automática) ✅
- **IEEE Xplore** (Manual)
- **Web of Science** (Manual)
- **PubMed** (Manual)
- **Google Scholar** (Manual)
- Import **RIS/BibTeX**

### 🎯 Screening PRISMA
- **Detección de duplicados** automática
- **Screening por título/abstract:**
  - Manual (botones Incluir/Excluir)
  - Con IA (Gemini/ChatGPT)
  - Con embeddings (similarity search)
- **Vista Rayyan** (interfaz simplificada)
- **Full-text screening**

### 📝 Extracción de Datos
- Formularios PRISMA personalizables
- Validación con IA
- Exportación a Excel

### ✍️ Redacción de Artículo
- Editor con 8 secciones RSL
- Generación de contenido con IA
- Historial de versiones
- Estadísticas de completitud

---

## 🛠️ Stack Tecnológico

### Backend
- **Node.js 20** + **Express 4**
- **PostgreSQL 15** + **pgvector** (embeddings)
- **Google Gemini AI** + **ChatGPT** (fallback)
- **Scopus API** para búsqueda automática
- **Passport.js** (OAuth Google)

### Frontend
- **Next.js 14** + **React 19** + **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **Recharts** (gráficas)
- **React Hook Form** + **Zod** (validación)

---

## 📁 Estructura del Proyecto

```
thesis-rsl-system/
├── backend/                 # API REST Node.js
│   ├── src/
│   │   ├── api/            # Controllers + Routes
│   │   ├── domain/         # Models + Use Cases (lógica negocio)
│   │   ├── infrastructure/ # Repositories + DB
│   │   └── config/         # Configuración
│   └── .env                # Variables de entorno
│
├── frontend/               # Next.js 14 App Router
│   ├── app/               # Pages (routing)
│   ├── components/        # Componentes reutilizables
│   ├── lib/              # Servicios y utilidades
│   └── .env.local        # Variables de entorno
│
├── docs/                  # Documentación
│   ├── CAPITULO-III-METODOLOGIA.md  # Para tesis
│   ├── SOLUCION-QUERIES-SCOPUS.md   # Fix queries
│   ├── USER-GUIDE.md                # Guía usuario
│   └── ...
│
└── scripts/               # Migraciones SQL
    ├── 01-create-users-table.sql
    ├── 02-create-projects-table.sql
    └── ...
```

---

## ⚙️ Configuración

### Variables de Entorno

#### Backend (.env):
```env
DATABASE_URL=postgresql://user:password@localhost:5432/thesis_rsl
SCOPUS_API_KEY=tu_scopus_api_key
OPENAI_API_KEY=tu_openai_api_key
GEMINI_API_KEY=tu_gemini_api_key
GOOGLE_CLIENT_ID=tu_google_oauth_client_id
GOOGLE_CLIENT_SECRET=tu_google_oauth_secret
SESSION_SECRET=secret_aleatorio_largo
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env.local):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 📚 Documentación

### Documentos Clave:
- **[CAPITULO-III-METODOLOGIA.md](docs/CAPITULO-III-METODOLOGIA.md)** - Metodología completa para tesis
- **[SOLUCION-QUERIES-SCOPUS.md](backend/SOLUCION-QUERIES-SCOPUS.md)** - Solución al problema de búsquedas
- **[USER-GUIDE.md](docs/USER-GUIDE.md)** - Guía completa de usuario
- **[EMBEDDINGS-SCREENING.md](docs/EMBEDDINGS-SCREENING.md)** - Screening con vectores
- **[RAYYAN-INTEGRATION.md](docs/RAYYAN-INTEGRATION.md)** - Vista Rayyan replicada
- **[PROMPTS-Y-REGLAS-IA.md](docs/PROMPTS-Y-REGLAS-IA.md)** - Prompts de IA completos

---

## 🎯 Queries de Búsqueda (Scopus)

### ✅ Formato Correcto:
```
NoSQL OR MongoDB AND scalability OR performance
```

### ❌ Formato Incorrecto (genera 0 resultados):
```
TITLE-ABS-KEY( "NoSQL" AND "MongoDB" AND ("document-oriented" OR "document model") ... )
```

### Reglas de Oro:
1. ✅ Máximo 2 grupos AND
2. ✅ Sin `TITLE-ABS-KEY()` en búsqueda web
3. ✅ Comillas solo para frases de 2+ palabras
4. ✅ Longitud < 100 caracteres
5. ✅ Términos técnicos específicos

---

## 🗄️ Base de Datos

### Tablas Principales:
- `users` - Usuarios (OAuth Google)
- `projects` - Proyectos RSL
- `protocols` - Protocolos de búsqueda
- `references` - Referencias importadas (con embeddings)
- `prisma_items` - Items PRISMA (extracción)
- `article_versions` - Versiones del artículo
- `activity_log` - Log de actividades

### pgvector Extension:
```sql
CREATE EXTENSION IF NOT EXISTS vector;

-- Índice para similarity search
CREATE INDEX references_embedding_idx 
ON references 
USING ivfflat (embedding vector_cosine_ops);
```

---

## 🤖 Integración IA

### Proveedores:
1. **Gemini 2.0 Flash** (primario)
   - Gratis: 15 req/min
   - Uso: Análisis, términos, criterios

2. **ChatGPT 4.0** (fallback automático)
   - Pago: Ilimitado
   - Se activa si Gemini falla

### Funciones IA:
- Análisis de propuesta de investigación
- Generación de títulos (validación Cochrane)
- Extracción de términos del protocolo
- Generación de criterios inclusión/exclusión
- Clasificación de referencias (relevante/irrelevante)
- Generación de contenido para artículo

---

## 🧪 Testing

### Backend:
```bash
cd backend
npm test
```

### Frontend:
```bash
cd frontend
npm run build
npm start
```

Ver [TESTING-GUIDE.md](docs/TESTING-GUIDE.md) para más detalles.

---

## 🚨 Troubleshooting

### Problema: Queries Scopus retornan 0 resultados
**Solución:** Ver [SOLUCION-QUERIES-SCOPUS.md](backend/SOLUCION-QUERIES-SCOPUS.md)

### Problema: Gemini quota exceeded
**Solución:** Sistema cambia automáticamente a ChatGPT (sin acción requerida)

### Problema: pgvector no está instalado
**Solución:**
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Problema: Frontend no conecta con backend
**Solución:** Verificar `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 📦 Dependencias Principales

### Backend:
- `express` 4.x - API REST
- `pg` 8.x - PostgreSQL
- `@xenova/transformers` 2.x - Embeddings
- `@google/generative-ai` 0.21.x - Gemini
- `passport` 0.7.x - OAuth

### Frontend:
- `next` 14.2.x - Framework
- `react` 19.x - UI library
- `shadcn/ui` - Componentes
- `tailwindcss` 3.x - Estilos

---

## 🎓 Para Tesis

### Capítulos Documentados:
- ✅ **Capítulo III:** Metodología completa ([ver documento](docs/CAPITULO-III-METODOLOGIA.md))
- 🔄 **Capítulo IV:** Resultados (en progreso)
- ⏳ **Capítulo V:** Conclusiones (pendiente)

### Figuras Generadas:
- Arquitectura del sistema (5 capas)
- Diagrama de casos de uso
- Modelo de datos (12 tablas)
- Flujo PRISMA completo

---

## ✅ Estado Actual (Noviembre 2024)

### Completado:
- ✅ Autenticación OAuth Google
- ✅ CRUD Proyectos/Protocolos
- ✅ Wizard de protocolo (7 pasos con IA)
- ✅ Generación de queries (8 bases de datos)
- ✅ Búsqueda Scopus API
- ✅ Import RIS/BibTeX
- ✅ Screening: Manual + IA + Embeddings
- ✅ Vista Rayyan
- ✅ Extracción de datos PRISMA
- ✅ Editor de artículo con IA
- ✅ Dashboard y estadísticas

### En Progreso:
- 🔄 Testing end-to-end
- 🔄 Optimización de performance

### Pendiente:
- ⏳ Despliegue en producción
- ⏳ Más integraciones de bases de datos

---

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles.

---

## 👤 Autor

**Stefanny Hernández**
- GitHub: [@Stefanny26](https://github.com/Stefanny26)
- Repositorio: [Tesis_RSL](https://github.com/Stefanny26/Tesis_RSL)

---

## 🙏 Agradecimientos

- **PRISMA** por las directrices de revisión sistemática
- **Cochrane** por los estándares de calidad
- **Google Gemini AI** por la integración de IA
- **shadcn/ui** por los componentes UI

---

**Última actualización:** 24 de noviembre de 2025

📧 Para soporte, abre un issue en el repositorio.
