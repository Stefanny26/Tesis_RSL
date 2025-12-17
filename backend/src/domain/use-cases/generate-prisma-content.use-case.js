const PrismaItem = require('../models/prisma-item.model');

/**
 * Caso de uso: Generar contenido automatizado para ítems PRISMA
 * 
 * Este caso de uso mapea datos del protocolo, cribado y referencias
 * a los 27 ítems de PRISMA 2020, siguiendo principios de transparencia metodológica:
 * 
 * - Todo contenido automatizado se marca como 'automated'
 * - Se registra la fuente de datos (ej: 'protocol.pico', 'screening.results')
 * - El contenido original se preserva incluso tras edición humana
 * - Se distingue claramente lo que es sistema vs. decisión humana
 */
class GeneratePrismaContentUseCase {
  constructor(protocolRepository, referenceRepository, screeningRepository) {
    this.protocolRepository = protocolRepository;
    this.referenceRepository = referenceRepository;
    this.screeningRepository = screeningRepository;
  }

  /**
   * Genera contenido para todos los ítems PRISMA basado en datos del proyecto
   */
  async execute(projectId) {
    try {
      // Obtener todos los datos necesarios
      const protocol = await this.protocolRepository.findByProjectId(projectId);
      if (!protocol) {
        throw new Error('Protocolo no encontrado');
      }

      const prismaItems = [];

      // TÍTULO Y RESUMEN (Items 1-2)
      prismaItems.push(this._generateItem1_Title(projectId, protocol));
      prismaItems.push(this._generateItem2_Abstract(projectId, protocol));

      // INTRODUCCIÓN (Items 3-4)
      prismaItems.push(this._generateItem3_Rationale(projectId, protocol));
      prismaItems.push(this._generateItem4_Objectives(projectId, protocol));

      // MÉTODOS (Items 5-16)
      prismaItems.push(this._generateItem5_Protocol(projectId, protocol));
      prismaItems.push(this._generateItem6_EligibilityCriteria(projectId, protocol));
      prismaItems.push(this._generateItem7_InformationSources(projectId, protocol));
      prismaItems.push(this._generateItem8_Search(projectId, protocol));
      prismaItems.push(this._generateItem9_StudySelection(projectId, protocol));
      prismaItems.push(this._generateItem10_DataCollection(projectId, protocol));
      prismaItems.push(this._generateItem11_DataItems(projectId, protocol));
      prismaItems.push(this._generateItem12_RiskOfBias(projectId, protocol));
      prismaItems.push(this._generateItem13_EffectMeasures(projectId, protocol));
      prismaItems.push(this._generateItem14_SynthesisMethods(projectId, protocol));
      prismaItems.push(this._generateItem15_ReportingBias(projectId, protocol));
      prismaItems.push(this._generateItem16_Certainty(projectId, protocol));

      // RESULTADOS (Items 17-23)
      prismaItems.push(await this._generateItem17_StudySelection(projectId, protocol));
      prismaItems.push(this._generateItem18_StudyCharacteristics(projectId, protocol));
      prismaItems.push(this._generateItem19_RiskOfBiasResults(projectId, protocol));
      prismaItems.push(this._generateItem20_IndividualResults(projectId, protocol));
      prismaItems.push(this._generateItem21_SynthesisResults(projectId, protocol));
      prismaItems.push(this._generateItem22_ReportingBiasResults(projectId, protocol));
      prismaItems.push(this._generateItem23_CertaintyResults(projectId, protocol));

      // DISCUSIÓN Y FINANCIAMIENTO (Items 24-27)
      prismaItems.push(this._generateItem24_Discussion(projectId, protocol));
      prismaItems.push(this._generateItem25_Limitations(projectId, protocol));
      prismaItems.push(this._generateItem26_Conclusions(projectId, protocol));
      prismaItems.push(this._generateItem27_Funding(projectId, protocol));

      return prismaItems;
    } catch (error) {
      throw new Error(`Error generando contenido PRISMA: ${error.message}`);
    }
  }

  /**
   * Item 1: Identifique el informe como una revisión sistemática
   */
  _generateItem1_Title(projectId, protocol) {
    const item = new PrismaItem({
      project_id: projectId,
      item_number: 1,
      section: 'Title'
    });

    if (protocol.proposedTitle) {
      const content = `${protocol.proposedTitle}

Nota metodológica: Este título fue generado mediante análisis de la pregunta de investigación y valida do con criterios PRISMA Item 1. El título identifica claramente este trabajo como una revisión sistemática.`;
      
      item.setAutomatedContent(content, 'protocol.proposedTitle');
    }

    return item;
  }

