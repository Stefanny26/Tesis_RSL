const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Use Case: Generador de Criterios de Inclusión y Exclusión
 * 
 * Genera criterios de inclusión y exclusión basados en el protocolo PICO
 * para ayudar en la selección de estudios en una revisión sistemática.
 */
class GenerateInclusionExclusionCriteriaUseCase {
  constructor() {
    // Inicializar OpenAI/ChatGPT (PRIORIDAD 1)
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }
    
    // Inicializar Gemini (PRIORIDAD 2)
    if (process.env.GEMINI_API_KEY) {
      this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
  }

  /**
   * Genera criterios de inclusión y exclusión
   */
  async execute({ protocolTerms, picoData, projectTitle, aiProvider = 'chatgpt', specificType, customFocus, categoryIndex, categoryName, yearStart, yearEnd }) {
    try {
      console.log('🔍 Generando criterios de inclusión/exclusión...');
      
      if (specificType) {
        console.log('🎯 Regenerando tipo específico:', specificType);
        console.log('📂 Categoría específica:', categoryName || categoryIndex);
        console.log('💡 Enfoque personalizado:', customFocus || 'predeterminado');
      }

      const prompt = this.buildPrompt({ protocolTerms, picoData, projectTitle, specificType, customFocus, categoryIndex, categoryName, yearStart, yearEnd });
      
      let text;
      if (aiProvider === 'chatgpt' && this.openai) {
        const completion = await this.openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7
        });
        text = completion.choices[0].message.content;
      } else if (this.gemini) {
        const model = this.gemini.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        text = response.text();
      } else {
        throw new Error('No hay proveedor de IA configurado');
      }

      console.log('📄 Respuesta completa de IA:');
      console.log(text);
      console.log('─────────────────────────────────────');

      // Parsear la respuesta
      const isSingleCriterion = categoryIndex !== undefined && categoryName;
      const criteria = this.parseResponse(text, isSingleCriterion);

      console.log('✅ Criterios generados exitosamente');

