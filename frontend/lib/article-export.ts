import type { ArticleVersion } from "./article-types"

/**
 * Genera un documento HTML formateado del artículo
 */
export function generateArticleHTML(version: ArticleVersion): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${version.title}</title>
  <style>
    @page {
      size: A4;
      margin: 2.5cm;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #000;
      max-width: 21cm;
      margin: 0 auto;
      padding: 2cm;
    }
    h1 {
      font-size: 16pt;
      font-weight: bold;
      text-align: center;
      margin: 1em 0 0.5em 0;
    }
    h2 {
      font-size: 14pt;
      font-weight: bold;
      margin: 1.5em 0 0.5em 0;
    }
    h3 {
      font-size: 12pt;
      font-weight: bold;
      margin: 1em 0 0.5em 0;
    }
    p {
      margin: 0.5em 0;
      text-align: justify;
    }
    .metadata {
      text-align: center;
      font-size: 11pt;
      margin-bottom: 2em;
      color: #555;
    }
    .abstract {
      margin: 2em 0;
      padding: 1em;
      background-color: #f5f5f5;
      border-left: 4px solid #333;
    }
    .abstract h2 {
      margin-top: 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1em 0;
      font-size: 10pt;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #f2f2f2;
      font-weight: bold;
    }
    .section {
      margin-bottom: 2em;
    }
    .references {
      font-size: 10pt;
    }
    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <h1>${version.title}</h1>
  
  <div class="metadata">
    <p>Version ${version.version}</p>
    <p>${new Date(version.createdAt).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}</p>
    <p>${version.createdBy}</p>
    <p>${version.wordCount.toLocaleString()} words</p>
  </div>

  ${version.content.abstract ? `
  <div class="abstract section">
    <h2>Abstract</h2>
    ${formatContent(version.content.abstract)}
  </div>
  ` : ''}

  ${version.content.introduction ? `
  <div class="section">
    <h2>1. Introduction</h2>
    ${formatContent(version.content.introduction)}
  </div>
  ` : ''}

  ${version.content.methods ? `
  <div class="section">
    <h2>2. Methods</h2>
    ${formatContent(version.content.methods)}
  </div>
  ` : ''}

  ${version.content.results ? `
  <div class="section">
    <h2>3. Results</h2>
    ${formatContent(version.content.results)}
  </div>
  ` : ''}

  ${version.content.discussion ? `
  <div class="section">
    <h2>4. Discussion</h2>
    ${formatContent(version.content.discussion)}
  </div>
  ` : ''}

  ${version.content.conclusions ? `
  <div class="section">
    <h2>5. Conclusions</h2>
    ${formatContent(version.content.conclusions)}
  </div>
  ` : ''}

  ${version.content.declarations ? `
  <div class="section">
    <h2>Declarations</h2>
    ${formatContent(version.content.declarations)}
  </div>
  ` : ''}

  ${version.content.references ? `
  <div class="section references">
    <h2>References</h2>
    ${formatContent(version.content.references)}
  </div>
  ` : ''}
</body>
</html>
  `.trim()
}

/**
 * Formatea el contenido convirtiendo markdown a HTML básico
 */
function formatContent(content: string): string {
  return content
    .split('\n\n')
    .map(paragraph => {
      // Detectar tablas markdown
      if (paragraph.includes('|')) {
        return convertMarkdownTable(paragraph)
      }
      // Párrafos normales
      return `<p>${paragraph.replace(/\n/g, ' ')}</p>`
    })
    .join('\n')
}

/**
 * Convierte tabla markdown a HTML
 */
function convertMarkdownTable(markdown: string): string {
  const lines = markdown.trim().split('\n')
  if (lines.length < 2) return `<p>${markdown}</p>`

  const headers = lines[0].split('|').filter(cell => cell.trim())
  const rows = lines.slice(2).map(line => 
    line.split('|').filter(cell => cell.trim())
  )

  return `
    <table>
      <thead>
        <tr>
          ${headers.map(header => `<th>${header.trim()}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${rows.map(row => `
          <tr>
            ${row.map(cell => `<td>${cell.trim()}</td>`).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `
}

/**
 * Exporta el artículo como PDF usando la API del navegador
 */
export function exportArticleToPDF(version: ArticleVersion) {
  const html = generateArticleHTML(version)
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  
  // Abrir en nueva ventana para imprimir como PDF
  const printWindow = window.open(url, '_blank')
  if (printWindow) {
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print()
        URL.revokeObjectURL(url)
      }, 250)
    }
  }
}

/**
 * Exporta el artículo como DOCX (descarga HTML que puede abrirse en Word)
 */
export function exportArticleToDOCX(version: ArticleVersion) {
  const html = generateArticleHTML(version)
  const blob = new Blob([html], { type: 'application/msword' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = `${sanitizeFilename(version.title)}-v${version.version}.doc`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Sanitiza el nombre del archivo
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9]/gi, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
    .substring(0, 100)
}