  /**
   * Item 2: Proporcione un resumen estructurado
   */
  _generateItem2_Abstract(projectId, protocol) {
    const item = new PrismaItem({
      project_id: projectId,
      item_number: 2,
      section: 'Abstract'
    });

    // El resumen estructurado debe completarse manualmente o con IA una vez finalizada la revisión
    const content = `Estructura requerida para resumen PRISMA (pendiente de completar):

**Antecedentes**: [Contexto del estudio]
**Objetivos**: ${protocol.refinedQuestion || 'Ver pregunta de investigación en protocolo'}
**Métodos**: Revisión sistemática siguiendo PRISMA 2020
**Fuentes de datos**: ${protocol.databases?.length > 0 ? protocol.databases.map(db => db.name || db).join(', ') : 'Ver estrategia de búsqueda'}
**Criterios de elegibilidad**: Ver ítems de inclusión/exclusión (Item 6)
**Resultados**: [Pendiente - completar tras análisis]
**Limitaciones**: [Pendiente - completar en discusión]
**Conclusiones**: [Pendiente - completar tras síntesis]

Nota: Este ítem requiere contenido final una vez completada la revisión.`;

    item.setAutomatedContent(content, 'protocol.multiple');

    return item;
  }

  /**
   * Item 3: Describa la justificación de la revisión
   */
  _generateItem3_Rationale(projectId, protocol) {
    const item = new PrismaItem({
      project_id: projectId,
      item_number: 3,
      section: 'Introduction'
    });

    let content = 'Justificación de la revisión sistemática:\n\n';

    if (protocol.population || protocol.intervention || protocol.outcomes) {
      content += `**Marco PICO**:\n`;
      if (protocol.population) content += `- Población: ${protocol.population}\n`;
      if (protocol.intervention) content += `- Intervención: ${protocol.intervention}\n`;
      if (protocol.comparison) content += `- Comparación: ${protocol.comparison}\n`;
      if (protocol.outcomes) content += `- Resultados esperados: ${protocol.outcomes}\n`;
      content += '\n';
    }

    if (protocol.refinedQuestion) {
      content += `**Pregunta de investigación**:\n${protocol.refinedQuestion}\n\n`;
    }

    if (protocol.matrixElements && protocol.matrixElements.length > 0) {
      content += `**Contexto del estudio** (Matriz Es/No Es):\n`;
      content += `Este estudio aborda: ${protocol.isMatrix?.join(', ') || 'elementos definidos'}\n`;
      content += `Este estudio NO aborda: ${protocol.isNotMatrix?.join(', ') || 'elementos excluidos'}\n\n`;
    }

    content += `Nota metodológica: Esta justificación se construyó a partir de los datos del protocolo (Paso 2 del wizard). Debe expandirse con revisión de literatura y vacío de conocimiento identificado.`;

    item.setAutomatedContent(content, 'protocol.pico+matrix');

    return item;
  }

  /**
   * Item 4: Objetivos (PICOS)
   */
  _generateItem4_Objectives(projectId, protocol) {
    const item = new PrismaItem({
      project_id: projectId,
      item_number: 4,
      section: 'Introduction'
    });

    let content = 'Objetivos de la revisión sistemática (Marco PICOS):\n\n';

    if (protocol.researchQuestions && protocol.researchQuestions.length > 0) {
      content += '**Preguntas de investigación**:\n';
      protocol.researchQuestions.forEach((q, idx) => {
        content += `${idx + 1}. ${q}\n`;
      });
      content += '\n';
    }

    content += '**Criterios PICOS**:\n';
    content += `- **P** (Población): ${protocol.population || 'No especificado'}\n`;
    content += `- **I** (Intervención): ${protocol.intervention || 'No especificado'}\n`;
    content += `- **C** (Comparación): ${protocol.comparison || 'No especificado'}\n`;
    content += `- **O** (Outcomes/Resultados): ${protocol.outcomes || 'No especificado'}\n`;
    content += `- **S** (Study Design/Diseño): ${protocol.studyDesigns?.join(', ') || 'Todos los diseños relevantes'}\n\n`;

    content += 'Nota metodológica: Objetivos definidos a priori en el protocolo (Paso 2). Cumple PRISMA Item 4.';

    item.setAutomatedContent(content, 'protocol.pico');

    return item;
  }

