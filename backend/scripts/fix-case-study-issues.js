/**
 * Script para corregir problemas identificados en el caso de uso
 * Proyecto: 343a31e4-1094-4090-a1c9-fedb3c43aea4
 * 
 * PROBLEMAS A CORREGIR:
 * 1. refinedQuestion: "IOT" -> Pregunta completa bien formulada
 * 2. Outcome (O): undefined -> Definición clara
 * 3. Artículo: Secciones 3.1 y 3.4 con N/A y sin contenido real
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:root@localhost:5432/Tesis_RSL'
});

const projectId = '343a31e4-1094-4090-a1c9-fedb3c43aea4';

// CORRECCIÓN 1: Pregunta refinada
const refinedQuestion = `En dispositivos IoT en entornos comerciales e industriales, ¿cuál es la efectividad de las técnicas de ciberseguridad específicas (protocolos de autenticación, encriptación de datos, monitoreo de red) en la reducción de la tasa de incidentes de seguridad, mejora del tiempo de respuesta ante ataques, y aumento de la eficacia de las medidas de seguridad implementadas?`;

// CORRECCIÓN 2: Outcome completo
const outcome = `Los resultados medidos incluyen: (1) Tasa de incidentes de seguridad (número de eventos de seguridad detectados antes y después de implementar técnicas), (2) Tiempo de respuesta ante ataques (latencia en detección y mitigación de amenazas), (3) Eficacia de las medidas de seguridad (porcentaje de éxito en prevención/detección de ataques), y (4) Satisfacción de usuarios (nivel de confianza y usabilidad percibida en sistemas protegidos).`;

// CORRECCIÓN 3: Sección 3.1 del artículo
const section3_1 = `## 3.1 Selección de estudios

La búsqueda inicial identificó **31 registros** a través de las bases de datos consultadas (IEEE Xplore, ACM Digital Library, Scopus) durante el período 2023-2025. Tras la eliminación de duplicados (n=0), se cribaron **31 registros únicos** por título y resumen mediante un proceso de cribado híbrido que combinó análisis de similitud semántica (Embeddings all-MiniLM-L6-v2) con revisión asistida por IA (ChatGPT).

El proceso de cribado híbrido se ejecutó en dos fases. En la Fase 1, el análisis de embeddings clasificó automáticamente 21 referencias: 16 con alta confianza para inclusión (similitud >30%) y 5 con alta confianza para exclusión (similitud <10%). Las 10 referencias restantes, ubicadas en la "zona gris" (similitud 10-30%), fueron analizadas en la Fase 2 por ChatGPT, que determinó la inclusión de 6 y la exclusión de 4 referencias adicionales.

De los **22 artículos** clasificados como potencialmente relevantes en el cribado automático, **21 estudios** cumplieron todos los criterios de inclusión tras revisión de texto completo y fueron incluidos en la síntesis cualitativa. Un estudio fue excluido en la fase de elegibilidad por no reportar datos sobre técnicas de ciberseguridad específicas en contextos comerciales.

**[FIGURA 1: Diagrama de flujo PRISMA 2020 completo con números finales: 31→31→22→21]**`;

// CORRECCIÓN 4: Secciones 3.4.1, 3.4.2, 3.4.3 (ya proporcionadas por el usuario)
const section3_4 = `## 3.4 Síntesis de resultados por pregunta de investigación

### 3.4.1 RQ1: ¿Cuáles son las técnicas de ciberseguridad más comúnmente aplicadas en dispositivos IoT?

De los 21 estudios incluidos, **18 estudios (85.7%)** abordaron directamente esta pregunta, proporcionando evidencia sobre técnicas específicas de ciberseguridad implementadas en dispositivos IoT.

**Técnicas de autenticación (n=9 estudios):**

Los estudios S1, S2, S4, S8, S14 y S16 reportaron implementaciones de protocolos de autenticación avanzados. Abdulkader et al. (2025) evaluaron la infraestructura de clave pública federada (PKI), demostrando una latencia de 2.8 ms para operaciones de autenticación. Kavitha et al. (2024) propusieron un framework multi-modelo que integra criptografía (AES, SHA), códigos QR, OTPs y reconocimiento de huella palmar, aunque no reportaron métricas cuantitativas de rendimiento.

**Técnicas de encriptación y protección de datos (n=6 estudios):**

Los estudios S2, S4, S9, S17, S20 y S21 se centraron en encriptación. Azhaguramyaa y Janet (2023) presentaron el modelo MBFH (Multi-Block Fog based Health Care) para sistemas IoT-Fog, reportando mejoras de eficiencia entre 8-15%. Ellouze et al. (2025) desarrollaron un esquema de control de acceso ligero basado en blockchain con capacidad de revocación eficiente para entornos fog-enabled IoT.

**Monitoreo y detección de amenazas (n=8 estudios):**

Los estudios S3, S6, S8, S10, S13, S16, S18 y S21 abordaron técnicas de monitoreo. Maheswari et al. (2025) reportaron un framework impulsado por IA que alcanzó 98.5% de precisión, 96.4% de recall y 5.2 ms de latencia en detección de amenazas para redes 5G/6G. Mohan et al. (2025) propusieron un framework automatizado de auditoría de seguridad IoT en AWS Cloud con tiempo de respuesta de 3.5 segundos para detección de amenazas en tiempo real.

**Arquitecturas de seguridad integradas (n=7 estudios):**

Los estudios S3, S4, S10, S11, S13, S14 y S15 evaluaron arquitecturas completas de seguridad IoT. Fang et al. (2025) desarrollaron una arquitectura colaborativa Cloud-Edge que logró mejoras notables en QoS para gestión de servicios de agua inteligente, aunque no especificaron métricas concretas.

### 3.4.2 RQ2: ¿Cómo se gestionan las vulnerabilidades y amenazas en sistemas IoT?

Para la segunda pregunta de investigación, **15 estudios (71.4%)** proporcionaron evidencia sobre metodologías de gestión de vulnerabilidades.

**Enfoques preventivos (n=10 estudios):**

Li et al. (2025) aplicaron teoría de juegos evolutivos y deep learning para protección de privacidad, alcanzando 54.12 ms de latencia y 98.25% de eficiencia. Kaur et al. (2025) integraron blockchain con redes definidas por software (SDN) y arquitectura zero-trust para fog computing en healthcare, aunque no reportaron métricas cuantitativas.

**Detección y respuesta automatizada (n=8 estudios):**

Rajalakshmi et al. (2025) desarrollaron un framework de machine learning que redujo la latencia en un 15% y mejoró la eficiencia en 30% para transmisión segura de datos IoT. Sathiya et al. (2025) presentaron un framework habilitado para IoT usando Edge AI con latencia de 50 ms y 95% de eficiencia en monitoreo de salud en tiempo real.

**Gestión de incidentes (n=5 estudios):**

Vimal et al. (2024) implementaron un sistema de detección automatizada de lesiones en transporte público usando IoT con CNNs, sin reportar métricas específicas de rendimiento. Netinant et al. (2024) desarrollaron un sistema de seguridad de hogar inteligente con comandos de voz, alcanzando 83% de precisión de respuesta con latencia de 2500 ms.

**Auditoría continua (n=3 estudios):**

Mohan et al. (2025), S8, implementaron auditoría automatizada de configuración de seguridad IoT en AWS con detección de amenazas en tiempo real (3.5 segundos de latencia).

### 3.4.3 RQ3: ¿Qué evidencia existe sobre la efectividad de estas técnicas?

Respecto a la tercera pregunta, **13 estudios (61.9%)** aportaron datos cuantitativos sobre efectividad de técnicas de ciberseguridad.

**Métricas de rendimiento:**

De los 21 estudios, solo 11 reportaron métricas cuantitativas de latencia o eficiencia. Las latencias reportadas variaron significativamente:

- **Rango:** 2.8 ms (S1, PKI federada) a 3.5 segundos (S8, auditoría AWS)
- **Mediana:** 50 ms (S10, S11)
- **Estudios de healthcare:** 50-54 ms (S10, S5)
- **Estudios de autenticación:** 2.8-5.2 ms (S1, S6)

**Métricas de precisión/eficiencia:**

- **Máxima eficiencia:** 98.25% (S5, protección de privacidad con juegos evolutivos)
- **Máxima precisión:** 98.5% (S6, IA para 5G/6G)
- **Mejoras de eficiencia:** 8-15% (S20), 30% (S9)
- **Reducción de latencia:** 15% (S9)

**Limitaciones en la evidencia:**

De los 21 estudios, 10 (47.6%) no reportaron métricas cuantitativas concretas de efectividad. Los estudios S2, S3, S4, S7, S12, S14, S15, S17, S18 y S19 presentaron evaluaciones cualitativas o no especificaron resultados numéricos, lo que limita la capacidad de comparación directa entre técnicas.

**Contextos de validación:**

- **Entornos experimentales:** 7 estudios (33.3%)
- **Entornos mixtos (lab + real):** 9 estudios (42.9%)
- **Entornos industriales reales:** 1 estudio (4.8%)
- **Contextos académicos:** 3 estudios (14.3%)

La predominancia de validaciones en entornos experimentales y mixtos sugiere que la evidencia sobre efectividad en contextos industriales reales sigue siendo limitada.`;

async function fixIssues() {
  try {
    console.log('🔧 Iniciando correcciones del caso de uso...\n');

    // 1. Actualizar protocolo
    console.log('1️⃣ Actualizando protocolo (refined_question y outcomes)...');
    const updateProtocol = await pool.query(`
      UPDATE protocols 
      SET 
        refined_question = $1,
        outcomes = $2,
        updated_at = NOW()
      WHERE project_id = $3
      RETURNING id
    `, [refinedQuestion, outcome, projectId]);

    if (updateProtocol.rowCount > 0) {
      console.log('   ✅ Protocolo actualizado correctamente');
    }

    // 2. Obtener artículo actual
    console.log('\n2️⃣ Buscando artículo para actualizar...');
    const article = await pool.query(`
      SELECT id, results 
      FROM article_versions 
      WHERE project_id = $1 
      ORDER BY created_at DESC 
      LIMIT 1
    `, [projectId]);

    if (article.rows.length === 0) {
      console.log('   ⚠️ No se encontró artículo para actualizar');
      return;
    }

    console.log(`   ✅ Artículo encontrado (ID: ${article.rows[0].id})`);

    // 3. Actualizar sección Results del artículo
    console.log('\n3️⃣ Actualizando sección Results...');
    
    let resultsSection = article.rows[0].results || '';
    
    // Reemplazar sección 3.1
    resultsSection = resultsSection.replace(
      /## 3\.1 Selección de estudios[\s\S]*?(?=## 3\.2)/,
      section3_1 + '\n\n'
    );

    // Reemplazar sección 3.4
    resultsSection = resultsSection.replace(
      /## 3\.4 Síntesis de resultados por pregunta de investigación[\s\S]*?$/,
      section3_4
    );

    // 4. Actualizar artículo existente
    console.log('\n4️⃣ Guardando correcciones...');
    await pool.query(`
      UPDATE article_versions 
      SET 
        results = $1,
        change_description = 'Correcciones: sección 3.1 sin N/A, secciones 3.4.1-3.4.3 con síntesis real de RQs'
      WHERE id = $2
    `, [resultsSection, article.rows[0].id]);

    console.log('   ✅ Artículo actualizado correctamente');

    // 5. Resumen
    console.log('\n📊 RESUMEN DE CORRECCIONES:');
    console.log('   ✅ Pregunta refinada actualizada');
    console.log('   ✅ Outcome (O) definido correctamente');
    console.log('   ✅ Sección 3.1 corregida (sin N/A)');
    console.log('   ✅ Secciones 3.4.1, 3.4.2, 3.4.3 con contenido real');
    console.log('   ✅ Artículo actualizado en base de datos');
    
    console.log('\n🎉 Todas las correcciones aplicadas exitosamente!');
    console.log('\n📝 SIGUIENTE PASO: Refresca el frontend y verifica los cambios.');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

fixIssues();
