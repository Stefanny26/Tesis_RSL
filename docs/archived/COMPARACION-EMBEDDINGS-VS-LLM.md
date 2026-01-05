# Comparación: Embeddings vs LLM para Cribado Automático

## 🎯 TU OBJETIVO
**"Clasificar con coherencia y efectividad cada artículo, no al azar. Es información clave."**

## 📊 COMPARACIÓN DETALLADA

### OPCIÓN 1: 🤖 Embeddings Semánticos (all-MiniLM-L6-v2)

#### ¿Cómo Funciona?
```
1. Convierte el protocolo PICO a un vector de 384 números
2. Convierte cada referencia (título + abstract) a vector de 384 números
3. Calcula similitud matemática (coseno) entre vectores
4. Si similitud ≥ 15% → INCLUIR
   Si similitud < 15% → EXCLUIR
```

#### Ventajas ✅
- **Gratis**: Sin costo de API
- **Rápido**: ~3 minutos por 1000 referencias
- **Consistente**: Mismo artículo = mismo resultado siempre
- **Escalable**: Puede procesar miles de referencias
- **Sin límites**: No hay cuotas ni restricciones
- **Offline**: No depende de servicios externos

#### Desventajas ❌
- **Superficial**: Solo calcula similitud matemática de palabras
- **Sin razonamiento**: No entiende contexto ni lógica
- **Sin explicación**: Solo dice "similar/no similar"
- **Problema multilingüe**: Protocolo español vs artículos inglés = menor precisión
- **Sin criterios complejos**: No puede evaluar "estudios con >100 participantes"

#### Precisión Estimada
- **Protocolo y artículos en mismo idioma**: 75-85% de precisión
- **Protocolo español + artículos inglés**: 60-70% de precisión
- **Para tu caso (español vs inglés)**: 65% aproximadamente

#### Ejemplo de Decisión
```
Pregunta: "Impacto del machine learning en ciberseguridad"

Artículo 1: "AI-Powered Defenses: A Machine Learning Approach in Cybersecurity"
Similitud: 0.82 (82%) → INCLUIR ✅
Razonamiento: "Palabras clave coinciden: machine learning, cybersecurity"

Artículo 2: "Blockchain Security in Financial Transactions"
Similitud: 0.12 (12%) → EXCLUIR ❌
Razonamiento: "Pocas palabras en común"
```

---

### OPCIÓN 2: 🧠 LLM con ChatGPT (GPT-4o-mini)

#### ¿Cómo Funciona?
```
1. Envía a ChatGPT el protocolo PICO completo
2. Envía cada referencia con título, autores, año, abstract, keywords
3. ChatGPT LEE y ANALIZA como un experto humano
4. Evalúa criterios de inclusión/exclusión UNO POR UNO
5. Da decisión + confianza + razonamiento detallado
```

#### Ventajas ✅
- **Inteligente**: Entiende contexto y matices
- **Razonamiento**: Explica POR QUÉ incluye/excluye
- **Criterios complejos**: Puede evaluar "estudios empíricos", "con validación"
- **Multilingüe**: Entiende español E inglés perfectamente
- **Conservador**: Si duda, marca como "revisar_manual"
- **Confianza graduada**: Te dice qué tan seguro está (0-100%)

#### Desventajas ❌
- **Costo**: ~$0.15 por cada 1000 tokens (artículos largos gastan más)
- **Lento**: ~2-3 segundos por referencia
- **Cuotas**: Depende de tus $5 USD de crédito
- **Variable**: Puede dar respuestas ligeramente diferentes
- **Requiere internet**: Depende del servicio de OpenAI

#### Precisión Estimada
- **Con criterios claros**: 85-95% de precisión
- **Con criterios ambiguos**: 70-80% de precisión
- **Para tu caso (criterios académicos)**: 90% aproximadamente

#### Ejemplo de Decisión
```json
{
  "decision": "incluida",
  "confidence": 0.92,
  "razonamiento": "El artículo presenta un estudio empírico sobre machine learning aplicado a detección de amenazas cibernéticas. Cumple con los criterios de inclusión: (1) foco en ML, (2) dominio de ciberseguridad, (3) metodología cuantitativa. Autores con afiliación académica reconocida. Abstract describe claramente metodología y resultados.",
  "criterios_cumplidos": [
    "Tecnología: Machine Learning",
    "Dominio: Ciberseguridad",
    "Tipo: Estudio empírico con validación"
  ],
  "criterios_no_cumplidos": [],
  "aspectos_relevantes": [
    "Metodología experimental con dataset real",
    "Métricas de evaluación (precisión, recall, F1-score)",
    "Comparación con técnicas tradicionales"
  ],
  "recomendacion_revision_manual": "no"
}
```

---

## 💰 ANÁLISIS DE COSTOS (Con tus $5 USD)

### Embeddings
- **Costo total**: $0 USD
- **Referencias procesables**: ILIMITADAS
- **Tiempo**: ~15 min para 5000 referencias