  /**
   * Item 5: Protocolo y registro
   */
  _generateItem5_Protocol(projectId, protocol) {
    const item = new PrismaItem({
      project_id: projectId,
      item_number: 5,
      section: 'Methods'
    });

    const content = `Protocolo de revisión:

Esta revisión sistemática siguió un protocolo predefinido desarrollado internamente antes de iniciar la búsqueda y selección de estudios.

**Estado del protocolo**: Predefinido (internal protocol)
**Registro**: No registrado en PROSPERO (registro no obligatorio para revisiones sistemáticas no clínicas)
**Disponibilidad**: Protocolo disponible bajo solicitud

**Componentes del protocolo**:
- Pregunta de investigación y marco PICO
- Criterios de inclusión y exclusión
- Estrategia de búsqueda
- Proceso de selección (AI-assisted hybrid screening)
- Métodos de extracción de datos
- Evaluación de calidad

Nota metodológica: Protocolo definido completamente en los Pasos 1-6 del sistema. Todos los componentes fueron establecidos antes del cribado. Cumple PRISMA Item 5.`;

    item.setAutomatedContent(content, 'protocol.metadata');

    return item;
  }

  /**
   * Item 6: Criterios de elegibilidad
   */
  _generateItem6_EligibilityCriteria(projectId, protocol) {
    const item = new PrismaItem({
      project_id: projectId,
      item_number: 6,
      section: 'Methods'
    });

    let content = 'Criterios de elegibilidad:\n\n';

    // Criterios de inclusión
    if (protocol.inclusionCriteria && protocol.inclusionCriteria.length > 0) {
      content += '**Criterios de Inclusión**:\n';
      protocol.inclusionCriteria.forEach((criterion, idx) => {
        content += `${idx + 1}. ${criterion}\n`;
      });
      content += '\n';
    }

    // Criterios de exclusión
    if (protocol.exclusionCriteria && protocol.exclusionCriteria.length > 0) {
      content += '**Criterios de Exclusión**:\n';
      protocol.exclusionCriteria.forEach((criterion, idx) => {
        content += `${idx + 1}. ${criterion}\n`;
      });
      content += '\n';
    }

    // Información adicional
    if (protocol.temporalRange) {
      content += `**Rango temporal**: ${protocol.temporalRange.start || 'inicio'} - ${protocol.temporalRange.end || 'presente'}\n`;
    }

    if (protocol.languages) {
      content += `**Idiomas**: ${protocol.languages.join(', ')}\n`;
    }

    content += '\nNota metodológica: Criterios definidos a priori (Paso 4 del protocolo). Establecidos antes del cribado. Cumple PRISMA Item 6.';

    item.setAutomatedContent(content, 'protocol.inclusionExclusionCriteria');

    return item;
  }

  /**
   * Item 7: Fuentes de información
   */
  _generateItem7_InformationSources(projectId, protocol) {
    const item = new PrismaItem({
      project_id: projectId,
      item_number: 7,
      section: 'Methods'
    });

    let content = 'Fuentes de información:\n\n';

    if (protocol.databases && protocol.databases.length > 0) {
      content += '**Bases de datos consultadas**:\n';
      protocol.databases.forEach(db => {
        const dbName = typeof db === 'string' ? db : db.name;
        const searchDate = typeof db === 'object' && db.searchDate ? db.searchDate : '[fecha de búsqueda]';
        content += `- ${dbName} (consultada: ${searchDate})\n`;
      });
      content += '\n';
    }

    content += '**Cobertura temporal**: ';
    if (protocol.temporalRange && protocol.temporalRange.start) {
      content += `${protocol.temporalRange.start} hasta ${protocol.temporalRange.end || 'presente'}`;
    } else {
      content += 'Ver criterios de elegibilidad (Item 6)';
    }
    content += '\n\n';

    content += '**Última fecha de búsqueda**: [completar con fecha real de última búsqueda]\n\n';

    content += 'Nota metodológica: Fuentes definidas en Paso 5 del protocolo. Las fechas exactas de consulta deben registrarse al ejecutar las búsquedas. Cumple PRISMA Item 7.';

    item.setAutomatedContent(content, 'protocol.databases');

    return item;
  }

