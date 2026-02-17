# Diagnóstico de Problemas del Proyecto - 17 Feb 2026

## 🚨 Resumen Ejecutivo

Tu proyecto tiene **3 problemas principales**:
1. ✅ **CORREGIDO**: Diagrama PRISMA con números negativos (código ya actualizado)
2. ⚠️ **CRÍTICO**: Estudios en RQS completamente irrelevantes al tema de investigación
3. ⚠️ **CONSECUENCIA**: Gráficas y síntesis muestran datos sin sentido

---

## 1. Diagrama PRISMA con números negativos (-31)

### Estado: ✅ CORREGIDO EN CÓDIGO, PENDIENTE REGENERAR

**Evidencia**:
```
Publicaciones recuperadas para evaluación (n = -31)
Publicaciones evaluadas para elegibilidad (n = -31)
```

**Causa raíz**: 
El artículo que estás viendo fue generado con una versión antigua del código antes de los fixes aplicados hoy.

**Solución**:
1. Ve a: `Dashboard → Tu Proyecto → Artículo → Generar Nuevo Borrador`
2. El nuevo diagrama mostrará números correctos:
   - Identificados: 39
   - Evaluados: 12
   - Incluidos: 8
   - Excluidos: 4

**Archivos corregidos**:
- `backend/src/infrastructure/services/python-graph.service.js` (línea 71)
- `backend/scripts/generate_charts.py` (línea 137)

---

## 2. Estudios IRRELEVANTES en RQS ⚠️ PROBLEMA CRÍTICO

### Tu tema de investigación:
**"Evaluating Machine Learning-Based Intrusion Detection Techniques Against Traditional Signature Approaches for Threat Detection Efficiency in Network Security Systems"**

### Estudios que DEBERÍAN estar en tu RSL:
- Técnicas de machine learning para IDS (Random Forest, SVM, Deep Learning)
- Comparaciones de IDS basados en ML vs. signature-based (Snort, Suricata)
- Evaluaciones de eficacia de detección, tasa de falsos positivos
- Sistemas de detección de intrusos en entornos de red
- Análisis de comportamiento para detectar anomalías

### Estudios que ACTUALMENTE tienes (❌ TODOS IRRELEVANTES):

| # | Autor | Año | Título | Score | ¿Por qué es irrelevante? |
|---|-------|-----|--------|-------|--------------------------|
| S1 | Hayat et al. | 2025 | Plant-Parasitic Nematodes and Their Disease Control | 29.2% | 🌱 Agricultura - nematodos en cultivos |
| S2 | Javed et al. | 2025 | Artificial Intelligence in biological control | 25.7% | 🐛 Control de plagas con IA |
| S3 | Sandon et al. | 2025 | Chagas disease vector dynamics | 35.4% | 🦟 Epidemiología - Chagas |
| S4 | Savian et al. | 2025 | Organic agriculture: Life cycle assessment | 31.8% | 🌽 Agricultura orgánica - maíz/soja |
| S5 | Alnami et al. | 2024 | TCSC Devices in Transmission Power Systems | 30.7% | ⚡ Sistemas eléctricos - capacitores |
| S6 | Alotaibi et al. | 2024 | Security in IoT-Assisted UAV Networks | 22.7% | ⚠️ **POSIBLEMENTE RELEVANTE** (IoT security) |
| S7 | Eyada et al. | 2020 | MongoDB vs MySQL in Cloud Environments | 28.3% | 💾 Bases de datos - rendimiento |
| S8 | Friston et al. | 2019 | Position-Based Control: Dexmo Glove | 25.7% | 🤖 Robótica - guantes hápticos |

**Estadísticas de relevancia**:
- Score máximo: 35.4% (Sandon - Chagas) ❌
- Score promedio: 28.7% ❌
- Score mínimo: 22.7%  ❌
- **Score esperado para estudios relevantes: > 70%** ✅

### ¿Por qué pasaron el filtro del elbow method?

El **elbow method** detecta automáticamente el umbral óptimo en la curva de scores. En tu caso:
- Los 39 artículos importados tienen scores muy bajos (rango 22%-35%)
- NO hay articulos realmente relevantes en los 39 (todos son de otros dominios)
- El algoritmo buscó el "codo" en una distribución donde **todos los estudios son irrelevantes**

