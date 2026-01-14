/**
 * Template LaTeX para exportación de artículos científicos
 * Compatible con formato de journals Q1 (IEEE, ACM, Elsevier, Springer)
 * 
 * Uso: 
 * const template = require('./article-latex.template');
 * const latex = template.generate(articleData);
 */

/**
 * Genera documento LaTeX completo desde datos del artículo
 */
function generate(articleData) {
  return `\\documentclass[conference]{IEEEtran}
\\usepackage{cite}
\\usepackage{amsmath,amssymb,amsfonts}
\\usepackage{algorithmic}
\\usepackage{graphicx}
\\usepackage{textcomp}
\\usepackage{xcolor}
\\usepackage[utf8]{inputenc}
\\usepackage{booktabs}
\\usepackage{hyperref}

\\def\\BibTeX{{\\rm B\\kern-.05em{\\sc i\\kern-.025em b}\\kern-.08em
    T\\kern-.1667em\\lower.7ex\\hbox{E}\\kern-.125emX}}

\\begin{document}

% Título
\\title{${escapeLatex(articleData.title || 'Systematic Review')}}

% Autores
\\author{
${generateAuthors(articleData.authors || [])}
}

\\maketitle

% Abstract
\\begin{abstract}
${escapeLatex(articleData.abstract || '')}
\\end{abstract}

% Keywords
\\begin{IEEEkeywords}
systematic review, ${generateKeywords(articleData.keywords || [])}
\\end{IEEEkeywords}

% Introducción
\\section{Introduction}
${convertMarkdownToLatex(articleData.introduction || '')}

% Métodos
\\section{Methods}
${convertMarkdownToLatex(articleData.methods || '')}

% Resultados
\\section{Results}
${convertMarkdownToLatex(articleData.results || '')}

% Discusión
\\section{Discussion}
${convertMarkdownToLatex(articleData.discussion || '')}

% Conclusiones
\\section{Conclusions}
${convertMarkdownToLatex(articleData.conclusions || '')}

% Declaraciones
\\section*{Declarations}
${convertMarkdownToLatex(articleData.declarations || '')}

% Referencias
\\begin{thebibliography}{${(articleData.references || []).length}}
${generateBibliography(articleData.references || [])}
\\end{thebibliography}

\\end{document}`;
}

/**
 * Genera sección de autores en formato LaTeX
 */
function generateAuthors(authors) {
  if (!Array.isArray(authors) || authors.length === 0) {
    return `\\IEEEauthorblockN{Author Name}
\\IEEEauthorblockA{\\textit{Department} \\\\
\\textit{University Name}\\\\
City, Country \\\\
email@address.com}`;
  }

  return authors.map((author, index) => {
    return `\\IEEEauthorblockN{${index + 1}\\textsuperscript{st} ${escapeLatex(author.name)}}
\\IEEEauthorblockA{\\textit{${escapeLatex(author.department || 'Department')}} \\\\
\\textit{${escapeLatex(author.institution || 'Institution')}}\\\\
${escapeLatex(author.city || 'City')}, ${escapeLatex(author.country || 'Country')} \\\\
${author.email || 'email@address.com'}}`;
  }).join('\n\\and\n');
}

/**
 * Genera keywords separados por comas
 */
function generateKeywords(keywords) {
  if (!Array.isArray(keywords) || keywords.length === 0) {
    return 'literature review, research methodology';
  }
  return keywords.map(escapeLatex).join(', ');
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

  // Tablas (markdown básico)
  latex = latex.replace(/\|(.+)\|/g, (match) => {
    const cells = match.split('|').filter(Boolean).map(c => c.trim());
    return cells.join(' & ') + ' \\\\';
  });

  // Escape caracteres especiales
  latex = escapeLatex(latex);

  return latex;
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