  /**
   * Item 8: Estrategia de búsqueda
   */
  _generateItem8_Search(projectId, protocol) {
    const item = new PrismaItem({
      project_id: projectId,
      item_number: 8,
      section: 'Methods'
    });

    let content = 'Estrategia de búsqueda:\n\n';

    // Priorizar searchQueries que contiene las cadenas específicas por base de datos
    if (protocol.searchQueries && protocol.searchQueries.length > 0) {
      protocol.searchQueries.forEach(queryObj => {
        const dbName = queryObj.database || queryObj.databaseName || 'Base de datos';
        content += `**${dbName}**:\n`;
        content += '```\n';
        content += queryObj.query || '[Cadena pendiente]';
        content += '\n```\n\n';
      });
    } else if (protocol.databases && protocol.databases.length > 0) {
      // Fallback al método antiguo
      protocol.databases.forEach(db => {
        const dbName = typeof db === 'string' ? db : db.name;
        const searchString = typeof db === 'object' ? db.searchString : protocol.searchString;
        
        content += `**${dbName}**:\n`;
        if (searchString) {
          content += '```\n';
          content += searchString;
          content += '\n```\n\n';
        } else {
          content += '[Cadena de búsqueda pendiente]\n\n';
        }
      });
    }

    if (protocol.keyTerms) {
      content += '**Términos clave del protocolo**:\n';
      Object.entries(protocol.keyTerms).forEach(([category, terms]) => {
        if (Array.isArray(terms) && terms.length > 0) {
          content += `- ${category}: ${terms.join(', ')}\n`;
        }
      });
      content += '\n';
    }

    content += 'Nota metodológica: Estrategia de búsqueda completa definida en Paso 5. Las cadenas fueron adaptadas a la sintaxis de cada base de datos. Cumple PRISMA Item 8 (estrategia reproducible).';

    item.setAutomatedContent(content, 'protocol.searchStrategy');

    return item;
  }

  /**
   * Item 9: Selección de estudios
   */
  _generateItem9_StudySelection(projectId, protocol) {
    const item = new PrismaItem({
      project_id: projectId,
      item_number: 9,
      section: 'Methods'
    });

    const content = `Proceso de selección de estudios:

**Enfoque metodológico**: AI-assisted hybrid screening

El proceso de selección consistió en las siguientes fases:

**Fase 1: Eliminación de duplicados**
- Detección automatizada de referencias duplicadas por DOI, título y año
- Revisión manual de duplicados ambiguos

**Fase 2: Cribado por título y resumen (AI-assisted)**
- Análisis de similitud mediante embeddings vectoriales contra criterios de inclusión/exclusión
- Alta confianza de inclusión (similitud >30%): incluidas automáticamente
- Alta confianza de exclusión (similitud <10%): excluidas automáticamente
- Zona gris (10-30%): análisis con GPT-4 y revisión humana final

**Fase 3: Revisión de texto completo**
- Evaluación manual de estudios incluidos en Fase 2
- Aplicación estricta de criterios de elegibilidad
- Registro de razones de exclusión

**Validación humana**: Todas las decisiones automatizadas son recomendaciones. La decisión final de inclusión/exclusión fue validada por revisores humanos.

Nota metodológica: Este proceso cumple PRISMA Item 9. El uso de IA está claramente declarado como asistencia, no reemplazo de criterio humano.`;

    item.setAutomatedContent(content, 'system.screening_methodology');

    return item;
  }

  /**
   * Item 10: Proceso de extracción de datos
   */
  _generateItem10_DataCollection(projectId, protocol) {
    const item = new PrismaItem({
      project_id: projectId,
      item_number: 10,
      section: 'Methods'
    });

    let content = 'Proceso de extracción de datos:\n\n';

    content += '**Método de extracción**: ';
    content += protocol.extractionMethod || '[Definir: independiente/duplicado/piloto]\n\n';

    content += '**Herramientas utilizadas**: Sistema de gestión de RSL (este sistema)\n\n';

    content += '**Proceso**:\n';
    content += '1. Extracción independiente por dos revisores\n';
    content += '2. Comparación y resolución de discrepancias\n';
    content += '3. Validación con autores cuando sea necesario\n\n';

    if (protocol.keyTerms) {
      content += '**Variables extraídas** (ver Item 11 para detalles):\n';
      Object.keys(protocol.keyTerms).forEach(category => {
        content += `- ${category}\n`;
      });
      content += '\n';
    }

    content += 'Nota metodológica: Proceso de extracción debe completarse con detalles específicos del equipo. Cumple estructura PRISMA Item 10.';

    item.setAutomatedContent(content, 'protocol.extraction_method');

    return item;
  }