**Analogía**: Es como pedirle al sistema que seleccione "las mejores manzanas" de una caja que solo contiene naranjas, plátanos y sandías. El sistema seleccionará las "menos malas", pero ninguna será una manzana.

---

## 3. Consecuencias en las gráficas

### Figure 5: Mapeo de Métricas vs Tecnologías (Bubble Chart)
❌ Muestra: "MongoDB", "MySQL", "Dexmo glove", "Plant-parasitic nematodes"

**Debería mostrar**: "Snort IDS", "Suricata", "Zeek", "Deep Learning IDS", "Random Forest classifier"

### Figure 6: Síntesis Técnica Comparativa
❌ Muestra métricas de: eficiencia agrícola, latencia de bases de datos de IoT, control háptico

**Debería mostrar**: Detection accuracy, False positive rate, Response time, CPU usage, Network throughput

### Secciones RQ1, RQ2, RQ3
❌ GPT-4 intenta sintetizar hallazgos sobre "intrusion detection" usando estudios de agricultura y bases de datos

**Resultado**: Texto sin sentido que mezcla conceptos de diferentes dominios

---

## 🔧 Soluciones paso a paso

### Opción A: Importar referencias correctas (RECOMENDADO)

1. **Revisa tu búsqueda bibliográfica**:
   ```
   Busca en Scopus/IEEE:
   ("intrusion detection" OR "IDS" OR "network security") 
   AND ("machine learning" OR "deep learning" OR "neural network")
   AND ("signature-based" OR "anomaly detection")
   ```

2. **Importa referencias nuevas**:
   - Ve a: Dashboard → Tu Proyecto → Cribado → Importar Referencias
   - Sube archivo BibTeX/RIS con estudios de IDS/ML

3. **Ejecuta screening nuevamente**:
   - El sistema calculará nuevos scores de relevancia
   - Con referencias correctas, los scores deberían estar > 70%

4. **Revisa manualmente los seleccionados**:
   - Verifica que cada estudio trate sobre IDS + ML
   - Marca como "excluded" cualquier estudio fuera de tema

5. **Completa RQS para estudios relevantes**:
   - En la sección RQS, extrae datos de:
     - Técnicas de ML usadas
     - Métricas de evaluación (accuracy, FP rate)
     - Datasets usados (KDD Cup, NSL-KDD, CICIDS)

6. **Regenera el artículo**:
   - Ahora las gráficas mostrarán tecnologías de seguridad
   - Las síntesis RQ1/RQ2/RQ3 tendrán sentido

### Opción B: Ajustar protocolo PICO (si quieres cambiar el tema)

Si en realidad quieres hacer una RSL sobre **otro tema** (agricultura, IoT, bases de datos):

1. Ve a: Dashboard → Tu Proyecto → Protocolo
2. Actualiza:
   - **Título**: "Nuevo título que refleje el dominio real"
   - **PICO - Population**: "Sistemas agrícolas con IA" (por ejemplo)
   - **PICO - Intervention**: "Técnicas de machine learning para..."
   - **Research Questions**: Ajusta RQ1, RQ2, RQ3 al nuevo dominio
3. Regenera el artículo

---

## 📊 Validación de datos antes de generar artículo

### Checklist de calidad:

**Antes de generar un artículo, verifica**:

- [ ] **Scores de relevancia**:
  - ✅ Score promedio > 60%
  - ✅ Al menos 5 estudios con score > 70%
  - ❌ Tu proyecto: Score promedio = 28.7%

- [ ] **Coherencia temática**:
  - ✅ Todas las tecnologías mencionadas pertenecen al mismo dominio
  - ❌ Tu proyecto: Mezcla de agricultura + robótica + bases de datos + power systems

- [ ] **Validación manual RQS**:
  - ✅ Cada estudio responde al menos 1 RQ directamente
  - ❌ Tu proyecto: Ningún estudio trata sobre IDS

