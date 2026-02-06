/**
 * Template LaTeX para exportación de artículos científicos
 * Compatible con formato universal PRISMA 2020 para journals Q1 (IEEE, ACM, Elsevier, Springer)
 * 
 * Reglas de formato:
 * - Título: máx 15-18 palabras
 * - Abstract: 150-250 palabras, estructura: Contexto/Objetivo/Métodos/Resultados/Conclusión
 * - Keywords: 4-6 palabras clave
 * - Introduction: 10-15% del artículo
 * - Methods: sección crítica PRISMA compliant
 * - Results: incluye PRISMA diagram + gráfico de codo
 * - Discussion: interpretación sin figuras nuevas
 * - Conclusions: breve y contundente
 * 
 * Uso: 
 * const template = require('./article-latex.template');
 * const latex = template.generate(articleData, userProfile);
 */

/**
 * Genera documento LaTeX completo desde datos del artículo
 * @param {Object} articleData - Datos del artículo (title, abstract, sections, etc.)
 * @param {Object} userProfile - Datos del usuario (fullName, email, etc.)
 */
function generate(articleData, userProfile = null) {
  // Extraer datos del perfil de usuario para autor
  const defaultAuthor = userProfile ? {
    name: userProfile.fullName || 'Author Name',
    email: userProfile.email || 'email@espe.edu.ec',
    institution: 'Universidad de las Fuerzas Armadas ESPE',
    department: 'Departamento de Ciencias de la Computación',
    city: 'Sangolquí',
    country: 'Ecuador'
  } : null;

  return `\\documentclass[12pt,a4paper]{article}

% -------------------- PAQUETES BÁSICOS --------------------
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage[spanish]{babel}
\\usepackage{graphicx}
\\usepackage{float}
\\usepackage{booktabs}
\\usepackage{longtable}
\\usepackage{array}
\\usepackage{amsmath}
\\usepackage{amssymb}
\\usepackage{hyperref}
\\usepackage{cite}
\\usepackage{caption}
\\usepackage{geometry}
\\usepackage{setspace}

\\geometry{margin=1in}
\\onehalfspacing

\\hypersetup{
  colorlinks=true,
  linkcolor=black,
  citecolor=black,
  urlcolor=black
}

% -------------------- TÍTULO --------------------
\\title{\\textbf{${escapeLatex(articleData.title || 'Systematic Literature Review')}}}

% -------------------- AUTORES --------------------
\\author{
${generateUniversalAuthors(articleData.authors || (defaultAuthor ? [defaultAuthor] : []))}
}

\\date{}

\\begin{document}

\\maketitle

% -------------------- ABSTRACT --------------------
% 📏 150–250 palabras (estándar universal IEEE/Elsevier/Springer/MDPI)
% 📌 Estructura: Contexto/Objetivo/Métodos PRISMA/Resultados/Conclusión
% 📌 Un solo párrafo, sin citas, sin figuras
\\begin{abstract}
${escapeLatex(articleData.abstract || 'This systematic review examines... Following PRISMA 2020 guidelines, a structured search and screening process was conducted... Results indicate... These findings suggest...')}
\\end{abstract}

% -------------------- KEYWORDS --------------------
% 📌 3–6 palabras clave (OBLIGATORIO)
\\textbf{Palabras clave:} ${generateUniversalKeywords(articleData.keywords || [])}
\\bigskip

% -------------------- 1. INTRODUCTION --------------------
% 📏 10–15% del artículo
% 📌 Estructura: Contextualización → Importancia → Vacíos → Variables → Estado actual → Justificación → Objetivos
\\section{INTRODUCCIÓN}

% CONTEXTUALIZACIÓN GENERAL DEL TEMA
${convertMarkdownToLatex(articleData.introduction || `[Tu contexto general sobre el tema de investigación]

% IMPORTANCIA DEL PROBLEMA
El problema de investigación es relevante porque [razones de importancia].

% VACÍOS EXISTENTES EN LA LITERATURA
A pesar de los avances en el área, existen vacíos significativos en la literatura científica relacionados con [describir vacíos].

% VARIABLES PRINCIPALES
Las variables principales consideradas en este estudio incluyen [enumerar variables].

% ESTADO ACTUAL DEL CONOCIMIENTO
El estado actual del conocimiento sugiere que [describir estado actual].

% JUSTIFICACIÓN DE LA REVISIÓN SISTEMÁTICA
Esta revisión sistemática se justifica por la necesidad de [explicar justificación].

% OBJETIVO GENERAL
El objetivo general de esta revisión es [describir objetivo general].

% OBJETIVOS ESPECÍFICOS
Los objetivos específicos son:
\\begin{itemize}
    \\item [Objetivo específico 1]
    \\item [Objetivo específico 2]
    \\item [Objetivo específico 3]
\\end{itemize}`)}

% -------------------- 2. METHODOLOGÍA --------------------
% 📌 Sección PRISMA 2020 compliant con estructura clara
\\section{METODOLOGÍA}

\\subsection{Tipo de estudio}
El presente trabajo corresponde a una revisión sistemática de la literatura, desarrollada conforme a las directrices establecidas en la guía PRISMA 2020, con el propósito de garantizar un proceso estructurado, transparente y reproducible.

\\subsection{Estrategia de búsqueda}
La búsqueda sistemática de literatura científica se realizó en las siguientes bases de datos académicas:

${generateMethodsSection(articleData.methods || '')}

% -------------------- 3. RESULTADOS --------------------
% 📌 PRISMA diagram + Caracterización + Análisis RQS + Síntesis
\\section{RESULTADOS}

${generateResultsSection(articleData.results || '')}

% -------------------- 4. DISCUSIÓN --------------------
% 📏 Interpretación crítica de hallazgos, comparación con literatura, implicaciones
% 📌 NO repetir resultados, NO tablas nuevas
\\section{DISCUSIÓN}

${convertMarkdownToLatex(articleData.discussion || `Los hallazgos de esta revisión sistemática revelan [describe interpretación de hallazgos principales].

Al comparar estos resultados con la literatura previa, se observa [describir concordancia o discrepancia con otros estudios]. Por ejemplo, [Autor et al., año] reportan hallazgos similares en [contexto], lo cual refuerza [argumento]. Sin embargo, [Autor et al., año] presentan evidencia contradictoria respecto a [aspecto específico], lo que sugiere que [explicación posible].

Las implicaciones prácticas de estos resultados incluyen [describir aplicabilidad en contextos reales]. En particular, [hallazgo específico] podría [describir impacto potencial].

Desde una perspectiva teórica, estos hallazgos [describir contribución al conocimiento]. La [tendencia/patrón observado] sugiere que [interpretación teórica], lo cual [relevancia para la teoría/campo de estudio].

Es importante considerar que [contexto o matices que afectan la interpretación]. Además, [mencionar factores que puedan explicar variabilidad en hallazgos].`)}

% -------------------- 5. LIMITACIONES --------------------
% 📌 Reconocer debilidades metodológicas, sesgos potenciales, restricciones
\\section{LIMITACIONES}

${convertMarkdownToLatex(articleData.limitations || `Esta revisión sistemática presenta las siguientes limitaciones que deben considerarse al interpretar los hallazgos:

\\begin{itemize}
    \\item \\textbf{Sesgo de publicación:} La búsqueda se limitó a bases de datos académicas, lo que podría excluir estudios con resultados negativos o literatura gris relevante.
    
    \\item \\textbf{Restricción idiomática:} Solo se incluyeron estudios publicados en [idiomas considerados], lo cual podría sesgar los resultados hacia literatura de ciertas regiones geográficas.
    
    \\item \\textbf{Heterogeneidad metodológica:} La diversidad en diseños de estudio, poblaciones y métricas reportadas limitó la posibilidad de realizar meta-análisis cuantitativos, obligando a una síntesis narrativa.
    
    \\item \\textbf{Calidad metodológica variable:} Algunos estudios incluidos presentaron puntuaciones RQS moderadas o bajas, lo cual afecta la confiabilidad de sus conclusiones.
    
    \\item \\textbf{Sesgo de selección:} A pesar del uso de IA para priorización, el proceso de cribado humano puede estar sujeto a interpretación subjetiva de criterios de inclusión/exclusión.
\\end{itemize}

Estas limitaciones sugieren que los resultados deben interpretarse con cautela y considerarse como una síntesis del estado actual del conocimiento, sujeta a refinamiento conforme nueva evidencia esté disponible.`)}

% -------------------- 6. CONCLUSIONES Y LÍNEAS FUTURAS --------------------
% 📏 Síntesis concisa + Recomendaciones + Direcciones futuras
% 📌 Responde: ¿Qué se aprendió? ¿Qué implicaciones tiene? ¿Qué falta investigar?
\\section{CONCLUSIONES Y LÍNEAS FUTURAS}

${convertMarkdownToLatex(articleData.conclusions || `Esta revisión sistemática, desarrollada conforme a las directrices PRISMA 2020, permitió alcanzar los siguientes hallazgos principales:

\\begin{itemize}
    \\item [Conclusión 1: Hallazgo clave relacionado con objetivo específico 1]
    \\item [Conclusión 2: Hallazgo clave relacionado con objetivo específico 2]
    \\item [Conclusión 3: Hallazgo clave relacionado con objetivo específico 3]
\\end{itemize}

Estos hallazgos evidencian que [sintetizar mensaje principal de la revisión]. La evidencia actual sugiere [implicación teórica o práctica principal].

\\textbf{Implicaciones prácticas:} Los resultados pueden orientar [describir aplicación práctica] y apoyar la toma de decisiones en [contexto específico].

\\textbf{Líneas futuras de investigación:}

Considerando las limitaciones identificadas y los vacíos detectados en la literatura, se recomienda:

\\begin{itemize}
    \\item Realizar estudios primarios con mayor rigor metodológico en [área específica identificada como deficiente].
    \\item Desarrollar meta-análisis cuantitativos cuando haya mayor homogeneidad en [aspecto metodológico].
    \\item Investigar el impacto de [variable/factor no suficientemente explorado] en [outcome de interés].
    \\item Expandir la evidencia hacia [contextos/poblaciones subrepresentadas].
    \\item Replicar revisiones sistemáticas incluyendo literatura gris y estudios en [idiomas adicionales].
\\end{itemize}

En conclusión, esta revisión contribuye a [describir aporte al campo] y establece una base sólida para futuras investigaciones en [tema principal].`)}

% -------------------- DECLARATIONS --------------------
% ⚠️ Opcional: Se puede omitir si el journal no lo requiere
\\section*{Financiamiento}
Esta investigación no recibió financiamiento externo.

\\section*{Conflicto de intereses}
Los autores declaran no tener conflictos de intereses.

\\section*{Registro del protocolo}
${convertMarkdownToLatex(articleData.declarations || 'El protocolo de esta revisión no fue registrado previamente en plataformas de registro internacional.')}

\\section*{Disponibilidad de datos}
Los datos están disponibles previa solicitud razonable al autor de correspondencia.

% -------------------- 7. REFERENCIAS --------------------
% 📌 Formato APA o IEEE según requerimiento del journal
\\section{REFERENCIAS}

\\begin{thebibliography}{${(articleData.references || []).length}}
${generateBibliography(articleData.references || [])}
\\end{thebibliography}

\\end{document}`;
}