  /**
   * Item 11: Ítems de datos (variables)
   */
  _generateItem11_DataItems(projectId, protocol) {
    const item = new PrismaItem({
      project_id: projectId,
      item_number: 11,
      section: 'Methods'
    });

    let content = 'Variables extraídas de cada estudio:\n\n';

    content += '**Información bibliográfica**:\n';
    content += '- Autores, año, título\n';
    content += '- Fuente de publicación\n';
    content += '- DOI/identificador\n\n';

    content += '**Características del estudio**:\n';
    content += '- Diseño del estudio\n';
    content += '- Contexto/ubicación\n';
    content += '- Tamaño de muestra\n\n';

    if (protocol.keyTerms) {
      content += '**Variables específicas del protocolo**:\n';
      Object.entries(protocol.keyTerms).forEach(([category, terms]) => {
        if (Array.isArray(terms) && terms.length > 0) {
          content += `- ${category}: ${terms.join(', ')}\n`;
        }
      });
      content += '\n';
    }

    content += '**Resultados de interés**:\n';
    if (protocol.outcomes) {
      content += `- ${protocol.outcomes}\n`;
    } else {
      content += '- [Especificar resultados primarios y secundarios]\n';
    }
    content += '\n';

    content += 'Nota metodológica: Variables definidas según términos del protocolo (Paso 6) y marco PICO. Cumple PRISMA Item 11.';

    item.setAutomatedContent(content, 'protocol.keyTerms');

    return item;
  }

  /**
   * Item 12: Evaluación de riesgo de sesgo
   */
  _generateItem12_RiskOfBias(projectId, protocol) {
    const item = new PrismaItem({
      project_id: projectId,
      item_number: 12,
      section: 'Methods'
    });

    const content = `Evaluación de calidad y riesgo de sesgo:

**Herramienta utilizada**: Criterios de evaluación de calidad customizados

**Criterios aplicados**:
${protocol.qualityCriteria?.join('\n') || 
'1. Claridad metodológica\n' +
'2. Validez de resultados\n' +
'3. Rigor en recolección de datos\n' +
'4. Transparencia en limitaciones\n' +
'5. Reproducibilidad del estudio\n' +
'6. Adecuación del diseño\n' +
'7. Análisis apropiado de datos'}

**Nivel de aplicación**: Evaluación a nivel de estudio completo

**Umbral de calidad**: ${protocol.qualityThreshold || '[Definir umbral de inclusión]'}

**Proceso de evaluación**:
- Evaluación independiente por dos revisores
- Resolución de desacuerdos por consenso o tercer revisor
- Registro sistemático de justificaciones

**Uso en síntesis**: Los resultados de la evaluación de calidad se utilizarán para:
- Análisis de sensibilidad
- Ponderación de estudios en síntesis cualitativa
- Identificación de limitaciones metodológicas

Nota metodológica: Cumple PRISMA Item 12. Metodología clara y reproducible.`;

    item.setAutomatedContent(content, 'protocol.qualityCriteria');

    return item;
  }

  /**
   * Item 13: Medidas de resumen
   */
  _generateItem13_EffectMeasures(projectId, protocol) {
    const item = new PrismaItem({
      project_id: projectId,
      item_number: 13,
      section: 'Methods'
    });

    const content = `Medidas de resumen:

**Tipo de síntesis**: ${protocol.synthesisType || 'Síntesis cualitativa/narrativa'}

**Justificación**: Dado el carácter exploratorio de esta revisión sistemática y la heterogeneidad esperada en diseños y contextos de los estudios, se realizará una síntesis cualitativa en lugar de meta-análisis cuantitativo.

**Medidas de resumen**:
- Frecuencias y proporciones de hallazgos
- Categorización temática de resultados
- Tablas de evidencia estructuradas

**Nota sobre meta-análisis**: No aplicable para esta revisión debido a [especificar razón: heterogeneidad metodológica/contextos diversos/variables cualitativas].

Si se realizara meta-análisis, se reportarían: razón de riesgo (RR), diferencia de medias (MD), intervalos de confianza al 95%, y medidas de heterogeneidad (I²).

Nota metodológica: Cumple PRISMA Item 13. Declaración transparente del tipo de síntesis.`;

    item.setAutomatedContent(content, 'protocol.synthesisMethod');

    return item;
  }

  /**
   * Item 14: Métodos de síntesis
   */
  _generateItem14_SynthesisMethods(projectId, protocol) {
    const item = new PrismaItem({
      project_id: projectId,
      item_number: 14,
      section: 'Methods'
    });

    let content = 'Métodos de síntesis de resultados:\n\n';

    content += '**Enfoque de síntesis**: Síntesis cualitativa estructurada\n\n';

    content += '**Proceso de síntesis**:\n';
    content += '1. Extracción de hallazgos clave de cada estudio\n';
    content += '2. Codificación y categorización temática\n';
    content += '3. Identificación de patrones y relaciones\n';
    content += '4. Síntesis narrativa por categorías\n\n';

    if (protocol.matrixElements && protocol.matrixElements.length > 0) {
      content += '**Marco de análisis** (basado en Matriz Es/No Es):\n';
      protocol.matrixElements.forEach((element, idx) => {
        content += `${idx + 1}. ${element.concept || element}\n`;
      });
      content += '\n';
    }

    content += '**Manejo de heterogeneidad**:\n';
    content += '- Análisis de subgrupos por: [contexto/tipo de intervención/población]\n';
    content += '- Análisis de sensibilidad según calidad metodológica\n\n';

    content += '**Medidas de consistencia**: No aplicable (síntesis cualitativa). Si se realizara meta-análisis, se reportaría I².\n\n';

    content += 'Nota metodológica: Cumple PRISMA Item 14. Método de síntesis apropiado para datos cualitativos/heterogéneos.';

    item.setAutomatedContent(content, 'protocol.synthesisMethod+matrix');

    return item;
  }

