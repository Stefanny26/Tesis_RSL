/**
 * Adaptador de cadenas de búsqueda para diferentes bases de datos académicas
 */

export type DatabaseType = 'scopus' | 'ieee' | 'acm' | 'wos' | 'scholar'

export interface SearchStringFormat {
  database: DatabaseType
  label: string
  description: string
  example: string
  fieldPrefix?: string
  notOperator: string
}

export const DATABASE_FORMATS: Record<DatabaseType, SearchStringFormat> = {
  scopus: {
    database: 'scopus',
    label: 'Scopus (Elsevier)',
    description: 'Usa TITLE-ABS-KEY() para buscar en título, resumen y palabras clave',
    example: 'TITLE-ABS-KEY("machine learning" AND security AND NOT IoT)',
    fieldPrefix: 'TITLE-ABS-KEY',
    notOperator: 'AND NOT'
  },
  ieee: {
    database: 'ieee',
    label: 'IEEE Xplore',
    description: 'Usa comillas y paréntesis. Busca en All Metadata o Abstract',
    example: '("term1" OR "term2") AND "term3" AND NOT "excluded"',
    notOperator: 'AND NOT'
  },
  acm: {
    database: 'acm',
    label: 'ACM Digital Library',
    description: 'Usa comillas para frases. Usa -term para excluir',
    example: '("term1" OR "term2") AND "term3" -"excluded"',
    notOperator: '-'
  },
  wos: {
    database: 'wos',
    label: 'Web of Science',
    description: 'Usa TS= (Topic Search) para título, resumen, keywords',
    example: 'TS=(("term1" OR "term2") AND "term3" NOT "excluded")',
    fieldPrefix: 'TS',
    notOperator: 'NOT'
  },
  scholar: {
    database: 'scholar',
    label: 'Google Scholar',
    description: 'Operadores simples: AND, OR, -term (sin campos especiales)',
    example: '("term1" OR "term2") AND "term3" -excluded',
    notOperator: '-'
  }
}

/**
 * Adapta una cadena de búsqueda genérica al formato de una base de datos específica
 */
export function adaptSearchString(
  searchString: string,
  targetDatabase: DatabaseType
): string {
  if (!searchString || !searchString.trim()) {
    return ''
  }

  let adapted = searchString.trim()

  // Eliminar wrappers existentes de otras bases de datos
  adapted = adapted.replace(/^TITLE-ABS-KEY\((.*)\)$/s, '$1')
  adapted = adapted.replace(/^TS=\((.*)\)$/s, '$1')
  adapted = adapted.replace(/^TITLE-ABSTR-KEY\((.*)\)$/s, '$1')
  
  // Normalizar operadores según la base de datos
  switch (targetDatabase) {
    case 'scopus':
      // Para Scopus: 
      // 1. Convertir "NOT (term1 OR term2 OR term3)" a "AND NOT term1 AND NOT term2 AND NOT term3"
      adapted = adapted.replace(/\s+NOT\s+\(([^)]+)\)/gi, (match, group) => {
        const terms = group.split(/\s+OR\s+/i).map((t: string) => t.trim())
        return ' ' + terms.map((term: string) => `AND NOT ${term}`).join(' ')
      })
      
      // 2. Normalizar "AND (term1 OR term2)" - mantener como está
      // 3. Convertir NOT simple (fuera de paréntesis) a AND NOT
      adapted = adapted.replace(/\s+NOT\s+(?!\()/gi, ' AND NOT ')
      
      // 4. Limpiar múltiples AND NOT consecutivos
      adapted = adapted.replace(/(\s+AND\s+NOT\s+)+/gi, ' AND NOT ')
      
      // 5. Agregar wrapper TITLE-ABS-KEY
      if (!adapted.startsWith('TITLE-ABS-KEY(')) {
        adapted = `TITLE-ABS-KEY(${adapted})`
      }
      break

    case 'ieee':
      // IEEE: convertir NOT a AND NOT, mantener estructura con paréntesis
      // Convertir "NOT (term1 OR term2)" a "AND NOT (term1 OR term2)"
      adapted = adapted.replace(/\s+NOT\s+\(/gi, ' AND NOT (')
      adapted = adapted.replace(/\s+NOT\s+(?!\()/gi, ' AND NOT ')
      break

    case 'acm':
    case 'scholar':
      // Convertir NOT a -term (sin paréntesis)
      // Primero expandir "NOT (term1 OR term2)" a "-term1 -term2"
      adapted = adapted.replace(/\s+NOT\s+\(([^)]+)\)/gi, (match, group) => {
        const terms = group.split(/\s+OR\s+/i).map((t: string) => t.trim())
        return ' ' + terms.map((term: string) => `-${term}`).join(' ')
      })
      // Convertir NOT simple a -
      adapted = adapted.replace(/\s+NOT\s+/gi, ' -')
      break

    case 'wos':
      // Web of Science: mantener NOT simple (sin AND)
      adapted = adapted.replace(/\s+AND\s+NOT\s+/gi, ' NOT ')
      // Agregar wrapper TS=
      if (!adapted.startsWith('TS=(')) {
        adapted = `TS=(${adapted})`
      }
      break
  }

  return adapted
}

/**
 * Obtiene sugerencias de estructura para una base de datos
 */
export function getDatabaseHelp(database: DatabaseType): string {
  const format = DATABASE_FORMATS[database]
  
  const tips = {
    scopus: `
• Usa TITLE-ABS-KEY() para buscar en todos los campos principales
• Operadores: AND, OR, AND NOT (NOT solo no funciona)
• Usa comillas para frases exactas: "machine learning"
• NO uses asteriscos al final de palabras entre comillas
• Ejemplo válido: TITLE-ABS-KEY("authentication" AND "web application" AND NOT IoT)
• Ejemplo válido: TITLE-ABS-KEY(MFA OR "two factor" OR 2FA)
    `,
    ieee: `
• Busca en "All Metadata" o limita a "Abstract"
• Operadores: AND, OR, AND NOT
• Usa comillas para frases: "two factor authentication"
• Ejemplo: ("multifactor authentication" OR MFA) AND "web application"
    `,
    acm: `
• Usa comillas para frases exactas
• Operadores: AND, OR
• Exclusión con guión: -term o -"frase exacta"
• Ejemplo: "multifactor authentication" AND "web app" -IoT
    `,
    wos: `
• Usa TS= para búsqueda en Topic (título, resumen, keywords)
• Operadores: AND, OR, NOT
• Usa comillas para frases exactas
• Ejemplo: TS=(("authentication" OR "MFA") AND "security" NOT "IoT")
    `,
    scholar: `
• Operadores simples: AND, OR
• Exclusión con guión: -term
• Usa comillas para frases exactas: "machine learning"
• Ejemplo: "multifactor authentication" AND "web application" -IoT -hardware
    `
  }

  return tips[database] || ''
}

/**
 * Extrae las bases de datos del protocolo que tienen API disponible
 */
export function getAvailableDatabases(protocolDatabases?: string[]): DatabaseType[] {
  const available: DatabaseType[] = ['scopus', 'ieee']
  
  if (!protocolDatabases || protocolDatabases.length === 0) {
    return available
  }

  // Filtrar solo las que tienen API y están en el protocolo
  const protocolLower = protocolDatabases.map(db => db.toLowerCase())
  
  return available.filter(db => {
    const format = DATABASE_FORMATS[db]
    return protocolLower.some(pdb => 
      pdb.includes(db) || pdb.includes(format.label.toLowerCase())
    )
  })
}
