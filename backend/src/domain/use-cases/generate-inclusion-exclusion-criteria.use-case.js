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
  async execute({ selectedTitle, protocolTerms, picoData, projectTitle, aiProvider = 'chatgpt', specificType, customFocus, categoryIndex, categoryName, yearStart, yearEnd }) {
    try {
      // REGLA METODOLÓGICA: Los criterios DEBEN basarse en el título de la RSL seleccionado
      const rslTitle = selectedTitle || projectTitle || 'Proyecto sin título';
      
      console.log('🔍 Generando criterios de inclusión/exclusión...');
      console.log('📋 Título RSL:', rslTitle.substring(0, 60) + '...');
      
      if (specificType) {
        console.log('🎯 Regenerando tipo específico:', specificType);
        console.log('📂 Categoría específica:', categoryName || categoryIndex);
        console.log('💡 Enfoque personalizado:', customFocus || 'predeterminado');
      }

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
Eres un experto en metodología PRISMA/Cochrane para revisiones sistemáticas de literatura. Tu tarea: generar CRITERIOS DE INCLUSIÓN Y EXCLUSIÓN nivel protocolo reproducible.

RESPONDE ÚNICAMENTE con la TABLA en formato de texto (sin markdown, sin JSON).

═══════════════════════════════════════════════════════════════
PRINCIPIO METODOLÓGICO FUNDAMENTAL
═══════════════════════════════════════════════════════════════

⚠️ REGLA CRÍTICA: Los criterios I/E DEBEN derivarse del TÍTULO DE LA RSL

Secuencia obligatoria:
Título → PICO → Definición de términos → Criterios I/E

Los criterios NO se inventan, SE DERIVAN del título seleccionado.
Todo lo que no esté explícito o implícito en el título no puede incluirse.

═══════════════════════════════════════════════════════════════
TÍTULO DE LA REVISIÓN SISTEMÁTICA (FUENTE ÚNICA)
═══════════════════════════════════════════════════════════════

"${title}"

⚠️ IMPORTANTE: Los criterios DEBEN derivar directamente de este título.

═══════════════════════════════════════════════════════════════
REGLAS METODOLÓGICAS OBLIGATORIAS
═══════════════════════════════════════════════════════════════

⚠️ REGLA 1: DERIVACIÓN DIRECTA DEL PICO
- Cada criterio DEBE mapearse a P, I, C u O
- Si un criterio no deriva del PICO, NO DEBE EXISTIR

⚠️ REGLA 2: CRITERIOS OPERACIONALES (NO AMBIGUOS)
- Deben poder aplicarse objetivamente por dos revisores distintos
- Deben producir el mismo resultado siempre
- ❌ "Estudios relevantes" → ✅ "Estudios que analicen prácticas de desarrollo, desempeño o patrones arquitectónicos"

⚠️ REGLA 3: EXCLUSIÓN CON JUSTIFICACIÓN EXPLÍCITA
- Cada exclusión debe responder a:
  • Incompatibilidad temática
  • Incompatibilidad tecnológica
  • Bajo nivel de evidencia
  • Falta de aporte analítico
  • Inviabilidad metodológica

⚠️ REGLA 4: EVITAR SESGOS METODOLÓGICOS
- Evitar sesgo de idioma (justificar si existe)
- Evitar sesgo temporal injustificado
- Evitar sesgo de publicación (considerar literatura gris)
- Evitar sesgo de confirmación tecnológica

═══════════════════════════════════════════════════════════════
CONTEXTO DEL PROTOCOLO
═══════════════════════════════════════════════════════════════

TÉRMINOS DEL PROTOCOLO (derivados del título en Paso 4):

🔬 TECNOLOGÍA/HERRAMIENTAS (alineado con PICO-I):
${technologies.length ? technologies.map(t => `• ${t}`).join('\n') : '• No especificado'}

🏥 DOMINIO DE APLICACIÓN (alineado con PICO-P):
${domains.length ? domains.map(d => `• ${d}`).join('\n') : '• No especificado'}

📚 TIPO DE ESTUDIO (diseño metodológico):
${studyTypes.length ? studyTypes.map(s => `• ${s}`).join('\n') : '• No especificado'}

🎯 FOCOS TEMÁTICOS (alineado con PICO-O):
${themes.length ? themes.map(t => `• ${t}`).join('\n') : '• No especificado'}

COMPONENTES PICO:
- P (Población): ${picoData?.population || 'No especificado'}
- I (Intervención): ${picoData?.intervention || 'No especificado'}
- C (Comparación): ${picoData?.comparison || 'N/A'}
- O (Outcomes): ${picoData?.outcome || 'No especificado'}

═══════════════════════════════════════════════════════════════
INSTRUCCIONES PARA GENERACIÓN
═══════════════════════════════════════════════════════════════

Genera una TABLA con EXACTAMENTE 6 CATEGORÍAS:

1. Cobertura temática
2. Tecnologías abordadas
3. Tipo de estudio
4. Tipo de documento
5. Rango temporal
6. Idioma

Cada fila debe tener 3 columnas separadas por " | ":
Categoría | Criterio de Inclusión | Criterio de Exclusión

FORMATO EXACTO (copia esta estructura):

Cobertura temática | [criterio inclusión] | [criterio exclusión]
Tecnologías abordadas | [criterio inclusión] | [criterio exclusión]
Tipo de estudio | [criterio inclusión] | [criterio exclusión]
Tipo de documento | [criterio inclusión] | [criterio exclusión]
Rango temporal | [criterio inclusión] | [criterio exclusión]
Idioma | [criterio inclusión] | [criterio exclusión]

═══════════════════════════════════════════════════════════════
REGLAS DE REDACCIÓN (NIVEL EXPERTO)
═══════════════════════════════════════════════════════════════

✅ INCLUSIÓN: Debe mencionar EXPLÍCITAMENTE los términos del protocolo
❌ EXCLUSIÓN: Debe ser el OPUESTO LÓGICO y JUSTIFICADO

EJEMPLOS DE CRITERIOS BIEN REDACTADOS:

1. Cobertura temática:
   ✅ INCLUSIÓN: "Estudios que mencionen explícitamente [tecnología X] y [tecnología Y] en el título, resumen o palabras clave."
   ✅ EXCLUSIÓN: "Publicaciones donde estos términos no aparecen o no están relacionados con el objetivo del estudio."

2. Tecnologías abordadas:
   ✅ INCLUSIÓN: "Uso de [tecnología específica] como [función específica] en aplicaciones [dominio] desarrolladas con [stack tecnológico]."
   ✅ EXCLUSIÓN: "Estudios centrados en [tecnologías alternativas], bases [tipo diferente] o tecnologías fuera del ecosistema [especificar]."

3. Tipo de estudio:
   ✅ INCLUSIÓN: "Estudios empíricos, estudios de caso, análisis de desempeño, evaluaciones arquitectónicas o comparativas técnicas."
   ✅ EXCLUSIÓN: "Artículos puramente introductorios, tutoriales, opiniones o documentación técnica sin análisis sistemático."

4. Tipo de documento:
   ✅ INCLUSIÓN: "Artículos revisados por pares publicados en journals o conferencias indexadas."
   ✅ EXCLUSIÓN: "Blogs, white papers, tutoriales, documentación oficial y literatura gris."

5. Rango temporal:
   ✅ INCLUSIÓN: "Publicaciones entre ${yearStart && yearEnd ? `${yearStart} y ${yearEnd}` : '2019 y 2025'}."
   ✅ EXCLUSIÓN: "Estudios previos a ${yearStart || '2019'} o sin relevancia tecnológica contemporánea."

6. Idioma:
   ✅ INCLUSIÓN: "Publicaciones en inglés." [Justificación implícita: idioma dominante en literatura técnica]
   ✅ EXCLUSIÓN: "Publicaciones en otros idiomas sin traducción disponible."

═══════════════════════════════════════════════════════════════
VALIDACIÓN AUTOMÁTICA (CHECKLIST)
═══════════════════════════════════════════════════════════════

Antes de generar, verifica:
✓ ¿Cada criterio se deriva del PICO o términos del protocolo?
✓ ¿Puede aplicarse sin interpretación subjetiva?
✓ ¿Cada exclusión tiene justificación explícita?
✓ ¿Permite que otro investigador replique el estudio?
✓ ¿Está alineado con PRISMA Item 5 y 6?

═══════════════════════════════════════════════════════════════
AHORA GENERA LA TABLA PARA ESTE PROYECTO
═══════════════════════════════════════════════════════════════

INSTRUCCIÓN FINAL:
1. Analiza los términos del protocolo arriba
2. Mapea cada categoría a PICO: Cobertura→(I), Tecnologías→(I), Tipo estudio→metodología, Focos→(O)
3. Genera criterios ESPECÍFICOS que mencionen los términos del protocolo
4. Asegura que cada exclusión sea el opuesto lógico y justificado
5. Responde SOLO con la tabla en formato texto (6 filas, 3 columnas separadas por " | ")

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
🔬 Tecnología: ${technologies.join(', ')}
🏥 Dominio: ${domains.join(', ')}
📚 Tipo estudio: ${studyTypes.join(', ')}
🎯 Focos: ${themes.join(', ')}

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

    return `
Eres un experto en metodología PRISMA. Genera ÚNICAMENTE un criterio de ${typeLabel} para la categoría "${categoryName}".

CONTEXTO DEL PROTOCOLO:
🔬 Tecnología: ${technologies.join(', ')}
🏥 Dominio: ${domains.join(', ')}
📚 Tipo estudio: ${studyTypes.join(', ')}
🎯 Focos: ${themes.join(', ')}

PICO: P=${picoData?.population || 'N/A'}, I=${picoData?.intervention || 'N/A'}, O=${picoData?.outcome || 'N/A'}

CATEGORÍA: "${categoryName}"
TIPO: ${typeLabel}
${customFocus ? `ENFOQUE: "${customFocus}"` : ''}

INSTRUCCIONES SEGÚN CATEGORÍA:

${categoryName.toLowerCase().includes('cobertura') ? `
- Mencionar EXPLÍCITAMENTE tecnologías: ${technologies.join(', ')}
- Contexto/dominios: ${domains.join(', ')}
- ${specificType === 'inclusion' ? '✅ "Estudios que mencionen explícitamente [tecnologías] en [dominios]"' : '❌ "Publicaciones donde estos términos no aparecen"'}
` : ''}

${categoryName.toLowerCase().includes('tecnolog') ? `
- Especificar tecnologías CONCRETAS: ${technologies.join(', ')}
- Dominios: ${domains.join(', ')}
- ${specificType === 'inclusion' ? '✅ "Uso de [tecnología X] como [función] en [dominio]"' : '❌ "Estudios centrados en otras tecnologías fuera del ecosistema"'}
` : ''}

${categoryName.toLowerCase().includes('dominio') ? `
- Referirse al contexto poblacional: ${domains.join(', ')}
- Alineado con PICO-P: ${picoData?.population || 'población'}
- ${specificType === 'inclusion' ? '✅ "Aplicaciones [tipo] en entornos [dominio]"' : '❌ "Aplicaciones en contextos no relacionados"'}
` : ''}

${categoryName.toLowerCase().includes('tipo de estudio') ? `
- Tipos definidos: ${studyTypes.join(', ')}
- ${specificType === 'inclusion' ? '✅ "Estudios empíricos, casos, análisis comparativos"' : '❌ "Tutoriales sin análisis sistemático"'}
` : ''}

${categoryName.toLowerCase().includes('documento') ? `
- ${specificType === 'inclusion' ? '✅ "Artículos revisados por pares en journals/conferencias indexadas"' : '❌ "Blogs, tutoriales, literatura gris"'}
` : ''}

${categoryName.toLowerCase().includes('temporal') ? `
- Rango: ${yearStart && yearEnd ? `${yearStart}-${yearEnd}` : '2019-2025'}
- ${specificType === 'inclusion' ? `✅ "Publicaciones entre ${yearStart || 2019} y ${yearEnd || 2025}"` : `❌ "Estudios previos a ${yearStart || 2019}"`}
` : ''}

${categoryName.toLowerCase().includes('idioma') ? `
- ${specificType === 'inclusion' ? '✅ "Publicaciones en inglés"' : '❌ "Artículos en otros idiomas sin traducción"'}
` : ''}

${categoryName.toLowerCase().includes('acceso') || categoryName.toLowerCase().includes('texto completo') ? `
- ${specificType === 'inclusion' ? '✅ "Artículos con acceso completo al texto"' : '❌ "Estudios sin acceso completo o solo resumen"'}
` : ''}

RESPONDE SOLO CON EL CRITERIO (texto plano, máximo 2-3 líneas):
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

    // Asegurar que haya exactamente 6 categorías (nivel protocolo PRISMA)
    if (criteria.length < 6) {
      console.warn(`⚠️  Solo se encontraron ${criteria.length} categorías, buscando las faltantes...`);
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