  /**
   * Item 15: Sesgo de reporte entre estudios
   */
  _generateItem15_ReportingBias(projectId, protocol) {
    const item = new PrismaItem({
      project_id: projectId,
      item_number: 15,
      section: 'Methods'
    });

    const content = `Evaluación de sesgo de publicación y reporte selectivo:

**Métodos de evaluación**:
1. **Sesgo de publicación**: Análisis de múltiples fuentes de búsqueda (bases académicas, literatura gris, registros de ensayos)
2. **Reporte selectivo**: Comparación de resultados reportados vs. metodología declarada en cada estudio
3. **Análisis temporal**: Evaluación de tendencias de publicación a lo largo del rango temporal

**Limitaciones reconocidas**:
- Imposibilidad de detectar estudios nunca publicados
- Dificultad en acceso a protocolos previos de estudios

**Estrategias de mitigación**:
- Búsqueda exhaustiva en múltiples bases de datos
- Inclusión de conferencias y literatura gris cuando sea relevante
- Contacto con autores para datos no publicados

**Evaluación de impacto**: Los posibles sesgos de publicación se discutirán en limitaciones y se considerarán en la interpretación de hallazgos.

Nota metodológica: Cumple PRISMA Item 15. Reconoce limitaciones inherentes a revisiones sistemáticas.`;

    item.setAutomatedContent(content, 'system.bias_assessment');

    return item;
  }

  /**
   * Item 16: Evaluación de certeza
   */
  _generateItem16_Certainty(projectId, protocol) {
    const item = new PrismaItem({
      project_id: projectId,
      item_number: 16,
      section: 'Methods'
    });

    const content = `Evaluación de certeza de la evidencia:

**Marco utilizado**: Evaluación narrativa de calidad de evidencia

**Criterios considerados**:
1. **Riesgo de sesgo**: Basado en evaluación de calidad (Item 12)
2. **Consistencia**: Coherencia de hallazgos entre estudios
3. **Directividad**: Relevancia directa para la pregunta de investigación
4. **Precisión**: Tamaño de muestra y solidez de conclusiones
5. **Sesgo de publicación**: Análisis de Item 15

**Clasificación de certeza**:
- **Alta**: Confianza sólida en los hallazgos
- **Moderada**: Probable que hallazgos sean correctos
- **Baja**: Limitada confianza en los hallazgos
- **Muy baja**: Hallazgos inciertos

**Aplicación**: La certeza se evaluará por resultado de interés y se reportará en la síntesis de evidencia.

**Análisis de sensibilidad**: Se realizarán análisis excluyendo estudios de baja calidad para evaluar robustez de conclusiones.

Nota metodológica: Cumple PRISMA Item 16. Marco apropiado para síntesis cualitativa.`;

    item.setAutomatedContent(content, 'system.certainty_assessment');

    return item;
  }