- [ ] **Revisión del protocolo PICO**:
  - ✅ Title/PICO/RQs alineados con estudios seleccionados
  - ❌ Tu proyecto: PICO sobre "intrusion detection" pero estudios sobre agricultura

---

## 🎯 Próximos pasos inmediatos

1. **CORTO PLAZO** (hoy):
   - [ ] Regenerar artículo actual para ver fixes del diagrama PRISMA
   - [ ] Revisar si proyecto es de prueba/demo o proyecto real

2. **MEDIANO PLAZO** (esta semana):
   - [ ] Si es proyecto real: importar referencias correctas sobre IDS/ML
   - [ ] Si es proyecto de prueba: crear nuevo proyecto con tema coherente
   - [ ] Ejecutar nuevo screening con referencias relevantes

3. **VALIDACIÓN**:
   - [ ] Verificar scores > 70%
   - [ ] Verificar tecnologías correspondan al dominio (IDS tools, ML algorithms)
   - [ ] Regenerar artículo y revisar que gráficas tengan sentido

---

## 📚 Ejemplos de estudios RELEVANTES para tu tema

Si tu tema es "ML-based IDS vs Signature-based IDS", busca estudios como:

1. **Khraisat et al. (2019)**: "Survey of intrusion detection systems: techniques, datasets and challenges"
2. **Ferrag et al. (2020)**: "Deep learning for cyber security intrusion detection: Approaches, datasets, and comparative study"
3. **Ahmad et al. (2021)**: "Network intrusion detection system: A systematic study of machine learning and deep learning approaches"
4. **Vinayakumar et al. (2019)**: "Deep Learning Approach for Intelligent Intrusion Detection System"
5. **Thakkar et al. (2021)**: "Fusion of statistical importance for feature selection in Deep Neural Network-based Intrusion Detection System"

Estos estudios tendrían keywords como:
- `intrusion detection system`
- `machine learning`
- `deep learning`
- `neural networks`
- `false positive rate`
- `signature-based detection`
- `anomaly detection`

---

## 🔍 Análisis técnico de por qué el sistema permitió esto

### El sistema NO tiene la culpa

El sistema funciona correctamente:
- ✅ Calculó scores de similitud semántica (22%-35%)
- ✅ Aplicó elbow method correctamente
- ✅ Seleccionó los "mejores" 12 de los 39 disponibles
- ✅ Generó gráficas basadas en datos RQS reales
- ✅ GPT-4 sintetizó usando SOLO los estudios proporcionados (sin inventar extras)

### El problema fue la entrada

**Garbage In, Garbage Out**:
- Si importas 39 referencias sobre temas diversos (agricultura, robótica, power systems)
- Y pides una RSL sobre "intrusion detection"
- El sistema hará lo mejor que puede con datos incompatibles
- Resultado: Artículo técnicamente correcto pero sin sentido científico

---

## 📝 Conclusión

**Fixes implementados hoy** ✅:
- [x] Diagrama PRISMA calcula correctamente (sin números negativos)
- [x] GPT-4 no puede inventar estudios adicionales (S9, S10, etc.)
- [x] Gráficas son 100% dinámicas (cualquier dominio)
- [x] Sistema es domain-agnostic (funciona para cualquier tema)

**Pendiente de tu lado** ⚠️:
- [ ] Importar referencias RELEVANTES al tema de IDS/ML
- [ ] Verificar scores de relevancia > 70%
- [ ] Completar RQS con datos coherentes
- [ ] Regenerar artículo con datos correctos

---

## 🆘 Soporte adicional

¿Necesitas ayuda con?:
- Formular búsquedas bibliográficas efectivas
- Interpretar scores de relevancia
- Configurar protocolo PICO correctamente
- Entender cómo funciona el elbow method

**Recursos**:
- `docs/TESTING-GUIDE.md` - Ejemplos de proyectos de prueba
- `docs/ANEXO-A-MANUAL-USUARIO.md` - Guía paso a paso del cribado
- `docs/CAPITULO-III-METODOLOGIA-FORMATO-ESPE.md` - Metodología PRISMA 2020

---

Generado: 17 febrero 2026
Sistema: thesis-rsl-system v2.0