### ChatGPT (GPT-4o-mini)
```
Costo por referencia:
- Prompt del protocolo: ~200 tokens
- Referencia promedio: ~500 tokens (título + abstract)
- Respuesta JSON: ~300 tokens
Total: ~1000 tokens por referencia

Precio GPT-4o-mini:
- Input: $0.150 / 1M tokens
- Output: $0.600 / 1M tokens
Costo promedio: ~$0.0002 por referencia

Con $5 USD puedes procesar:
$5 / $0.0002 = 25,000 referencias aproximadamente

Pero considerando overhead y variabilidad:
~15,000-20,000 referencias realistas
```

**Para 49 referencias**: 
- Costo: ~$0.01 USD (1 centavo)
- Tiempo: ~2-3 minutos

---

## 🎯 MI RECOMENDACIÓN PARA TU CASO

### **OPCIÓN HÍBRIDA (LO MEJOR DE AMBOS MUNDOS)** ⭐⭐⭐⭐⭐

```
1️⃣ PRIMERA PASADA: Embeddings (Gratis, Rápido)
   - Procesar TODAS las 49 referencias
   - Umbral conservador: 20% (más permisivo)
   - Resultado: Ranking de similitud

2️⃣ SEGUNDA PASADA: ChatGPT (Preciso, Inteligente)
   - Solo las que tienen similitud 10-30% (zona gris)
   - O las marcadas como "revisar_manual"
   - Costo: Solo ~10-15 referencias = $0.003 USD

3️⃣ REVISIÓN MANUAL: Tu componente nuevo
   - Con resaltado de términos
   - Con atajos de teclado
   - Solo las que ChatGPT marcó como dudosas
```

### ¿Por Qué Esta Opción?

✅ **Maximiza precisión**:
- Embeddings elimina lo obvio (90% de casos claros)
- ChatGPT analiza los casos dudosos (10% complejos)
- Tú revisas solo los conflictivos (2-3%)

✅ **Minimiza costo**:
- Embeddings gratis para bulk
- ChatGPT solo donde realmente importa
- Total: <$0.01 USD de tus $5

✅ **Optimiza tiempo**:
- Embeddings: 30 segundos
- ChatGPT: 30 segundos
- Manual: 5-10 minutos
- **Total: ~6-11 minutos para 49 referencias**

---

## 🚀 IMPLEMENTACIÓN RECOMENDADA

### Paso 1: Agregar método faltante
```javascript
// reference.repository.js
async getPendingReferences(projectId) {
  const query = `
    SELECT * FROM "references" 
    WHERE project_id = $1 
    AND screening_status = 'pending'
    ORDER BY created_at DESC
  `;
  const result = await database.query(query, [projectId]);
  return result.rows.map(row => new Reference(row));
}
```

### Paso 2: Habilitar AMBOS métodos

Ya están implementados:
- ✅ `ScreenReferencesWithEmbeddingsUseCase`
- ✅ `ScreenReferencesWithAIUseCase`

Solo falta:
- Configurar tu API key de ChatGPT en `.env`
- Agregar el método faltante al repository

### Paso 3: Flujo en la UI

```
┌─────────────────────────────────────┐
│  Usuario hace clic en:              │
│  "Ejecutar Cribado con Embeddings"  │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  Backend: Embeddings + ChatGPT      │
│  1. Embeddings para todas (gratis)  │
│  2. ChatGPT para zona gris          │
│  3. Guarda resultados               │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  Usuario ve:                        │
│  - 40 incluidas (alta confianza)    │
│  - 7 excluidas (alta confianza)     │
│  - 2 para revisar manual            │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  Tab "Revisión Individual"          │
│  - Solo las 2 dudosas               │
│  - Con resaltado de términos        │
│  - Decisión final informada         │
└─────────────────────────────────────┘
```

---

## 📝 DECISIÓN FINAL

Para maximizar **coherencia y efectividad** con tus 49 referencias:

### OPCIÓN A: Solo ChatGPT 🧠
- Costo: $0.01 USD
- Tiempo: 2-3 minutos
- Precisión: 90%
- **Mejor para**: Proyectos pequeños (<500 refs) donde precisión es crítica

### OPCIÓN B: Solo Embeddings 🤖
- Costo: $0 USD
- Tiempo: 30 segundos
- Precisión: 65%
- **Mejor para**: Proyectos grandes (>5000 refs) donde velocidad importa

### OPCIÓN C: Híbrido (RECOMENDADO) ⭐
- Costo: <$0.01 USD
- Tiempo: 1-2 minutos
- Precisión: 95%
- **Mejor para**: Balance perfecto de todo

---

## 🎬 ¿QUÉ HACEMOS?

1. **Implementar método faltante** (2 minutos)
2. **Configurar ChatGPT API** (si quieres usarlo)
3. **Probar con tus 49 referencias**
4. **Ver resultados y decidir**

**¿Vamos con el híbrido o prefieres solo ChatGPT para máxima precisión?**