      return {
        success: true,
        data: criteria,
        isSingleCriterion
      };

    } catch (error) {
      console.error('❌ Error generando criterios:', error);
      throw new Error(`Error generando criterios: ${error.message}`);
    }
  }

  /**
   * Construye el prompt para la IA
   */
  buildPrompt({ protocolTerms, picoData, projectTitle, specificType, customFocus, categoryIndex, categoryName, yearStart, yearEnd }) {
    // Extraer términos del protocolo
    const technologies = protocolTerms?.tecnologia || protocolTerms?.technologies || [];
    const domains = protocolTerms?.dominio || protocolTerms?.applicationDomain || [];
    const studyTypes = protocolTerms?.tipoEstudio || protocolTerms?.studyType || [];
    const themes = protocolTerms?.focosTematicos || protocolTerms?.thematicFocus || [];

    // Si hay categoría específica, generar solo ese criterio
    if (categoryIndex !== undefined && categoryName && specificType) {
      return this.buildSingleCriterionPrompt({
        technologies,
        domains,
        studyTypes,
        themes,
        picoData,
        projectTitle,
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
        technologies,
        domains,
        studyTypes,
        themes,
        picoData,
        projectTitle,
        specificType,
        customFocus,
        yearStart,
        yearEnd
      });
    }

    return `
Eres un experto en metodología de revisiones sistemáticas. Genera criterios de inclusión y exclusión organizados en una TABLA para el proyecto "${projectTitle}".

TÉRMINOS DEL PROTOCOLO DEFINIDOS:
🧩 Tecnología/Herramientas:
${technologies.map(t => `• ${t}`).join('\n')}

🧪 Dominio de aplicación:
${domains.map(d => `• ${d}`).join('\n')}

📚 Tipo de estudio:
${studyTypes.map(s => `• ${s}`).join('\n')}

🔍 Focos temáticos:
${themes.map(t => `• ${t}`).join('\n')}

COMPONENTES PICO:
- Población: ${picoData?.population || 'No especificado'}
- Intervención: ${picoData?.intervention || 'No especificado'}
- Comparación: ${picoData?.comparison || 'N/A'}
- Resultado: ${picoData?.outcome || 'No especificado'}

TAREA:
Genera criterios de inclusión y exclusión en formato de TABLA con las siguientes categorías.
Los criterios DEBEN hacer referencia explícita a los términos del protocolo definidos arriba.

FORMATO DE TABLA REQUERIDO (genera exactamente 6 filas):

Cobertura temática | Estudios que mencionen explícitamente [mencionar tecnologías del protocolo] | Publicaciones donde estos términos no aparecen o no están claramente conectados
Tecnologías abordadas | Uso de [mencionar tecnologías específicas] dentro de [mencionar dominios] | Investigaciones centradas en otras tecnologías fuera del stack definido
Tipo de estudio | Estudios relevantes para [mencionar tipos de estudio del protocolo] | Artículos puramente descriptivos o tutoriales sin aporte técnico profundo
Tipo de documento | Artículos publicados en journals revisados por pares | Trabajos fuera del ámbito académico como blogs, tutoriales o literatura gris
Rango temporal | Publicaciones entre ${yearStart && yearEnd ? `${yearStart} y ${yearEnd}` : '[especificar rango, ej: 2019 y 2025]'} | Estudios anteriores al rango que no aportan evidencia contemporánea
Idioma | Publicaciones en inglés y español | Artículos en otros idiomas que no aporten al cuerpo de evidencia analizable

IMPORTANTE:
1. Genera EXACTAMENTE 6 categorías (las de arriba)
2. Cada criterio debe ser ESPECÍFICO y mencionar los términos del protocolo
3. Los criterios de inclusión deben mencionar explícitamente las tecnologías, dominios y focos temáticos
4. Los criterios de exclusión deben ser el opuesto lógico
5. Mantén los criterios concisos pero específicos
6. NO agregues categorías adicionales, solo las 6 especificadas
`;
  }

  /**
   * Construye un prompt específico para regenerar solo criterios de inclusión o exclusión
   */
  buildSpecificTypePrompt({ technologies, domains, studyTypes, themes, picoData, projectTitle, specificType, customFocus, yearStart, yearEnd }) {
    const typeLabel = specificType === 'inclusion' ? 'INCLUSIÓN' : 'EXCLUSIÓN';
    const oppositeLabel = specificType === 'inclusion' ? 'exclusión' : 'inclusión';

    return `
Eres un experto en metodología de revisiones sistemáticas. Genera criterios de ${typeLabel} SOLAMENTE para el proyecto "${projectTitle}".

TÉRMINOS DEL PROTOCOLO DEFINIDOS:
🧩 Tecnología/Herramientas:
${technologies.map(t => `• ${t}`).join('\n')}

🧪 Dominio de aplicación:
${domains.map(d => `• ${d}`).join('\n')}

📚 Tipo de estudio:
${studyTypes.map(s => `• ${s}`).join('\n')}

🔍 Focos temáticos:
${themes.map(t => `• ${t}`).join('\n')}

COMPONENTES PICO:
- Población: ${picoData?.population || 'No especificado'}
- Intervención: ${picoData?.intervention || 'No especificado'}
- Comparación: ${picoData?.comparison || 'N/A'}
- Resultado: ${picoData?.outcome || 'No especificado'}

ENFOQUE PERSONALIZADO DEL USUARIO:
"${customFocus}"

TAREA:
Genera criterios de ${typeLabel} en formato de TABLA con las siguientes categorías.
Los criterios DEBEN:
1. Hacer referencia explícita a los términos del protocolo
2. CENTRARSE en el enfoque personalizado indicado por el usuario arriba
3. Ser específicos para el proyecto "${projectTitle}"

FORMATO DE TABLA REQUERIDO (genera exactamente 6 filas):

Cobertura temática | ${specificType === 'inclusion' ? 'Estudios que mencionen explícitamente [tecnologías]' : 'Publicaciones donde estos términos no aparecen'} | [Criterio de ${oppositeLabel} genérico]
Tecnologías abordadas | ${specificType === 'inclusion' ? 'Uso de [tecnologías específicas]' : 'Investigaciones centradas en otras tecnologías'} | [Criterio de ${oppositeLabel} genérico]
Tipo de estudio | ${specificType === 'inclusion' ? 'Estudios relevantes para [tipos específicos]' : 'Artículos puramente descriptivos'} | [Criterio de ${oppositeLabel} genérico]
Tipo de documento | ${specificType === 'inclusion' ? 'Artículos en journals revisados' : 'Trabajos fuera del ámbito académico'} | [Criterio de ${oppositeLabel} genérico]
Rango temporal | ${specificType === 'inclusion' ? `Publicaciones entre ${yearStart && yearEnd ? `${yearStart} y ${yearEnd}` : '[rango]'}` : `Estudios anteriores ${yearStart ? `a ${yearStart}` : 'al rango'}`} | [Criterio de ${oppositeLabel} genérico]
Idioma | ${specificType === 'inclusion' ? 'Publicaciones en inglés y español' : 'Artículos en otros idiomas'} | [Criterio de ${oppositeLabel} genérico]

IMPORTANTE:
1. Genera EXACTAMENTE 6 categorías
2. Los criterios de ${typeLabel} (columna ${specificType === 'inclusion' ? '2' : '3'}) deben ser MUY ESPECÍFICOS y reflejar el enfoque: "${customFocus}"
3. Los criterios de ${oppositeLabel} (columna ${specificType === 'inclusion' ? '3' : '2'}) pueden ser genéricos (se descartarán en el frontend)
4. Asegúrate de mencionar los términos del protocolo en los criterios de ${typeLabel}
5. Mantén los criterios concisos pero específicos
`;
  }

  /**
   * Construye un prompt para regenerar ÚNICAMENTE un criterio específico
   */
  buildSingleCriterionPrompt({ technologies, domains, studyTypes, themes, picoData, projectTitle, specificType, customFocus, categoryIndex, categoryName, yearStart, yearEnd }) {
    const typeLabel = specificType === 'inclusion' ? 'INCLUSIÓN' : 'EXCLUSIÓN';

    return `
Eres un experto en metodología de revisiones sistemáticas. Genera ÚNICAMENTE un criterio de ${typeLabel} para la categoría "${categoryName}" del proyecto "${projectTitle}".

TÉRMINOS DEL PROTOCOLO DEFINIDOS:
🧩 Tecnología/Herramientas:
${technologies.map(t => `• ${t}`).join('\n')}

🧪 Dominio de aplicación:
${domains.map(d => `• ${d}`).join('\n')}

📚 Tipo de estudio:
${studyTypes.map(s => `• ${s}`).join('\n')}

🔍 Focos temáticos:
${themes.map(t => `• ${t}`).join('\n')}

COMPONENTES PICO:
- Población: ${picoData?.population || 'No especificado'}
- Intervención: ${picoData?.intervention || 'No especificado'}
- Comparación: ${picoData?.comparison || 'N/A'}
- Resultado: ${picoData?.outcome || 'No especificado'}

CATEGORÍA A GENERAR: "${categoryName}"
TIPO: ${typeLabel}
${customFocus ? `ENFOQUE PERSONALIZADO: "${customFocus}"` : ''}

TAREA:
Genera ÚNICAMENTE el criterio de ${typeLabel} para la categoría "${categoryName}".

INSTRUCCIONES ESPECÍFICAS SEGÚN LA CATEGORÍA:

${categoryName === 'Cobertura Temática' ? `
- El criterio debe mencionar EXPLÍCITAMENTE las tecnologías del protocolo: ${technologies.join(', ')}
- Debe indicar en qué contextos o dominios: ${domains.join(', ')}
- ${specificType === 'inclusion' ? 'Ejemplo: "Estudios que mencionen explícitamente [tecnologías] en el contexto de [dominios]"' : 'Ejemplo: "Publicaciones donde estos términos no aparecen o no están conectados con [dominios]"'}
` : ''}

${categoryName === 'Tecnologías Abordadas' ? `
- Debe especificar las tecnologías CONCRETAS del protocolo: ${technologies.join(', ')}
- Mencionar los dominios de aplicación: ${domains.join(', ')}
- ${specificType === 'inclusion' ? 'Ejemplo: "Uso de [tecnologías específicas] dentro de [dominios]"' : 'Ejemplo: "Investigaciones centradas en otras tecnologías fuera del stack definido"'}
` : ''}

${categoryName === 'Tipo de Estudio' ? `
- Hacer referencia a los tipos de estudio definidos: ${studyTypes.join(', ')}
- ${specificType === 'inclusion' ? 'Ejemplo: "Estudios relevantes para [tipos de estudio específicos]"' : 'Ejemplo: "Artículos puramente descriptivos o tutoriales sin aporte técnico"'}
` : ''}

${categoryName === 'Tipo de Documento' ? `
- ${specificType === 'inclusion' ? 'Ejemplo: "Artículos publicados en journals revisados por pares que traten sobre [temas del protocolo]"' : 'Ejemplo: "Trabajos fuera del ámbito académico como blogs, tutoriales o literatura gris"'}
` : ''}

${categoryName === 'Rango Temporal' ? `
- RANGO DE AÑOS ESPECIFICADO: ${yearStart && yearEnd ? `${yearStart} a ${yearEnd}` : '2019 a 2025'}
- ${specificType === 'inclusion' ? `Ejemplo: "Publicaciones entre ${yearStart || 2019} y ${yearEnd || 2025} que aborden [temas del protocolo]"` : `Ejemplo: "Estudios anteriores a ${yearStart || 2019} que no reflejen el estado actual"`}
` : ''}

${categoryName === 'Idioma' ? `
- ${specificType === 'inclusion' ? 'Ejemplo: "Publicaciones en inglés y español"' : 'Ejemplo: "Artículos en otros idiomas que limiten la accesibilidad"'}
` : ''}

FORMATO DE RESPUESTA:
Responde ÚNICAMENTE con el texto del criterio de ${typeLabel}, SIN la categoría, SIN formato de tabla, SOLO el criterio en texto plano.

El criterio debe:
1. Ser específico y mencionar los términos del protocolo cuando corresponda
2. Ser conciso (máximo 2-3 líneas)
3. Estar directamente relacionado con "${categoryName}"
${customFocus ? `4. Reflejar el enfoque: "${customFocus}"` : ''}

RESPONDE SOLO CON EL CRITERIO, NADA MÁS:
`;
  }

  /**
   * Parsea la respuesta de la IA en formato tabla o criterio único
   */
  parseResponse(text, isSingleCriterion = false) {
    console.log('🔍 Parseando respuesta de criterios...');
    console.log('📄 Texto completo:', text.substring(0, 500));

    // Si es un solo criterio, retornarlo directamente
    if (isSingleCriterion) {
      const cleanedText = text.trim()
        .replace(/^["']|["']$/g, '') // Quitar comillas al inicio/final
        .replace(/^\*\*|\*\*$/g, ''); // Quitar markdown bold
      
      console.log('✅ Criterio único parseado:', cleanedText);
      return { singleCriterion: cleanedText };
    }

    const criteria = [];

    // Método 1: Intentar extraer tabla Markdown completa
    // Primero, limpiar el texto de saltos de línea innecesarios dentro de las celdas
    const cleanedText = text.replace(/\|\s*\n\s+/g, ' | '); // Unir líneas dentro de celdas
    const lines = cleanedText.split('\n');

    let inTable = false;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Detectar inicio de tabla
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        inTable = true;
      }
      
      // Ignorar líneas de encabezado o separadores
      if (!trimmed || 
          trimmed.toUpperCase().includes('CATEGORÍA') && trimmed.toUpperCase().includes('INCLUSIÓN') ||
          trimmed.match(/^[\|:\-\s]+$/)) {
        continue;
      }
      
      // Si estamos en la tabla y hay contenido
      if (inTable && trimmed.includes('|')) {
        const parts = trimmed.split('|')
          .map(p => p.trim())
          .filter(p => p.length > 0); // Remover elementos vacíos
        
        // Debe tener al menos 3 partes: categoría, inclusión, exclusión
        if (parts.length >= 3) {
          const category = parts[0];
          const inclusion = parts[1];
          const exclusion = parts[2];
          
          // Validar que no sea una línea de encabezado
          if (category && inclusion && exclusion &&
              !category.match(/^[-:\s]+$/) &&
              !category.toLowerCase().includes('criterio')) {
            
            criteria.push({
              category: category,
              inclusion: inclusion,
              exclusion: exclusion
            });
            console.log(`✅ Criterio parseado: ${category}`);
          }
        }
      }
    }

    console.log(`📊 Total criterios parseados: ${criteria.length}`);

    // Si no se encontró formato de tabla, intentar buscar las 6 categorías directamente
    if (criteria.length === 0) {
      console.warn('⚠️  No se encontró formato de tabla estándar, buscando categorías directamente...');
      return this.parseByCategories(text);
    }

    // Asegurar que haya exactamente 6 categorías
    if (criteria.length < 6) {
      console.warn(`⚠️  Solo se encontraron ${criteria.length} categorías, buscando las faltantes...`);
      const foundCategories = new Set(criteria.map(c => c.category.toLowerCase()));
      
      const defaultCategories = [
        { name: 'Cobertura temática', aliases: ['cobertura', 'temática', 'temática'] },
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

    console.log(`🔎 Encontradas ${rows.length} filas de tabla`);

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
            console.log(`✅ Categoría encontrada: ${category.name}`);
            break;
          }
        }
      }
    }

    console.log(`📊 Total categorías encontradas: ${criteria.length}`);

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