/**
 * Genera sección de autores en formato universal simple
 * Compatible con plantilla de dos columnas estándar
 */
function generateUniversalAuthors(authors) {
  if (!Array.isArray(authors) || authors.length === 0) {
    return `Nombre Apellido$^{1}$\\\\
{\\small $^{1}$Afiliación institucional, País}\\\\
{\\small email@institucion.edu}`;
  }

  const authorNames = authors.map((author, index) => 
    `${escapeLatex(author.name)}$^{${index + 1}}$`
  ).join(', ');
  
  const affiliations = authors.map((author, index) => 
    `{\\small $^{${index + 1}}$${escapeLatex(author.institution || 'Universidad de las Fuerzas Armadas ESPE')}, ${escapeLatex(author.country || 'Ecuador')}}`
  ).join('\\\\
');
  
  const emails = authors.length > 0 && authors[0].email 
    ? `{\\small ${authors[0].email}}` 
    : '{\\small email@institucion.edu}';
  
  return `${authorNames}\\\\
${affiliations}\\\\
${emails}`;
}

/**
 * Función legacy para compatibilidad con templates IEEEtran
 */
function generateAuthors(authors) {
  return generateUniversalAuthors(authors);
}

/**
 * Genera sección de Methods con estructura PRISMA 2020
 * Incluye gráfico de codo si está disponible en la ubicación correcta
 */
function generateMethodsSection(methodsContent, includeElbowPlot = true) {
  // Si hay contenido markdown, convertirlo
  if (methodsContent && typeof methodsContent === 'string') {
    let latex = convertMarkdownToLatex(methodsContent);
    
    // Si el contenido no incluye el gráfico de codo y debe incluirlo, agregarlo antes de Data Extraction
    if (includeElbowPlot && !latex.includes('elbow') && !latex.includes('codo')) {
      // Buscar la sección de Data Extraction y agregar el gráfico antes
      const extractionPattern = /(\\subsection\{.*Extracción de datos|\\subsection\{.*Data Extraction)/i;
      if (extractionPattern.test(latex)) {
        const elbowSection = `
% -------------------- PRIORIZACIÓN CON IA (Gráfico de Codo) --------------------
\\subsection{Priorización mediante Inteligencia Artificial}

Se utilizó un enfoque híbrido de cribado asistido por IA. Las referencias descargadas fueron analizadas semánticamente para generar un puntaje de relevancia (0-1). La Figura~\\ref{fig:codo} muestra la distribución de estos puntajes, permitiendo identificar el punto de inflexión (knee point) óptimo para maximizar la recuperación de estudios relevantes minimizando el esfuerzo de revisión manual.

\\begin{figure}[H]
\\centering
\\includegraphics[width=\\columnwidth]{scree_plot.png}
\\caption{Distribución visual de puntajes de relevancia ordenados de mayor a menor. La línea vertical indica el punto de inflexión utilizado como criterio de corte para priorizar la revisión manual.}
\\label{fig:codo}
\\end{figure}

`;
        latex = latex.replace(extractionPattern, elbowSection + '$1');
      }
    }
    
    return latex;
  }

  // Estructura PRISMA 2020 compliant con subsecciones 2.3-2.7 según estructura académica
  return `
\\subsection{Criterios de inclusión y exclusión}

% ---- CRITERIOS DE INCLUSIÓN ----
Los estudios incluidos en la revisión debían cumplir los siguientes criterios:

\\begin{itemize}
    \\item \\textbf{Criterio de inclusión 1:} [Describe criterio específico]
    \\item \\textbf{Criterio de inclusión 2:} [Describe criterio específico]
    \\item \\textbf{Criterio de inclusión 3:} [Describe criterio específico]
    \\item \\textbf{Criterio de inclusión 4:} [Describe criterio específico]
\\end{itemize}

% ---- CRITERIOS DE EXCLUSIÓN ----
Paralelamente, los criterios de exclusión fueron:

\\begin{itemize}
    \\item \\textbf{Criterio de exclusión 1:} [Describe criterio específico]
    \\item \\textbf{Criterio de exclusión 2:} [Describe criterio específico]
    \\item \\textbf{Criterio de exclusión 3:} [Describe criterio específico]
\\end{itemize}

\\subsection{Priorización mediante Inteligencia Artificial}

Con el propósito de optimizar el proceso de cribado y reducir el esfuerzo manual, se implementó un enfoque híbrido que combina análisis semántico asistido por IA con revisión humana experta.

Las referencias obtenidas de las bases de datos fueron procesadas mediante un modelo de similitud semántica que asigna un puntaje de relevancia en el rango [0, 1], donde valores cercanos a 1 indican alta relevancia con respecto a los criterios de inclusión definidos.

La Figura~\\ref{fig:codo} presenta la distribución de estos puntajes ordenados de mayor a menor (curva de scree plot), permitiendo identificar el punto de inflexión (\\textit{knee point}) óptimo que equilibra la maximización de estudios relevantes recuperados y la minimización del volumen de referencias a revisar manualmente.

\\begin{figure}[H]
\\centering
\\includegraphics[width=0.85\\textwidth]{scree_plot.png}
\\caption{Scree plot: distribución de puntajes de relevancia semántica ordenados decrecientemente. La línea vertical roja señala el punto de inflexión utilizado como umbral de corte para priorizar la revisión manual.}
\\label{fig:codo}
\\end{figure}

Este enfoque permitió priorizar los estudios con mayor probabilidad de cumplir los criterios de elegibilidad, incrementando la eficiencia del proceso de cribado sin comprometer la exhaustividad de la revisión.

\\subsection{Extracción de datos}

La extracción de datos se realizó utilizando un formulario estructurado diseñado específicamente para capturar información relevante de los estudios incluidos. Los datos extraídos comprendieron:

\\begin{itemize}
    \\item \\textbf{Características generales:} autor(es), año de publicación, país, tipo de estudio
    \\item \\textbf{Características metodológicas:} diseño, población/muestra, intervención evaluada
    \\item \\textbf{Resultados principales:} métricas, outcomes, hallazgos clave
    \\item \\textbf{Limitaciones reportadas:} sesgos, restricciones del estudio
\\end{itemize}

La extracción fue realizada por [número] revisores de forma independiente, resolviéndose las discrepancias mediante consenso o consulta a un tercer evaluador.

\\subsection{Evaluación de calidad metodológica (RQS)}

Para garantizar la rigurosidad de los estudios incluidos, se aplicó una evaluación de calidad utilizando un esquema de \\textbf{Research Quality Score (RQS)}. Este instrumento permite valorar dimensiones críticas como:

\\begin{itemize}
    \\item Claridad en los objetivos y diseño del estudio
    \\item Adecuación de la metodología empleada
    \\item Transparencia en el reporte de resultados
    \\item Consideración de limitaciones y sesgos potenciales
    \\item Relevancia y aplicabilidad de las conclusiones
\\end{itemize}

Los estudios se clasificaron en categorías de calidad (alta, moderada, baja) según su puntuación RQS total, lo cual permitió interpretar los hallazgos con mayor criticidad y contexto.

\\subsection{Diagrama de flujo PRISMA}

El proceso completo de búsqueda, cribado y selección de estudios se resume en el diagrama de flujo PRISMA presentado en la Figura~\\ref{fig:prisma} (Sección 3 - Resultados). Este diagrama ilustra de forma visual las etapas de identificación, cribado y elegibilidad, así como las razones específicas de exclusión en cada fase del proceso de revisión.`;
}


/**
 * Genera sección de Results con PRISMA diagram y subsecciones 3.1-3.3
 * El gráfico de codo (elbow) debe estar en Methods 2.4, no aquí
 */
function generateResultsSection(resultsContent) {
  // Si hay contenido markdown personalizado, usarlo
  if (resultsContent && typeof resultsContent === 'string') {
    let content = convertMarkdownToLatex(resultsContent);
    
    // Si no menciona PRISMA diagram, agregarlo al inicio
    if (!content.toLowerCase().includes('prisma') && !content.includes('figure')) {
      content = `\\subsection{Diagrama de flujo PRISMA}

El proceso completo de identificación, cribado y selección de estudios se resume en el diagrama de flujo de la Figura~\\ref{fig:prisma}, elaborado conforme a las directrices PRISMA 2020.

\\begin{figure}[H]
\\centering
\\includegraphics[width=0.95\\textwidth]{prisma_diagram.png}
\\caption{Diagrama de flujo PRISMA 2020 del proceso de revisión sistemática. Muestra las fases de identificación, cribado, elegibilidad e inclusión final, así como las razones específicas de exclusión en cada etapa.}
\\label{fig:prisma}
\\end{figure}

` + content;
    }
    
    return content;
  }

  // Estructura por defecto con subsecciones 3.1-3.3 según estructura académica
  return `
% PRISMA DIAGRAM al inicio de Resultados  
\\subsection{Diagrama de flujo PRISMA}

El proceso completo de identificación, cribado y selección de estudios se resume en el diagrama de flujo de la Figura~\\ref{fig:prisma}, elaborado conforme a las directrices PRISMA 2020.

\\begin{figure}[H]
\\centering
\\includegraphics[width=0.95\\textwidth]{prisma_diagram.png}
\\caption{Diagrama de flujo PRISMA 2020 del proceso de revisión sistemática. Muestra las fases de identificación, cribado, elegibilidad e inclusión final de estudios, con desglose detallado por base de datos académica y razones específicas de exclusión en cada etapa.}
\\label{fig:prisma}
\\end{figure}

La búsqueda inicial identificó un total de [N] registros en las bases de datos consultadas, de los cuales [N] fueron eliminados por duplicación. Tras el cribado de [N] títulos y resúmenes, se seleccionaron [N] artículos para revisión de texto completo. Finalmente, [N] estudios cumplieron todos los criterios de inclusión y fueron incluidos en la síntesis cualitativa.

\\subsection{Caracterización general de los estudios}

Los [N] estudios incluidos fueron publicados entre [año] y [año], con una mayor concentración en los últimos [X] años, reflejando el interés creciente en el tema. En términos geográficos, la mayoría de los estudios provienen de [países/regiones principales].

En cuanto al diseño metodológico, se observó que [X\\%] correspondieron a [tipo de estudio], [X\\%] a [tipo de estudio], y el resto a [otros diseños]. Las poblaciones estudiadas variaron desde [describe poblaciones].

La Tabla~\\ref{tab:caracteristicas} resume las características generales de los estudios incluidos.

% NOTA: Esta tabla debe ser generada automáticamente desde los datos RQS
% Placeholder para la tabla de características

\\subsection{Análisis de calidad metodológica (RQS)}

La evaluación de calidad metodológica mediante el esquema RQS reveló que [X\\%] de los estudios alcanzaron una puntuación alta (> [umbral]), [X\\%] una puntuación moderada ([rango]), y [X\\%] una puntuación baja (< [umbral]).

Los criterios con mayor cumplimiento fueron [criterios], mientras que las principales debilidades metodológicas se detectaron en [criterios con bajo cumplimiento], particularmente relacionadas con [describe deficiencias comunes].

% NOTA: Esta tabla debe ser generada automáticamente desde los datos RQS
% Placeholder para tabla de evaluación RQS

\\subsection{Síntesis de resultados principales}

El análisis narrativo de los estudios incluidos permitió identificar los siguientes hallazgos clave:

\\begin{itemize}
    \\item \\textbf{Hallazgo 1:} [Describe hallazgo principal]
    \\item \\textbf{Hallazgo 2:} [Describe hallazgo principal]
    \\item \\textbf{Hallazgo 3:} [Describe hallazgo principal]
\\end{itemize}

Se observó que [describe tendencias, patrones o inconsistencias]. Las métricas más frecuentemente reportadas fueron [lista métricas], con valores que oscilaron entre [rangos].

% NOTA: Esta tabla debe ser generada automáticamente desde los datos RQS
% Placeholder para tabla de síntesis de evidencia`;
}
  return `\\subsection{Selección de estudios}
El proceso de selección de estudios se resume en la Figura~\\ref{fig:prisma}.

\\begin{figure}[H]
\\centering
% NOTA: Si prisma_diagram.png no existe, comentar la siguiente línea y descomentar el placeholder
\\includegraphics[width=0.8\\textwidth]{prisma_diagram.png}
% \\fbox{\\parbox{0.8\\textwidth}{\\centering Placeholder: prisma\\_diagram.png}}
\\caption{Diagrama de flujo PRISMA 2020 del proceso de selección de estudios.}
\\label{fig:prisma}
\\end{figure}

\\subsection{Características de los estudios incluidos}
La Tabla~\\ref{tab:studies} resume las características principales de los estudios incluidos.

\\begin{table}[H]
\\centering
\\caption{Características de los estudios incluidos}
\\label{tab:studies}
\\begin{tabular}{p{2cm}p{1cm}p{2cm}p{2cm}}
\\toprule
Autor & Año & Diseño & Contexto \\\\
\\midrule
[Autor A] & [Año] & [Diseño] & [Contexto] \\\\
[Autor B] & [Año] & [Diseño] & [Contexto] \\\\
\\bottomrule
\\end{tabular}
\\end{table}

\\subsection{Evaluación del riesgo de sesgo}
La evaluación del riesgo de sesgo se presenta en la Tabla~\\ref{tab:bias}.

\\subsection{Resultados por pregunta de investigación}

\\subsubsection{RQ1: [Pregunta de Investigación 1]}
[Presentar hallazgos para RQ1]

\\subsubsection{RQ2: [Pregunta de Investigación 2]}
[Presentar hallazgos para RQ2]

\\subsubsection{RQ3: [Pregunta de Investigación 3]}
[Presentar hallazgos para RQ3]`;
}

/**
 * Genera keywords en formato universal con punto y coma
 * 📌 3–6 palabras clave (estándar IEEE/Elsevier/Springer/MDPI)
 */
function generateUniversalKeywords(keywords) {
  // Si keywords es string (generado por sistema), usarlo directamente
  if (typeof keywords === 'string' && keywords.trim().length > 0) {
    return escapeLatex(keywords);
  }
  
  // Si es array, procesar
  if (!Array.isArray(keywords) || keywords.length === 0) {
    return 'Revisión Sistemática; PRISMA; Metodología de Investigación';
  }
  
  // Convertir array a string con punto y coma
  const keywordList = keywords.map(k => escapeLatex(k.trim())).slice(0, 6);
  
  // Asegurar que incluya "Revisión Sistemática" si no está
  if (!keywordList.some(k => k.toLowerCase().includes('revisión') || k.toLowerCase().includes('review'))) {
    keywordList.push('Revisión Sistemática');
  }
  
  return keywordList.slice(0, 6).join('; ');
}

/**
 * Genera keywords separados por comas (formato IEEEtran legacy)
 * 📌 4–6 palabras clave, coinciden con términos del protocolo
 */
function generateKeywords(keywords) {
  return generateUniversalKeywords(keywords).replace(/;/g, ',');
}

/**
 * Genera bibliografía en formato IEEE
 */
function generateBibliography(references) {
  if (!Array.isArray(references) || references.length === 0) {
    return '\\bibitem{ref1} Author, A. (2024). Title of the paper. \\textit{Journal Name}, vol(issue), pages.';
  }

  return references.map((ref, index) => {
    const authors = ref.authors || 'Unknown Author';
    const year = ref.year || new Date().getFullYear();
    const title = escapeLatex(ref.title || 'Untitled');
    const journal = escapeLatex(ref.journal || ref.source || 'Unknown Journal');
    
    let citation = `\\bibitem{ref${index + 1}} ${authors} (${year}). ${title}. \\textit{${journal}}`;
    
    if (ref.volume) citation += `, vol. ${ref.volume}`;
    if (ref.issue) citation += `, no. ${ref.issue}`;
    if (ref.pages) citation += `, pp. ${ref.pages}`;
    if (ref.doi) citation += `, doi: ${ref.doi}`;
    
    citation += '.';
    return citation;
  }).join('\n\n');
}

/**
 * Procesa tablas markdown y las convierte a formato LaTeX académico profesional
 * Compatible con formato de dos columnas y estándares de journals Q1
 */
function processMarkdownTables(text) {
  if (!text) return text;
  
  // Detectar bloques de tabla markdown completos
  const tableRegex = /((?:^\|.+\|\s*$\n)+)/gm;
  
  let tableCounter = 0;
  
  return text.replace(tableRegex, (tableBlock) => {
    tableCounter++;
    const lines = tableBlock.trim().split('\n').filter(line => line.trim());
    
    if (lines.length < 2) return tableBlock; // Necesita al menos header + separator
    
    // Parsear filas
    const rows = lines.map(line => 
      line.split('|')
        .filter(cell => cell.trim())
        .map(cell => cell.trim())
    );
    
    if (rows.length < 2) return tableBlock;
    
    const headers = rows[0];
    const dataRows = rows.slice(2); // Skip separator line
    
    // Determinar anchos de columna basados en número de columnas
    // Usando anchos relativos (\textwidth) para adaptabilidad universal
    const numCols = headers.length;
    let columnSpec = '';
    
    if (numCols === 2) {
      // Tabla de búsqueda: Base de datos + Cadena de búsqueda
      // Anchos optimizados que suman 0.95 para margen de seguridad
      columnSpec = 'p{0.22\\\\textwidth} p{0.73\\\\textwidth}';
    } else if (numCols === 6) {
      // Tabla de características: ID + 5 columnas de datos (Tabla 2 y 4)
      // Proporciones ajustadas para evitar compresión vertical: suma 0.96
      columnSpec = 'p{0.05\\\\textwidth} p{0.23\\\\textwidth} p{0.14\\\\textwidth} p{0.14\\\\textwidth} p{0.20\\\\textwidth} p{0.20\\\\textwidth}';
    } else if (numCols === 7) {
      // Tabla de evidencia y métricas: ID + 6 columnas (Tabla 3)
      // Proporciones ajustadas: ID pequeño, evidencia grande, métricas mediana, 3 RQs pequeños, calidad mediana (suma 0.96)
      columnSpec = 'p{0.05\\\\textwidth} p{0.25\\\\textwidth} p{0.20\\\\textwidth} p{0.10\\\\textwidth} p{0.10\\\\textwidth} p{0.10\\\\textwidth} p{0.16\\\\textwidth}';
    } else if (numCols === 5) {
      // Tabla de riesgo de sesgo: ID + 4 columnas
      columnSpec = 'p{0.08\\\\textwidth} p{0.22\\\\textwidth} p{0.22\\\\textwidth} p{0.22\\\\textwidth} p{0.20\\\\textwidth}';
    } else if (numCols <= 3) {
      // Tablas genéricas de 3 columnas o menos
      const colWidth = (0.95 / numCols).toFixed(2);
      columnSpec = headers.map(() => `p{${colWidth}\\\\textwidth}`).join(' ');
    } else if (numCols === 4) {
      // Tablas de 4 columnas
      columnSpec = 'p{0.20\\\\textwidth} p{0.25\\\\textwidth} p{0.25\\\\textwidth} p{0.24\\\\textwidth}';
    } else {
      // Fallback: distribuir equitativamente
      const colWidth = (0.95 / numCols).toFixed(2);
      columnSpec = headers.map(() => `p{${colWidth}\\\\textwidth}`).join(' ');
    }
    
    // Generar label y caption
    const tableCaption = generateTableCaption(headers);
    const tableLabel = tableCaption.includes('Bases de datos') ? 'tab:busqueda' : `tab:table${tableCounter}`;
    
    // Construir tabla LaTeX con formato correcto
    let latexTable = '\n\\begin{table}[H]\n';
    latexTable += '\\centering\n';
    latexTable += '\\renewcommand{\\arraystretch}{1.3}\n';
    latexTable += `\\caption{${tableCaption}}\n`;
    latexTable += `\\label{${tableLabel}}\n`;
    latexTable += `\\begin{tabular}{${columnSpec}}\n`;
    latexTable += '\\toprule\n';
    
    // Headers en negrita
    latexTable += '\\textbf{' + headers.map(h => escapeLatexTableCell(h)).join('} & \\textbf{') + '} \\\\\n';
    latexTable += '\\midrule\n';
    
    // Data rows con \midrule entre filas (pero NO después de la última)
    dataRows.forEach((row, index) => {
      latexTable += row.map(cell => escapeLatexTableCell(cell)).join(' & ') + ' \\\\\n';
      if (index < dataRows.length - 1) {
        latexTable += '\\midrule\n';
      }
    });
    
    latexTable += '\\bottomrule\n';
    latexTable += '\\end{tabular}\n';
    latexTable += '\\end{table}\n\n';
    
    return latexTable;
  });
}

/**
 * Genera caption descriptivo para tabla basándose en los encabezados
 */
function generateTableCaption(headers) {
  // Intentar generar caption inteligente basado en headers
  const firstHeader = headers[0].toLowerCase();
  const secondHeader = headers.length > 1 ? headers[1].toLowerCase() : '';
  
  // Detectar tabla de búsqueda por patrón de headers
  if ((firstHeader.includes('base') && firstHeader.includes('datos')) || 
      (firstHeader.includes('database')) ||
      (secondHeader.includes('búsqueda') || secondHeader.includes('search') || secondHeader.includes('cadena'))) {
    return 'Bases de datos académicas y cadenas de búsqueda';
  }
  
  if (firstHeader.includes('id') || firstHeader.includes('estudio')) {
    if (headers.some(h => h.toLowerCase().includes('autor'))) {
      return 'Características generales de los estudios incluidos';
    }
    if (headers.some(h => h.toLowerCase().includes('evidencia'))) {
      return 'Síntesis de evidencia clave y métricas reportadas';
    }
    if (headers.some(h => h.toLowerCase().includes('sesgo') || h.toLowerCase().includes('riesgo'))) {
      return 'Evaluación del riesgo de sesgo y calidad metodológica';
    }
  }
  
  // Fallback genérico
  return 'Resumen de resultados';
}

/**
 * Convierte Markdown a LaTeX
 */
function convertMarkdownToLatex(markdown) {
  if (!markdown) return '';

  let latex = markdown;

  // Headers
  latex = latex.replace(/^#### (.*$)/gm, '\\subsubsection{$1}');
  latex = latex.replace(/^### (.*$)/gm, '\\subsection{$1}');
  latex = latex.replace(/^## (.*$)/gm, '\\subsection{$1}');
  latex = latex.replace(/^# (.*$)/gm, '\\section{$1}');

  // Bold y cursiva
  latex = latex.replace(/\*\*\*(.+?)\*\*\*/g, '\\textbf{\\textit{$1}}');
  latex = latex.replace(/\*\*(.+?)\*\*/g, '\\textbf{$1}');
  latex = latex.replace(/\*(.+?)\*/g, '\\textit{$1}');

  // Listas
  latex = latex.replace(/^\s*[-*]\s+(.+)$/gm, '\\item $1');
  latex = latex.replace(/(\n\\item .+?(?=\n[^\n\\]|\n\n|$))/gs, (match) => {
    return '\\begin{itemize}\n' + match + '\n\\end{itemize}\n';
  });

  // Listas numeradas
  latex = latex.replace(/^\s*\d+\.\s+(.+)$/gm, '\\item $1');
  latex = latex.replace(/(\n\\item .+?(?=\n[^\n\\]|\n\n|$))/gs, (match) => {
    if (!match.includes('itemize')) {
      return '\\begin{enumerate}\n' + match + '\n\\end{enumerate}\n';
    }
    return match;
  });

  // Código inline
  latex = latex.replace(/`([^`]+)`/g, '\\texttt{$1}');

  // Bloques de código
  latex = latex.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    return `\\begin{verbatim}\n${code}\\end{verbatim}`;
  });

  // URLs y enlaces
  latex = latex.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '\\href{$2}{$1}');

  // Tablas markdown a LaTeX profesional
  // IMPORTANTE: Las tablas deben procesarse DESPUÉS de escapar para preservar símbolos LaTeX
  const hasTable = latex.includes('|');
  
  if (hasTable) {
    // Guardar tablas temporalmente con placeholders únicos que no serán escapados
    const tables = [];
    const tableRegex = /((?:^\|.+\|\s*$\n)+)/gm;
    let tableIndex = 0;
    
    latex = latex.replace(tableRegex, (match) => {
      // Usar comando LaTeX como placeholder (no será escapado por escapeLatex)
      const placeholder = `\\TABLEPLACEHOLDER${tableIndex}`;
      tables.push(match);
      tableIndex++;
      return placeholder;
    });
    
    // Escapar caracteres especiales del texto (los placeholders con \ no se escapan)
    latex = escapeLatex(latex);
    
    // Procesar tablas y restaurarlas (sin escapar)
    tables.forEach((table, i) => {
      const processedTable = processMarkdownTables(table);
      latex = latex.replace(`\\TABLEPLACEHOLDER${i}`, processedTable);
    });
  } else {
    // No hay tablas, escapar normalmente
    latex = escapeLatex(latex);
  }

  return latex;
}

/**
 * Escapa caracteres especiales de LaTeX en celdas de tabla
 * Versión específica para celdas que siempre escapa (sin checks de comandos LaTeX)
 */
function escapeLatexTableCell(text) {
  if (!text) return '';
  
  const replacements = {
    '&': '\\&',
    '%': '\\%',
    '$': '\\$',
    '#': '\\#',
    '_': '\\_',
    '{': '\\{',
    '}': '\\}',
    '~': '\\textasciitilde{}',
    '^': '\\textasciicircum{}'
  };

  return String(text).replace(/[&%$#_{}~^]/g, char => replacements[char] || char);
}

/**
 * Escapa caracteres especiales de LaTeX
 */
function escapeLatex(text) {
  if (!text) return '';
  
  const replacements = {
    '&': '\\&',
    '%': '\\%',
    '$': '\\$',
    '#': '\\#',
    '_': '\\_',
    '{': '\\{',
    '}': '\\}',
    '~': '\\textasciitilde{}',
    '^': '\\textasciicircum{}'
  };

  // No escapar caracteres dentro de comandos LaTeX
  if (text.includes('\\')) {
    return text;
  }

  return text.replace(/[&%$#_{}~^]/g, char => replacements[char]);
}

/**
 * Genera template específico para Springer
 */
function generateSpringer(articleData) {
  return `\\documentclass[smallextended]{svjour3}
\\usepackage{graphicx}
\\usepackage{hyperref}

\\begin{document}

\\title{${escapeLatex(articleData.title)}}

\\author{${(articleData.authors || []).map(a => a.name).join(' \\and ')}}

\\institute{
${(articleData.authors || []).map(a => 
  `${a.name} \\at ${a.institution || 'Institution'} \\email{${a.email || 'email@'}}`
).join(' \\and ')}
}

\\maketitle

\\begin{abstract}
${escapeLatex(articleData.abstract || '')}
\\keywords{${generateKeywords(articleData.keywords || [])}}
\\end{abstract}

${convertMarkdownToLatex(articleData.introduction || '')}
${convertMarkdownToLatex(articleData.methods || '')}
${convertMarkdownToLatex(articleData.results || '')}
${convertMarkdownToLatex(articleData.discussion || '')}
${convertMarkdownToLatex(articleData.conclusions || '')}

\\begin{thebibliography}{${(articleData.references || []).length}}
${generateBibliography(articleData.references || [])}
\\end{thebibliography}

\\end{document}`;
}

/**
 * Genera template específico para Elsevier
 */
function generateElsevier(articleData) {
  return `\\documentclass[review]{elsarticle}

\\usepackage{lineno}
\\modulolinenumbers[5]

\\journal{Journal Name}

\\begin{document}

\\begin{frontmatter}

\\title{${escapeLatex(articleData.title)}}

${(articleData.authors || []).map(a => 
  `\\author{${escapeLatex(a.name)}}
\\address{${escapeLatex(a.institution || 'Institution')}}
\\ead{${a.email || 'email@address.com'}}`
).join('\n')}

\\begin{abstract}
${escapeLatex(articleData.abstract || '')}
\\end{abstract}

\\begin{keyword}
${generateKeywords(articleData.keywords || [])}
\\end{keyword}

\\end{frontmatter}

\\linenumbers

${convertMarkdownToLatex(articleData.introduction || '')}
${convertMarkdownToLatex(articleData.methods || '')}
${convertMarkdownToLatex(articleData.results || '')}
${convertMarkdownToLatex(articleData.discussion || '')}
${convertMarkdownToLatex(articleData.conclusions || '')}

\\section*{References}
\\begin{thebibliography}{${(articleData.references || []).length}}
${generateBibliography(articleData.references || [])}
\\end{thebibliography}

\\end{document}`;
}

module.exports = {
  generate,
  generateSpringer,
  generateElsevier,
  convertMarkdownToLatex,
  escapeLatex
};