  /**
   * Item 17: Selección de estudios (con diagrama de flujo PRISMA)
   */
  async _generateItem17_StudySelection(projectId, protocol) {
    const item = new PrismaItem({
      project_id: projectId,
      item_number: 17,
      section: 'Results'
    });

    let content = 'Selección de estudios:\n\n';

    // Intentar obtener resultados reales del cribado
    if (protocol.screeningResults && protocol.screeningResults.summary) {
      const summary = protocol.screeningResults.summary;
      
      content += '**Diagrama de flujo PRISMA**:\n\n';
      content += '```\n';
      content += '┌─────────────────────────────────────┐\n';
      content += '│     IDENTIFICACIÓN                  │\n';
      content += '├─────────────────────────────────────┤\n';
      content += `│ Referencias identificadas: ${summary.totalReferences || summary.processed || 0}       │\n`;
      content += `│ Duplicados removidos: ${summary.duplicates || 0}            │\n`;
      content += '└─────────────────────────────────────┘\n';
      content += '            ↓\n';
      content += '┌─────────────────────────────────────┐\n';
      content += '│     CRIBADO (AI-ASSISTED)           │\n';
      content += '├─────────────────────────────────────┤\n';
      content += `│ Fase 1 - Embeddings:                │\n`;
      content += `│   Alta confianza incluir: ${summary.phase1?.highConfidenceInclude || 0}     │\n`;
      content += `│   Alta confianza excluir: ${summary.phase1?.highConfidenceExclude || 0}     │\n`;
      content += `│   Zona gris (revisión): ${summary.phase1?.greyZone || 0}         │\n`;
      content += '└─────────────────────────────────────┘\n';
      content += '            ↓\n';
      content += '┌─────────────────────────────────────┐\n';
      content += '│     ELEGIBILIDAD                    │\n';
      content += '├─────────────────────────────────────┤\n';
      content += `│ Fase 2 - GPT + Revisión humana:    │\n`;
      content += `│   Analizadas: ${summary.phase2?.analyzed || 0}                  │\n`;
      content += `│   Validadas manualmente: ${summary.phase2?.humanValidated || 0}        │\n`;
      content += '└─────────────────────────────────────┘\n';
      content += '            ↓\n';
      content += '┌─────────────────────────────────────┐\n';
      content += '│     INCLUIDAS                       │\n';
      content += '├─────────────────────────────────────┤\n';
      content += `│ Estudios incluidos: ${summary.included || 0}             │\n`;
      content += `│ Estudios excluidos: ${summary.excluded || 0}             │\n`;
      content += `│ Tasa de inclusión: ${summary.included && summary.processed ? Math.round((summary.included/summary.processed)*100) : 0}%             │\n`;
      content += '└─────────────────────────────────────┘\n';
      content += '```\n\n';

      content += '**Razones de exclusión**:\n';
      if (summary.exclusionReasons) {
        Object.entries(summary.exclusionReasons).forEach(([reason, count]) => {
          content += `- ${reason}: ${count} estudios\n`;
        });
      } else {
        content += '- [Pendiente: registrar razones específicas]\n';
      }
      content += '\n';

      content += `**Metodología de cribado**: AI-assisted hybrid screening\n`;
      content += `- Fase 1 (embeddings): automática con umbrales de confianza\n`;
      content += `- Fase 2 (GPT-4): análisis de zona gris\n`;
      content += `- Validación humana: decisión final en todos los casos\n\n`;

      content += 'Nota metodológica: Datos reales del cribado ejecutado. Cumple PRISMA Item 17 (diagrama de flujo + números en cada etapa).';
      
      item.setAutomatedContent(content, 'screening.results');
    } else {
      content += '**Estado**: Pendiente de ejecutar cribado automático\n\n';
      content += 'Para generar el diagrama de flujo PRISMA con datos reales:\n';
      content += '1. Ir a la sección "Cribado de Referencias"\n';
      content += '2. Ejecutar el cribado automático (Fase 1 + Fase 2)\n';
      content += '3. Regresar aquí para ver el diagrama actualizado\n\n';
      content += 'Nota metodológica: Este ítem se completará automáticamente con datos del cribado. Cumple PRISMA Item 17.';
      
      item.contentType = 'pending';
    }

    return item;
  }

  /**
   * Item 18: Características de los estudios
   */
  _generateItem18_StudyCharacteristics(projectId, protocol) {
    const item = new PrismaItem({
      project_id: projectId,
      item_number: 18,
      section: 'Results'
    });

    const content = `Características de los estudios incluidos:

**Tabla de características** (pendiente de completar tras análisis):

| Estudio | Año | Diseño | Población | Intervención | Resultados | Calidad |
|---------|-----|--------|-----------|--------------|------------|---------|
| [Autor] | [Año] | [Tipo] | [N=] | [Descripción] | [Hallazgos] | [Score] |

**Resumen de características**:
- Rango de años: [YYYY-YYYY]
- Tipos de estudio: [distribución]
- Contextos: [ubicaciones/sectores]
- Tamaños de muestra: [rango]

**Extracción de datos**: Ver tabla completa en Apéndice [X]

**Citas completas**: Ver lista de referencias

Nota metodológica: Esta tabla debe completarse con los datos extraídos de cada estudio incluido (Item 10-11). Cumple PRISMA Item 18.`;

    item.contentType = 'pending'; // Requiere trabajo manual post-cribado

    return item;
  }

  /**
   * Items 19-23: Resultados (requieren análisis posterior)
   */
  _generateItem19_RiskOfBiasResults(projectId, protocol) {
    return this._generatePendingResultItem(projectId, 19, 'Results', 
      'Presentar resultados de evaluación de riesgo de sesgo/calidad para cada estudio. Ver Item 12 para metodología.');
  }

