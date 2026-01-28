const OpenAI = require('openai');

/**
 * Use Case: Generador de Criterios de Inclusión y Exclusión
 * 
 * Genera criterios de inclusión y exclusión basados en el protocolo PICO
 * para ayudar en la selección de estudios en una revisión sistemática.
 */
class GenerateInclusionExclusionCriteriaUseCase {
  constructor() {
    // Inicializar OpenAI/ChatGPT
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }
  }

  /**
   * Genera criterios de inclusión y exclusión
   */
  async execute({ selectedTitle, protocolTerms, picoData, projectTitle, aiProvider = 'chatgpt', specificType, customFocus, categoryIndex, categoryName, yearStart, yearEnd }) {
    try {
      // REGLA METODOLÓGICA: Los criterios DEBEN basarse en el título de la RSL seleccionado
      const rslTitle = selectedTitle || projectTitle || 'Proyecto sin título';
      
      console.log('Generando criterios de inclusión/exclusión...');
      console.log('Título RSL:', rslTitle.substring(0, 60) + '...');
      console.log('Rango temporal para prompt: yearStart =', yearStart, ', yearEnd =', yearEnd);
      
      if (specificType) {
        console.log('Regenerando tipo específico:', specificType);
        console.log('Categoría específica:', categoryName || categoryIndex);
        console.log('Enfoque personalizado:', customFocus || 'predeterminado');
      }

      console.log('Construyendo prompt con años:', { yearStart, yearEnd });

      const prompt = this.buildPrompt({ 
        rslTitle,
        protocolTerms, 
        picoData, 
        projectTitle, 
        specificType, 
        customFocus, 
        categoryIndex, 
        categoryName, 
        yearStart, 
        yearEnd 
      });
      
      let text;
      if (!this.openai) {
        throw new Error('No hay proveedor de IA configurado');
      }
      
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      });
      text = completion.choices[0].message.content;

      console.log('Respuesta completa de IA:');
      console.log(text);
      console.log('─────────────────────────────────────');

      // Parsear la respuesta
      const isSingleCriterion = categoryIndex !== undefined && categoryName;
      const criteria = this.parseResponse(text, isSingleCriterion);

      console.log('Criterios generados exitosamente');

      return {
        success: true,
        data: criteria,
        isSingleCriterion
      };

    } catch (error) {
      console.error('Error generando criterios:', error);
      throw new Error(`Error generando criterios: ${error.message}`);
    }
  }

  /**
   * Construye el prompt para la IA
   */
  buildPrompt({ rslTitle, protocolTerms, picoData, projectTitle, specificType, customFocus, categoryIndex, categoryName, yearStart, yearEnd }) {
    // Usar título de la RSL seleccionado como fuente principal
    const title = rslTitle || projectTitle || 'Proyecto sin título';
    
    // Extraer términos del protocolo
    const technologies = protocolTerms?.tecnologia || protocolTerms?.technologies || [];
    const domains = protocolTerms?.dominio || protocolTerms?.applicationDomain || [];
    const studyTypes = protocolTerms?.tipoEstudio || protocolTerms?.studyType || [];
    const themes = protocolTerms?.focosTematicos || protocolTerms?.thematicFocus || [];

    // Si hay categoría específica, generar solo ese criterio
    if (categoryIndex !== undefined && categoryName && specificType) {
      return this.buildSingleCriterionPrompt({
        title,
        technologies,
        domains,
        studyTypes,
        themes,
        picoData,
        specificType,
        customFocus,
        categoryIndex,
        categoryName,
        yearStart,
        yearEnd
      });
    }

    // Si hay tipo específico y enfoque personalizado, generar prompt especializado
    if (specificType && customFocus) {
      return this.buildSpecificTypePrompt({
        title,
        technologies,
        domains,
        studyTypes,
        themes,
        picoData,
        specificType,
        specificType,
        customFocus,
        yearStart,
        yearEnd
      });
    }

    return `
Eres un experto en Metodología PRISMA 2020. Tu misión es generar la tabla de Criterios de Elegibilidad (Inclusión/Exclusión) para una Revisión Sistemática.

REGLA DE ORO: Los criterios no son "opuestos". El criterio de Inclusión define la PERTINENCIA. El de Exclusión define el RUIDO o falta de CALIDAD/ACCESO.

RESPONDE ÚNICAMENTE con la TABLA en formato de texto (sin markdown, sin JSON).

═══════════════════════════════════════════════════════════════
INSUMOS TÉCNICOS (DERIVACIÓN OBLIGATORIA)
═══════════════════════════════════════════════════════════════

TÍTULO: "${title}"

TECNOLOGÍAS (I - Intervención):
${technologies.length ? technologies.map(t => `• ${t}`).join('\n') : '• No especificado'}

CONTEXTO (P - Población):
${domains.length ? domains.map(d => `• ${d}`).join('\n') : '• No especificado'}

OUTCOMES (O - Resultados):
${themes.length ? themes.map(t => `• ${t}`).join('\n') : '• Métricas de rendimiento/impacto'}

COMPONENTES PICO:
- P (Población): ${picoData?.population || 'No especificado'}
- I (Intervención): ${picoData?.intervention || 'No especificado'}
- C (Comparación): ${picoData?.comparison || 'N/A'}
- O (Outcomes): ${picoData?.outcome || 'Métricas de rendimiento/impacto'}

RANGO TEMPORAL: ${yearStart || 2019} - ${yearEnd || 2025}

═══════════════════════════════════════════════════════════════
INSTRUCCIONES DE REDACCIÓN ACADÉMICA
═══════════════════════════════════════════════════════════════

1. COBERTURA TEMÁTICA:
   - Debe mencionar explícitamente la relación entre [I] y [P] del PICO
   - Usar términos específicos del protocolo, no generalizaciones

2. TECNOLOGÍAS ABORDADAS:
   - No solo listar, sino especificar el ROL de la tecnología
   - Ejemplo: "como arquitectura principal" o "en la capa de persistencia"

3. TIPO DE ESTUDIO:
   - Priorizar: estudios empíricos, experimentales, casos de estudio, comparativas técnicas
   - Excluir: opiniones, tutoriales sin validación, documentación conceptual

4. EXCLUSIÓN DE CALIDAD:
   - La exclusión debe enfocarse en:
     * Falta de datos o metodología opaca
     * Literatura gris o duplicidad
     * Estudios tangenciales donde el tema no es central
     * Tecnologías obsoletas o fuera del ecosistema

5. RANGO TEMPORAL:
   OBLIGATORIO: Usar exactamente los años ${yearStart || 2019}-${yearEnd || 2025}
   Justificar la exclusión de estudios anteriores (relevancia tecnológica actual)

6. IDIOMA:
   - Inclusión: Inglés (idioma dominante en literatura técnica)
   - Exclusión: Otros idiomas sin traducción técnica certificada o resumen detallado

═══════════════════════════════════════════════════════════════
FORMATO DE SALIDA (TABLA ESTRICTA)
═══════════════════════════════════════════════════════════════

Responde SOLO con la tabla usando el separador " | ". 6 filas obligatorias:

Categoría | Criterio de Inclusión | Criterio de Exclusión
Cobertura temática | [Estudios que analizan [I] aplicados a [P] para [O]] | [Estudios donde el tema es tangencial o no aborda la relación técnica central]
Tecnologías abordadas | [Uso específico de [tecnología] en el diseño o implementación] | [Tecnologías obsoletas o fuera del ecosistema definido en el protocolo]
Tipo de estudio | [Investigaciones empíricas, estudios experimentales, comparativas técnicas y revisiones sistemáticas previas] | [Artículos de opinión, editoriales, tutoriales sin validación o discusiones conceptuales sin datos]
Tipo de documento | [Artículos de revistas científicas (Journals) y conferencias indexadas (Peer-reviewed)] | [Blogs, white papers, libros de texto o documentación oficial de proveedores]
Rango temporal | [Publicaciones realizadas entre ${yearStart || 2019} y ${yearEnd || 2025}] | [Estudios publicados antes de ${yearStart || 2019} o sin relevancia para el estado del arte actual]
Idioma | [Artículos escritos en Inglés (idioma de la literatura técnica dominante)] | [Artículos en otros idiomas que no dispongan de traducción técnica certificada o resumen detallado]

═══════════════════════════════════════════════════════════════
VALIDACIÓN FINAL
═══════════════════════════════════════════════════════════════

Antes de generar, verifica:
- Cada criterio de INCLUSIÓN menciona términos específicos del protocolo
- Cada criterio de EXCLUSIÓN justifica POR QUÉ se descarta (no solo niega la inclusión)
- Los años son exactamente ${yearStart || 2019}-${yearEnd || 2025}
- La tabla tiene 6 filas con 3 columnas separadas por " | "

GENERA LA TABLA AHORA:
`.trim();
  }

  /**
   * Construye un prompt específico para regenerar solo criterios de inclusión o exclusión
   */
  buildSpecificTypePrompt({ technologies, domains, studyTypes, themes, picoData, projectTitle, specificType, customFocus, yearStart, yearEnd }) {
    const typeLabel = specificType === 'inclusion' ? 'INCLUSIÓN' : 'EXCLUSIÓN';
    const oppositeLabel = specificType === 'inclusion' ? 'exclusión' : 'inclusión';

    return `
Eres un experto en metodología PRISMA para revisiones sistemáticas. Regenera criterios de ${typeLabel} con enfoque personalizado.

RESPONDE ÚNICAMENTE con la TABLA en formato texto (sin markdown).

═══════════════════════════════════════════════════════════════
CONTEXTO DEL PROTOCOLO
═══════════════════════════════════════════════════════════════

PROYECTO: "${projectTitle}"

TÉRMINOS DEL PROTOCOLO:
- Tecnología: ${technologies.join(', ')}
- Dominio: ${domains.join(', ')}
- Tipo estudio: ${studyTypes.join(', ')}
- Focos: ${themes.join(', ')}

PICO:
- P: ${picoData?.population || 'No especificado'}
- I: ${picoData?.intervention || 'No especificado'}
- C: ${picoData?.comparison || 'N/A'}
- O: ${picoData?.outcome || 'No especificado'}

═══════════════════════════════════════════════════════════════
ENFOQUE PERSONALIZADO DEL USUARIO
═══════════════════════════════════════════════════════════════

"${customFocus}"

═══════════════════════════════════════════════════════════════
INSTRUCCIONES
═══════════════════════════════════════════════════════════════

Genera TABLA con 6 categorías. Formato:
Categoría | Criterio de Inclusión | Criterio de Exclusión

IMPORTANTE:
- Los criterios de ${typeLabel} (columna ${specificType === 'inclusion' ? '2' : '3'}) deben ser MUY ESPECÍFICOS
- Deben reflejar el enfoque personalizado: "${customFocus}"
- Deben mencionar los términos del protocolo
- Los criterios de ${oppositeLabel} (columna ${specificType === 'inclusion' ? '3' : '2'}) pueden ser genéricos

CATEGORÍAS OBLIGATORIAS (6):
1. Cobertura temática
2. Tecnologías abordadas
3. Tipo de estudio
4. Tipo de documento
5. Rango temporal: ${yearStart && yearEnd ? `${yearStart}-${yearEnd}` : '2019-2025'}
6. Idioma

GENERA LA TABLA AHORA:
`.trim();
  }

  /**
   * Construye un prompt para regenerar ÚNICAMENTE un criterio específico
   */
  buildSingleCriterionPrompt({ technologies, domains, studyTypes, themes, picoData, projectTitle, specificType, customFocus, categoryIndex, categoryName, yearStart, yearEnd }) {
    const typeLabel = specificType === 'inclusion' ? 'INCLUSIÓN' : 'EXCLUSIÓN';
    const isInclusion = specificType === 'inclusion';

    return `
Eres un revisor metodológico de la metodología PRISMA 2020.
Tarea: Redactar UN SOLO criterio de ${typeLabel} para la categoría "${categoryName}".

CONTEXTO PARA COHERENCIA:
- Tecnología central: ${technologies.join(', ')}
- Dominio/Contexto: ${domains.join(', ')}
- Focos temáticos: ${themes.join(', ')}
- PICO-I: ${picoData?.intervention || 'N/A'}
- PICO-P: ${picoData?.population || 'N/A'}
- PICO-O: ${picoData?.outcome || 'N/A'}
- Rango temporal: ${yearStart || 2019} a ${yearEnd || 2025}

ENFOQUE SOLICITADO POR EL USUARIO:
"${customFocus}"

REGLAS DE ORO PARA EL CRITERIO:
1. Sé ultra-específico. Evita palabras como "relevante" o "importante".
2. Si es INCLUSIÓN: Describe la característica técnica que DEBE estar presente.
3. Si es EXCLUSIÓN: Describe el motivo por el cual un estudio, aunque parezca tratar el tema, debe ser descartado (ej: falta de rigor, escala inadecuada, tipo de documento).
4. No uses más de 25 palabras.
5. El criterio de EXCLUSIÓN NO debe ser simplemente "No cumplir el de inclusión", sino justificar técnicamente POR QUÉ se descarta.

INSTRUCCIONES SEGÚN CATEGORÍA "${categoryName}":

${categoryName.toLowerCase().includes('cobertura') ? `
- Mencionar explícitamente la relación entre ${technologies.join(', ')} y ${domains.join(', ')}
- ${isInclusion ? 'INCLUSIÓN: Estudios que analicen [I] aplicados a [P] para [O]' : 'EXCLUSIÓN: Estudios donde el tema es tangencial o no aborda la relación técnica central'}
` : ''}

${categoryName.toLowerCase().includes('tecnolog') ? `
- Especificar el ROL de la tecnología (ej: "como arquitectura principal")
- ${isInclusion ? 'INCLUSIÓN: Uso específico de [tecnología] en el diseño o implementación' : 'EXCLUSIÓN: Tecnologías obsoletas o fuera del ecosistema definido en el protocolo'}
` : ''}

${categoryName.toLowerCase().includes('tipo de estudio') ? `
- ${isInclusion ? 'INCLUSIÓN: Investigaciones empíricas, experimentales, comparativas técnicas' : 'EXCLUSIÓN: Artículos de opinión, tutoriales sin validación, discusiones conceptuales sin datos'}
` : ''}

${categoryName.toLowerCase().includes('documento') ? `
- ${isInclusion ? 'INCLUSIÓN: Artículos de revistas científicas y conferencias indexadas (peer-reviewed)' : 'EXCLUSIÓN: Blogs, white papers, libros de texto o documentación oficial de proveedores'}
` : ''}

${categoryName.toLowerCase().includes('temporal') ? `
- OBLIGATORIO: Usar exactamente ${yearStart || 2019}-${yearEnd || 2025}
- ${isInclusion ? `INCLUSIÓN: Publicaciones realizadas entre ${yearStart || 2019} y ${yearEnd || 2025}` : `EXCLUSIÓN: Estudios publicados antes de ${yearStart || 2019} o sin relevancia para el estado del arte actual`}
` : ''}

${categoryName.toLowerCase().includes('idioma') ? `
- ${isInclusion ? 'INCLUSIÓN: Artículos en Inglés (idioma dominante en literatura técnica)' : 'EXCLUSIÓN: Artículos en otros idiomas sin traducción técnica certificada o resumen detallado'}
` : ''}

RESPONDE SOLO CON EL TEXTO DEL CRITERIO (máximo 25 palabras):
`;
  }

  /**
   * Parsea la respuesta de la IA en formato tabla o criterio único
   */
  parseResponse(text, isSingleCriterion = false) {
    console.log('Parseando respuesta de criterios...');
    console.log('Texto completo:', text.substring(0, 500));

    // Si es un solo criterio, retornarlo directamente
    if (isSingleCriterion) {
      const cleanedText = text.trim()
        .replace(/^["']|["']$/g, '') // Quitar comillas al inicio/final
        .replace(/^\*\*|\*\*$/g, ''); // Quitar markdown bold
      
      console.log('Criterio único parseado:', cleanedText);
      return { singleCriterion: cleanedText };
    }

    const criteria = [];

    // Método 1: Intentar extraer tabla (con o sin pipes al inicio/final)
    const cleanedText = text.replace(/\|\s*\n\s+/g, ' | '); // Unir líneas dentro de celdas
    const lines = cleanedText.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Ignorar líneas vacías o separadores
      if (!trimmed || 
          trimmed.toUpperCase().includes('CATEGORÍA') && trimmed.toUpperCase().includes('INCLUSIÓN') ||
          trimmed.match(/^[\|:\-\s]+$/)) {
        continue;
      }
      
      // Si la línea contiene pipes, intentar parsearla
      if (trimmed.includes('|')) {
        // Remover pipes al inicio y final si existen
        let cleanLine = trimmed;
        if (cleanLine.startsWith('|')) cleanLine = cleanLine.substring(1);
        if (cleanLine.endsWith('|')) cleanLine = cleanLine.substring(0, cleanLine.length - 1);
        
        const parts = cleanLine.split('|')
          .map(p => p.trim())
          .filter(p => p.length > 0);
        
        // Debe tener al menos 3 partes: categoría, inclusión, exclusión
        if (parts.length >= 3) {
          const category = parts[0];
          const inclusion = parts[1];
          const exclusion = parts[2];
          
          // Validar que no sea una línea de encabezado
          if (category && inclusion && exclusion &&
              !category.match(/^[-:\s]+$/) &&
              !category.toLowerCase().includes('criterio') &&
              category.length > 3 && // Categoría debe tener contenido
              inclusion.length > 10) { // Inclusión debe tener contenido real
            
            criteria.push({
              category: category,
              inclusion: inclusion,
              exclusion: exclusion
            });
            console.log(`Criterio parseado: ${category}`);
          }
        }
      }
    }

    console.log(`Total criterios parseados: ${criteria.length}`);

    // Si no se encontró formato de tabla, intentar buscar las 6 categorías directamente
    if (criteria.length === 0) {
      console.warn('No se encontró formato de tabla estándar, buscando categorías directamente...');
      return this.parseByCategories(text);
    }

    // Asegurar que haya exactamente 6 categorías (nivel protocolo PRISMA)
    if (criteria.length < 6) {
      console.warn(`Solo se encontraron ${criteria.length} categorías, buscando las faltantes...`);
      const foundCategories = new Set(criteria.map(c => c.category.toLowerCase()));
      
      const defaultCategories = [
        { name: 'Cobertura temática', aliases: ['cobertura', 'tematica', 'temática'] },
        { name: 'Tecnologías abordadas', aliases: ['tecnologías', 'tecnologia', 'abordadas'] },
        { name: 'Tipo de estudio', aliases: ['tipo de estudio', 'tipo estudio', 'estudio'] },
        { name: 'Tipo de documento', aliases: ['tipo de documento', 'tipo documento', 'documento'] },
        { name: 'Rango temporal', aliases: ['rango temporal', 'rango', 'temporal'] },
        { name: 'Idioma', aliases: ['idioma', 'lenguaje', 'language'] }
      ];

      for (const defaultCat of defaultCategories) {
        const hasCategory = foundCategories.has(defaultCat.name.toLowerCase()) ||
                           defaultCat.aliases.some(alias => foundCategories.has(alias));
        
        if (!hasCategory && criteria.length < 6) {
          criteria.push({
            category: defaultCat.name,
            inclusion: 'Definir criterio de inclusión específico',
            exclusion: 'Definir criterio de exclusión específico'
          });
        }
      }
    }

    // Convertir a formato esperado por el frontend: dos arrays separados
    const inclusionCriteria = criteria.map(c => ({
      categoria: c.category,
      criterio: c.inclusion
    }));
    
    const exclusionCriteria = criteria.map(c => ({
      categoria: c.category,
      criterio: c.exclusion
    }));

    return { 
      criteria,  // Mantener formato antiguo por compatibilidad
      inclusionCriteria, 
      exclusionCriteria 
    };
  }

  /**
   * Parser que busca categorías específicas en el texto
   */
  parseByCategories(text) {
    const categories = [
      { 
        name: 'Cobertura temática',
        patterns: [/cobertura\s+tem[aá]tica/gi, /cobertura/gi]
      },
      { 
        name: 'Tecnologías abordadas',
        patterns: [/tecnolog[ií]as?\s+abordadas?/gi, /tecnolog[ií]as?/gi]
      },
      { 
        name: 'Tipo de estudio',
        patterns: [/tipo\s+de\s+estudio/gi, /tipo\s+estudio/gi]
      },
      { 
        name: 'Tipo de documento',
        patterns: [/tipo\s+de\s+documento/gi, /tipo\s+documento/gi]
      },
      { 
        name: 'Rango temporal',
        patterns: [/rango\s+temporal/gi, /rango/gi]
      },
      { 
        name: 'Idioma',
        patterns: [/idioma/gi, /lenguaje/gi]
      }
    ];

    const criteria = [];

    // Dividir en filas de tabla por el separador |
    const rows = text.split('\n').filter(line => {
      const trimmed = line.trim();
      return trimmed.startsWith('|') && trimmed.endsWith('|') && 
             !trimmed.match(/^[\|:\-\s]+$/); // No es separador
    });

    console.log(`Encontradas ${rows.length} filas de tabla`);

    for (const category of categories) {
      // Buscar la fila que contiene esta categoría
      for (const row of rows) {
        let found = false;
        for (const pattern of category.patterns) {
          if (pattern.test(row)) {
            found = true;
            break;
          }
        }

        if (found) {
          // Extraer las 3 columnas
          const columns = row.split('|')
            .map(col => col.trim())
            .filter(col => col.length > 0);

          if (columns.length >= 3) {
            criteria.push({
              category: category.name,
              inclusion: columns[1],
              exclusion: columns[2]
            });
            console.log(`Categoría encontrada: ${category.name}`);
            break;
          }
        }
      }
    }

    console.log(`Total categorías encontradas: ${criteria.length}`);

    // Si aún no tenemos 6, agregar valores predeterminados
    if (criteria.length < 6) {
      for (const category of categories) {
        if (!criteria.find(c => c.category === category.name)) {
          criteria.push({
            category: category.name,
            inclusion: 'Definir criterio de inclusión',
            exclusion: 'Definir criterio de exclusión'
          });
        }
      }
    }

    // Convertir a formato esperado por el frontend
    const inclusionCriteriaFormatted = criteria.map(c => ({
      categoria: c.category,
      criterio: c.inclusion
    }));
    
    const exclusionCriteriaFormatted = criteria.map(c => ({
      categoria: c.category,
      criterio: c.exclusion
    }));

    return { 
      criteria,
      inclusionCriteria: inclusionCriteriaFormatted, 
      exclusionCriteria: exclusionCriteriaFormatted 
    };
  }
}

module.exports = GenerateInclusionExclusionCriteriaUseCase;

