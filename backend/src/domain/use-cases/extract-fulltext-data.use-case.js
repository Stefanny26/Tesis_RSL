const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

/**
 * Use Case: Extraer Datos de PDFs Completos
 * 
 * Analiza PDFs de referencias incluidas para extraer información estructurada
 * que será usada en la redacción de PRISMA y ARTÍCULO.
 * 
 * ⚠️ IMPORTANTE: Este use case NO toma decisiones de inclusión/exclusión.
 * Solo extrae y estructura información de PDFs ya seleccionados.
 */
class ExtractFullTextDataUseCase {
  constructor({ referenceRepository, aiService }) {
    this.referenceRepository = referenceRepository;
    this.aiService = aiService;
  }

  /**
   * Extrae texto de un PDF usando pdf-parse
   */
  async extractTextFromPDF(pdfPath) {
    try {
      const dataBuffer = fs.readFileSync(pdfPath);
      const data = await pdf(dataBuffer);
      return data.text;
    } catch (error) {
      console.error(`❌ Error extrayendo texto del PDF ${pdfPath}:`, error);
      throw new Error(`No se pudo leer el PDF: ${error.message}`);
    }
  }

  /**
   * Usa IA para extraer información estructurada del texto del PDF
   * ⚠️ NO toma decisiones, solo extrae datos
   */
  async extractStructuredData(pdfText, referenceMetadata) {
    const prompt = `You are analyzing a scientific article for data extraction in a systematic literature review.

Article Metadata:
- Title: ${referenceMetadata.title}
- Authors: ${referenceMetadata.authors || 'Not specified'}
- Year: ${referenceMetadata.year || 'Not specified'}

Extract the following information from the full text:

1. Study Type: (e.g., Empirical study, Survey, Case study, Literature review, Theoretical)
2. Research Context: (e.g., Industry, Academia, Healthcare, Software development)
3. Methodology: Brief description of the research method used
4. Variables/Constructs: Main variables or constructs measured or analyzed
5. Metrics Used: Specific metrics or measurements reported
6. Key Findings: 3-5 main findings (factual, not interpretative)
7. Limitations: Any limitations explicitly mentioned by the authors

Respond ONLY with valid JSON in this exact format:
{
  "study_type": "string",
  "context": "string",
  "methodology": "string",
  "variables": ["string"],
  "metrics": ["string"],
  "key_findings": ["string"],
  "limitations": ["string"]
}

Do NOT add any text before or after the JSON. Extract factual information only, do not interpret or evaluate.`;

    try {
      const response = await this.aiService.generateText(prompt, pdfText.substring(0, 6000));
      
      // Limpiar respuesta y parsear JSON
      let cleanedResponse = response.trim();
      
      // Remover markdown code blocks si existen
      if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse
          .replace(/^```json\n?/, '')
          .replace(/^```\n?/, '')
          .replace(/\n?```$/, '');
      }
      
      const extractedData = JSON.parse(cleanedResponse);
      
      return extractedData;
    } catch (error) {
      console.error('❌ Error en extracción estructurada con IA:', error);
      
      // Retornar estructura vacía en caso de error
      return {
        study_type: 'Not extracted',
        context: 'Not extracted',
        methodology: 'Not extracted',
        variables: [],
        metrics: [],
        key_findings: [],
        limitations: []
      };
    }
  }

  /**
   * Procesa un PDF individual
   */
  async processSinglePDF(referenceId, projectId) {
    try {
      // 1. Obtener referencia de la base de datos
      const reference = await this.referenceRepository.findById(referenceId);
      
      if (!reference) {
        throw new Error(`Referencia ${referenceId} no encontrada`);
      }

      if (reference.projectId !== projectId) {
        throw new Error('La referencia no pertenece al proyecto especificado');
      }

      // 2. Verificar que hay PDF cargado
      if (!reference.pdfPath) {
        throw new Error('La referencia no tiene PDF asociado');
      }

      const fullPath = path.resolve(__dirname, '../../../', reference.pdfPath);
      
      if (!fs.existsSync(fullPath)) {
        throw new Error(`Archivo PDF no encontrado: ${fullPath}`);
      }

      // 3. Extraer texto del PDF
      console.log(`📄 Extrayendo texto de: ${reference.title}`);
      const pdfText = await this.extractTextFromPDF(fullPath);

      // 4. Extraer datos estructurados con IA
      console.log(`🤖 Analizando contenido con IA...`);
      const structuredData = await this.extractStructuredData(pdfText, {
        title: reference.title,
        authors: reference.authors,
        year: reference.year
      });

      // 5. Guardar datos extraídos en la referencia
      await this.referenceRepository.update(referenceId, {
        fullTextData: JSON.stringify(structuredData),
        fullTextExtracted: true,
        fullTextExtractedAt: new Date()
      });

      console.log(`✅ Datos extraídos exitosamente de: ${reference.title}`);

      return {
        success: true,
        referenceId,
        title: reference.title,
        extractedData: structuredData
      };

    } catch (error) {
      console.error(`❌ Error procesando PDF ${referenceId}:`, error);
      throw error;
    }
  }

  /**
   * Procesa todos los PDFs de referencias incluidas en un proyecto
   */
  async processProjectPDFs(projectId) {
    try {
      // 1. Obtener todas las referencias incluidas con PDF
      const references = await this.referenceRepository.findByProject(projectId);
      
      const includedReferences = references.filter(ref => 
        (ref.screeningStatus === 'included' || 
         ref.screeningStatus === 'fulltext_included') &&
        ref.pdfPath
      );

      if (includedReferences.length === 0) {
        return {
          success: true,
          message: 'No hay referencias incluidas con PDFs para procesar',
          processed: 0,
          results: []
        };
      }

      console.log(`📚 Procesando ${includedReferences.length} PDFs...`);

      // 2. Procesar cada PDF secuencialmente (evitar rate limits)
      const results = [];
      let processed = 0;
      let errors = 0;

      for (const reference of includedReferences) {
        try {
          const result = await this.processSinglePDF(reference.id, projectId);
          results.push(result);
          processed++;
        } catch (error) {
          console.error(`❌ Error en ${reference.title}:`, error.message);
          results.push({
            success: false,
            referenceId: reference.id,
            title: reference.title,
            error: error.message
          });
          errors++;
        }
        
        // Pequeña pausa entre llamadas a IA
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log(`✅ Procesamiento completo: ${processed} exitosos, ${errors} errores`);

      return {
        success: true,
        total: includedReferences.length,
        processed,
        errors,
        results
      };

    } catch (error) {
      console.error('❌ Error procesando PDFs del proyecto:', error);
      throw error;
    }
  }

  /**
   * Obtiene resumen de datos extraídos del proyecto (para PRISMA/ARTÍCULO)
   */
  async getProjectDataSummary(projectId) {
    try {
      const references = await this.referenceRepository.findByProject(projectId);
      
      const extractedReferences = references.filter(ref => ref.fullTextExtracted);

      if (extractedReferences.length === 0) {
        return {
          success: true,
          message: 'No hay datos extraídos disponibles',
          summary: null
        };
      }

      // Agregar datos extraídos
      const studyTypes = {};
      const contexts = {};
      const allFindings = [];
      const allLimitations = [];

      extractedReferences.forEach(ref => {
        if (ref.fullTextData) {
          try {
            const data = typeof ref.fullTextData === 'string' 
              ? JSON.parse(ref.fullTextData) 
              : ref.fullTextData;

            // Contar tipos de estudio
            if (data.study_type) {
              studyTypes[data.study_type] = (studyTypes[data.study_type] || 0) + 1;
            }

            // Contar contextos
            if (data.context) {
              contexts[data.context] = (contexts[data.context] || 0) + 1;
            }

            // Recolectar hallazgos y limitaciones
            if (data.key_findings) {
              allFindings.push(...data.key_findings);
            }

            if (data.limitations) {
              allLimitations.push(...data.limitations);
            }
          } catch (e) {
            console.error('Error parsing fullTextData:', e);
          }
        }
      });

      return {
        success: true,
        totalReferences: extractedReferences.length,
        summary: {
          studyTypes,
          contexts,
          findingsCount: allFindings.length,
          limitationsCount: allLimitations.length
        },
        references: extractedReferences.map(ref => ({
          id: ref.id,
          title: ref.title,
          data: typeof ref.fullTextData === 'string' 
            ? JSON.parse(ref.fullTextData) 
            : ref.fullTextData
        }))
      };

    } catch (error) {
      console.error('❌ Error obteniendo resumen de datos:', error);
      throw error;
    }
  }
}

module.exports = ExtractFullTextDataUseCase;