  _generateItem20_IndividualResults(projectId, protocol) {
    return this._generatePendingResultItem(projectId, 20, 'Results',
      'Presentar resultados individuales de cada estudio: datos de resumen e intervalos de confianza. Considerar gráfico de bosque si aplica.');
  }

  _generateItem21_SynthesisResults(projectId, protocol) {
    return this._generatePendingResultItem(projectId, 21, 'Results',
      'Presentar síntesis de resultados: hallazgos principales, patrones identificados, medidas de consistencia.');
  }

  _generateItem22_ReportingBiasResults(projectId, protocol) {
    return this._generatePendingResultItem(projectId, 22, 'Results',
      'Presentar evaluación de sesgo de publicación/reporte. Ver Item 15 para metodología.');
  }

  _generateItem23_CertaintyResults(projectId, protocol) {
    return this._generatePendingResultItem(projectId, 23, 'Results',
      'Presentar evaluación de certeza de evidencia por resultado. Ver Item 16 para criterios.');
  }

  /**
   * Items 24-27: Discusión y cierre
   */
  _generateItem24_Discussion(projectId, protocol) {
    return this._generatePendingResultItem(projectId, 24, 'Discussion',
      'Resumir hallazgos principales con fortaleza de evidencia. Considerar relevancia para diferentes audiencias (investigadores, profesionales, tomadores de decisión).');
  }

  _generateItem25_Limitations(projectId, protocol) {
    const item = new PrismaItem({
      project_id: projectId,
      item_number: 25,
      section: 'Discussion'
    });

    const content = `Limitaciones de la revisión:

**A nivel de estudios individuales**:
- [Calidad metodológica variable]
- [Riesgo de sesgo identificado]
- [Heterogeneidad en diseños]

**A nivel de revisión**:
- [Bases de datos consultadas - posible sesgo de idioma]
- [Literatura gris limitada]
- [Rango temporal]

**Uso de IA en cribado**:
- Sesgo potencial de algoritmos de embeddings/LLM
- Dependencia de calidad de datos de entrenamiento
- Mitigación: validación humana final en todas las decisiones

**Recuperación incompleta**:
- Posibles estudios relevantes no identificados
- Limitaciones de cadenas de búsqueda

**Transparencia metodológica**: Todas las limitaciones fueron consideradas en la interpretación de hallazgos.

Nota metodológica: Cumple PRISMA Item 25. Discusión honesta de limitaciones metodológicas.`;

    item.setAutomatedContent(content, 'system.limitations_framework');

    return item;
  }

  _generateItem26_Conclusions(projectId, protocol) {
    return this._generatePendingResultItem(projectId, 26, 'Discussion',
      'Interpretación general de resultados en contexto de otra evidencia. Implicaciones para investigación futura y práctica.');
  }

  _generateItem27_Funding(projectId, protocol) {
    const item = new PrismaItem({
      project_id: projectId,
      item_number: 27,
      section: 'Funding'
    });

    const content = `Financiamiento y conflictos de interés:

**Fuentes de financiamiento**: [Especificar fuentes o indicar "Ninguna"]

**Rol de los financiadores**: [Describir participación en el diseño, ejecución, análisis o escritura, o indicar "No aplicable"]

**Conflictos de interés**: Los autores declaran [no tener conflictos de interés / los siguientes conflictos...]

**Apoyo institucional**: [Describir apoyo de instituciones]

**Herramientas utilizadas**: Esta revisión sistemática utilizó [nombre del sistema] para gestión del protocolo, cribado AI-assisted y compliance PRISMA.

Nota metodológica: Cumple PRISMA Item 27. Declaración completa y transparente.`;

    item.contentType = 'pending'; // Requiere información específica del proyecto

    return item;
  }

  /**
   * Helper: Generar ítem pendiente de resultados
   */
  _generatePendingResultItem(projectId, itemNumber, section, guidance) {
    const item = new PrismaItem({
      project_id: projectId,
      item_number: itemNumber,
      section: section
    });

    const content = `Item ${itemNumber}: Pendiente de completar tras análisis final

**Guía PRISMA**:
${guidance}

**Estado**: Este ítem requiere datos del análisis completo de estudios incluidos.

**Próximos pasos**:
1. Completar extracción de datos (Item 10)
2. Realizar síntesis de resultados (Item 14)
3. Completar este ítem con hallazgos

Nota metodológica: Placeholder metodológico. Este ítem se completará manualmente o con asistencia de IA una vez disponibles los datos.`;

    item.contentType = 'pending';

    return item;
  }
}

module.exports = GeneratePrismaContentUseCase;
