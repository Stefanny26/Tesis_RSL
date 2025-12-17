const he = require('he');

/**
 * Sanitizador y Validador de Queries Académicas
 * Normaliza términos, valida sintaxis por base de datos
 */

/**
 * Normaliza y limpia un término individual
 */
function sanitizeTerm(term) {
  if (!term || typeof term !== 'string') return '';
  
  // Decode HTML entities, normalize unicode, remove control chars
  let s = he.decode(term)
    .normalize('NFKC')
    .replace(/[\u0000-\u001F\u007F]/g, ' ');
  
  // Remove problematic chars for queries
  s = s.replace(/[{}\[\]^~?<>]/g, ' ');
  s = s.replace(/\s+/g, ' ').trim();
  
  // If phrase (contains space) ensure quotes
  if (s.includes(' ') && !/^".+"$/.test(s)) {
    s = `"${s}"`;
  }
  
  return s;
}

/**
 * Validación básica de estructura booleana
 */
function basicValidateQuery(q) {
  if (typeof q !== 'string') return false;
  
  // Balanced parentheses
  const stack = [];
  for (let ch of q) {
    if (ch === '(') stack.push(ch);
    if (ch === ')') {
      if (!stack.length) return false;
      stack.pop();
    }
  }
  if (stack.length) return false;
  
  // No forbidden sequences
  if (/[*{}[\]^~?<>]/.test(q)) return false;
  
  // No backticks
  if (/`/.test(q)) return false;
  
  return true;
}

/**
 * Validador específico para IEEE: max 5 AND groups y <=5 OR por grupo
 * (Relajado para permitir queries más completas)
 */
function validateIEEE(q) {
  if (!basicValidateQuery(q)) return false;
  
  const andGroups = q.split(/\s+AND\s+/i);
  if (andGroups.length > 5) return false;
  
  for (const g of andGroups) {
    const orCount = (g.match(/\s+OR\s+/gi) || []).length;
    if (orCount > 5) return false;
  }
  
  return true;
}

/**
 * Validador para Scopus: verifica TITLE-ABS-KEY y paréntesis
 */
function validateScopus(q) {
  if (!basicValidateQuery(q)) return false;
  
  // Debe contener TITLE-ABS-KEY
  if (!/TITLE-ABS-KEY\s*\(/i.test(q)) return false;
  
  return true;
}

/**
 * Validador para PubMed: verifica campos [Title/Abstract]
 */
function validatePubMed(q) {
  if (!basicValidateQuery(q)) return false;
  
  // Debe contener al menos un campo de PubMed
  if (!/\[Title\/Abstract\]|\[MeSH Terms\]|\[Title\]/i.test(q)) return false;
  
  return true;
}

/**
 * Construye un grupo de términos con OR
 */
function buildGroup(terms) {
  if (!Array.isArray(terms) || terms.length === 0) return '';
  
  const sanitized = terms
    .map(t => sanitizeTerm(t))
    .filter(Boolean);
  
  if (sanitized.length === 0) return '';
  if (sanitized.length === 1) return sanitized[0];
  
  return `(${sanitized.join(' OR ')})`;
}

/**
 * Genera queries optimizadas por base de datos
 */
function generateQueriesFromGroups(groups, databases) {
  const results = [];
  
  for (const db of databases) {
    const dbLower = db.toLowerCase();
    let query = '';
    let explanation = '';
    
    // Filtrar grupos vacíos
    const validGroups = groups.filter(g => Array.isArray(g) && g.length > 0);
    
    if (validGroups.length === 0) {
      console.warn(`No hay términos válidos para ${db}`);
      continue;
    }
    
    switch (dbLower) {
      case 'ieee':
        // IEEE: max 3 grupos AND, sin campos
        const ieeeGroups = validGroups.slice(0, 3);
        query = ieeeGroups.map(g => buildGroup(g)).join(' AND ');
        explanation = 'Cadena optimizada para IEEE Xplore, usando solo términos libres y operadores AND/OR, sin campos. Máximo 3 grupos AND.';
        
        // Validar y ajustar si es necesario
        while (!validateIEEE(query) && query.includes(' AND ')) {
          const parts = query.split(/\s+AND\s+/i);
          parts.pop();
          query = parts.join(' AND ');
        }
        break;
        
      case 'scopus':
        // Scopus: TITLE-ABS-KEY con todos los grupos
        const scopusInner = validGroups.map(g => buildGroup(g)).join(' AND ');
        query = `TITLE-ABS-KEY(${scopusInner})`;
        explanation = 'Query para Scopus usando TITLE-ABS-KEY que busca en título, resumen y palabras clave.';
        break;
        
      case 'pubmed':
        // PubMed: [Title/Abstract] por cada término
        const pubmedParts = validGroups.map(g => {
          const terms = g.map(t => {
            const clean = sanitizeTerm(t).replace(/"/g, '');
            return `${clean}[Title/Abstract]`;
          });
          return terms.length > 1 ? `(${terms.join(' OR ')})` : terms[0];
        });
        query = pubmedParts.join(' AND ');
        explanation = 'Query para PubMed usando campos [Title/Abstract] para búsqueda en título y resumen.';
        break;
        
      case 'webofscience':
      case 'web_of_science':
        // Web of Science: TS=(...)
        const wosInner = validGroups.map(g => buildGroup(g)).join(' AND ');
        query = `TS=(${wosInner})`;
        explanation = 'Query para Web of Science usando TS= (Topic Search) que busca en título, resumen y palabras clave.';
        break;
        
      case 'google_scholar':
        // Google Scholar: query simple sin campos
        query = validGroups.map(g => buildGroup(g)).join(' AND ');
        explanation = 'Query simple para Google Scholar sin campos específicos.';
        break;
        
      case 'acm':
        // ACM: [[Title: ...]] OR [[Abstract: ...]]
        query = validGroups.map(g => buildGroup(g)).join(' AND ');
        explanation = 'Query para ACM Digital Library con operadores booleanos estándar.';
        break;
        
      case 'sciencedirect':
        // ScienceDirect: title() AND abstract()
        query = validGroups.map(g => buildGroup(g)).join(' AND ');
        explanation = 'Query para ScienceDirect con operadores booleanos estándar.';
        break;
        
      case 'springer':
        // Springer: title:(...) abstract:(...)
        query = validGroups.map(g => buildGroup(g)).join(' AND ');
        explanation = 'Query para SpringerLink con operadores booleanos estándar.';
        break;
        
      default:
        // Default: query simple
        query = validGroups.map(g => buildGroup(g)).join(' AND ');
        explanation = `Query estándar para ${db} con operadores booleanos.`;
    }
    
    // Limpieza final
    query = query.replace(/\s+/g, ' ').trim();
    
    results.push({
      database: db,
      query,
      explanation
    });
  }
  
  return results;
}

/**
 * Parsea JSON de forma segura desde texto con contenido adicional
 */
function safeParseJSON(text) {
  try {
    // Intentar parse directo primero
    return JSON.parse(text);
  } catch (e) {
    // Buscar JSON dentro del texto
    const first = text.indexOf('{');
    const last = text.lastIndexOf('}');
    
    if (first === -1 || last === -1) {
      throw new Error('No se encontró JSON válido en la respuesta');
    }
    
    const sub = text.slice(first, last + 1);
    return JSON.parse(sub);
  }
}

module.exports = {
  sanitizeTerm,
  basicValidateQuery,
  validateIEEE,
  validateScopus,
  validatePubMed,
  buildGroup,
  generateQueriesFromGroups,
  safeParseJSON
};

