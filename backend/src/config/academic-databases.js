/**
 * ✅ CLASIFICACIÓN OFICIAL DE BASES DE DATOS POR ÁREA ACADÉMICA
 * Sistema centralizado basado en clasificación universitaria estándar
 * 
 * Última actualización: 27 de noviembre de 2025
 */

const ACADEMIC_DATABASES = {
  
  // 🟦 1. INGENIERÍAS (Sistemas, Software, Computación, Electrónica, Telecomunicaciones, Industrial, Mecánica)
  'ingenieria-tecnologia': {
    name: 'Ingeniería y Tecnología',
    icon: '🟦',
    keywords: ['ingeniería', 'tecnología', 'software', 'computación', 'sistemas', 'programación', 'algoritmo', 'red', 'hardware', 'desarrollo', 'electrónica', 'telecomunicaciones', 'industrial', 'mecánica', 'robótica', 'automatización'],
    databases: [
      {
        id: 'ieee',
        name: 'IEEE Xplore',
        url: 'https://ieeexplore.ieee.org',
        description: 'Principal base de datos para ingeniería eléctrica, electrónica y computación',
        hasAPI: true,
        syntax: 'ieee',
        operators: { and: 'AND', or: 'OR', not: 'NOT', phrase: '""', wildcard: '*', proximity: 'NEAR/n' },
        fields: {
          title: '"Document Title"',
          abstract: '"Abstract"',
          keywords: '"Author Keywords"',
          all: '"All Metadata"'
        },
        structure: 'field:(term1 OR term2) AND field:(term3)',
        example: '"Document Title":(machine learning) AND "Abstract":(neural networks)',
        filters: ['year', 'publication_type', 'conference', 'journal']
      },
      {
        id: 'acm',
        name: 'ACM Digital Library',
        url: 'https://dl.acm.org',
        description: 'Base de datos especializada en ciencias de la computación',
        hasAPI: true,
        syntax: 'acm',
        operators: { and: 'AND', or: 'OR', not: 'NOT', phrase: '""' },
        fields: { title: 'Title', abstract: 'Abstract', keywords: 'Keywords' },
        structure: '[[Title: term]] AND [[Abstract: term]]',
        example: '[[Title: "cloud computing"]] AND [[Abstract: security]]',
        filters: ['year', 'publication_type']
      },
      {
        id: 'scopus',
        name: 'Scopus',
        url: 'https://www.scopus.com',
        description: 'Base de datos multidisciplinaria con fuerte presencia en ingeniería',
        hasAPI: true,
        syntax: 'scopus',
        operators: { and: 'AND', or: 'OR', not: 'AND NOT', phrase: '""', wildcard: '*', proximity: 'W/n' },
        fields: { title: 'TITLE', abstract: 'ABS', keywords: 'KEY', all: 'TITLE-ABS-KEY' },
        structure: 'TITLE-ABS-KEY((term1 OR term2) AND (term3 OR term4))',
        example: 'TITLE-ABS-KEY(("PostgreSQL" OR "NoSQL") AND ("performance" OR "scalability"))',
        filters: ['year', 'document_type', 'subject_area', 'source']
      },
      {
        id: 'sciencedirect',
        name: 'ScienceDirect',
        url: 'https://www.sciencedirect.com',
        description: 'Gran colección de artículos científicos y técnicos',
        hasAPI: true,
        syntax: 'sciencedirect',
        operators: { and: 'AND', or: 'OR', not: 'AND NOT', phrase: '""' },
        fields: { title: 'Title', abstract: 'Abstract', keywords: 'Keywords' },
        structure: 'title(term1) AND abstract(term2)',
        example: 'title("machine learning") AND abstract("neural networks")',
        filters: ['year', 'article_type', 'topic']
      },
      {
        id: 'springer',
        name: 'SpringerLink',
        url: 'https://link.springer.com',
        description: 'Editorial con amplia cobertura en ingeniería y tecnología',
        hasAPI: true,
        syntax: 'springer',
        operators: { and: 'AND', or: 'OR', not: 'NOT', phrase: '""' },
        fields: { title: 'title', abstract: 'abstract', keywords: 'keyword' },
        structure: 'title:(term1 OR term2) abstract:(term3)',
        example: 'title:(blockchain OR "distributed ledger") abstract:(security)',
        filters: ['year', 'content_type', 'discipline']
      },
      {
        id: 'webofscience',
        name: 'Web of Science',
        url: 'https://www.webofscience.com',
        description: 'Base de datos multidisciplinaria de alto impacto',
        hasAPI: false,
        syntax: 'wos',
        operators: { and: 'AND', or: 'OR', not: 'NOT', phrase: '""', wildcard: '*', proximity: 'NEAR/n' },
        fields: { title: 'TI', abstract: 'AB', keywords: 'AK', topic: 'TS' },
        structure: 'TS=(term1 OR term2) AND TI=(term3)',
        example: 'TS=("artificial intelligence" OR "machine learning") AND TI=(healthcare)',
        filters: ['year', 'document_type', 'research_area']
      },
      {
        id: 'wiley',
        name: 'Wiley Online Library',
        url: 'https://onlinelibrary.wiley.com',
        description: 'Editorial científica con cobertura en ingeniería',
        hasAPI: false,
        syntax: 'wiley',
        operators: { and: 'AND', or: 'OR', not: 'NOT', phrase: '""' },
        fields: { anywhere: 'anywhere', title: 'title', abstract: 'abstract' },
        structure: 'title:(term1) AND abstract:(term2)',
        example: 'title:(IoT OR "Internet of Things") AND abstract:(security)',
        filters: ['year', 'content_type']
      }
    ]
  },

  // 🟥 2. CIENCIAS DE LA SALUD (Medicina, Enfermería, Odontología, Psicología Clínica, Veterinaria)
  'medicina-salud': {
    name: 'Medicina y Ciencias de la Salud',
    icon: '🟥',
    keywords: ['medicina', 'salud', 'clínica', 'paciente', 'tratamiento', 'diagnóstico', 'terapia', 'enfermería', 'odontología', 'farmacia', 'epidemiología', 'enfermedad', 'hospital', 'médico'],
    databases: [
      {
        id: 'pubmed',
        name: 'PubMed / MEDLINE',
        url: 'https://pubmed.ncbi.nlm.nih.gov',
        description: 'Principal base de datos biomédica mundial',
        hasAPI: true,
        syntax: 'pubmed',
        operators: { and: 'AND', or: 'OR', not: 'NOT', phrase: '""' },
        fields: {
          title: '[Title]',
          abstract: '[Title/Abstract]',
          mesh: '[MeSH Terms]',
          author: '[Author]'
        },
        structure: '(term1[Title/Abstract] OR term2[Title/Abstract]) AND term3[MeSH Terms]',
        example: '(diabetes[Title/Abstract] OR "type 2 diabetes"[Title/Abstract]) AND treatment[MeSH Terms]',
        filters: ['year', 'article_type', 'species', 'language']
      },
      {
        id: 'scopus',
        name: 'Scopus',
        url: 'https://www.scopus.com',
        description: 'Base multidisciplinaria con fuerte cobertura en salud',
        hasAPI: true,
        syntax: 'scopus',
        operators: { and: 'AND', or: 'OR', not: 'AND NOT', phrase: '""', wildcard: '*' },
        fields: { title: 'TITLE', abstract: 'ABS', keywords: 'KEY', all: 'TITLE-ABS-KEY' },
        structure: 'TITLE-ABS-KEY((term1 OR term2) AND (term3))',
        example: 'TITLE-ABS-KEY(("telemedicine" OR "telehealth") AND ("chronic disease"))',
        filters: ['year', 'document_type', 'subject_area']
      },
      {
        id: 'webofscience',
        name: 'Web of Science',
        url: 'https://www.webofscience.com',
        description: 'Base multidisciplinaria de alto impacto',
        hasAPI: false,
        syntax: 'wos',
        operators: { and: 'AND', or: 'OR', not: 'NOT', phrase: '""' },
        fields: { title: 'TI', abstract: 'AB', topic: 'TS' },
        structure: 'TS=(term1 OR term2) AND TI=(term3)',
        example: 'TS=("COVID-19" OR "SARS-CoV-2") AND TI=(vaccine)',
        filters: ['year', 'document_type']
      },
      {
        id: 'cinahl',
        name: 'CINAHL',
        url: 'https://www.ebsco.com/products/research-databases/cinahl-database',
        description: 'Base de datos especializada en enfermería y salud aliada',
        hasAPI: false,
        syntax: 'cinahl',
        operators: { and: 'AND', or: 'OR', not: 'NOT', phrase: '""' },
        fields: { title: 'TI', abstract: 'AB', subject: 'SU' },
        structure: 'TI (term1 OR term2) AND AB (term3)',
        example: 'TI ("nursing care" OR "patient care") AND AB (elderly)',
        filters: ['year', 'publication_type', 'age_group']
      },
      {
        id: 'cochrane',
        name: 'Cochrane Library',
        url: 'https://www.cochranelibrary.com',
        description: 'Base de datos de revisiones sistemáticas en salud',
        hasAPI: false,
        syntax: 'cochrane',
        operators: { and: 'AND', or: 'OR', not: 'NOT', phrase: '""' },
        fields: { title: 'ti', abstract: 'ab', keywords: 'kw' },
        structure: '(term1 OR term2):ti,ab,kw AND (term3):ti,ab,kw',
        example: '(hypertension OR "high blood pressure"):ti,ab,kw AND (treatment):ti,ab,kw',
        filters: ['year', 'cochrane_group']
      },
      {
        id: 'embase',
        name: 'Embase',
        url: 'https://www.embase.com',
        description: 'Base de datos biomédica y farmacológica',
        hasAPI: false,
        syntax: 'embase',
        operators: { and: 'AND', or: 'OR', not: 'NOT', phrase: "''" },
        fields: { title: ':ti', abstract: ':ab', subject: ':de' },
        structure: "('term1' OR 'term2'):ti,ab AND 'term3':de",
        example: "('depression' OR 'depressive disorder'):ti,ab AND 'antidepressant':de",
        filters: ['year', 'publication_type', 'drug']
      },
      {
        id: 'sciencedirect',
        name: 'ScienceDirect',
        url: 'https://www.sciencedirect.com',
        description: 'Colección amplia de revistas médicas',
        hasAPI: true,
        syntax: 'sciencedirect',
        operators: { and: 'AND', or: 'OR', not: 'AND NOT', phrase: '""' },
        fields: { title: 'Title', abstract: 'Abstract' },
        structure: 'title(term1) AND abstract(term2)',
        example: 'title("cancer immunotherapy") AND abstract("clinical trial")',
        filters: ['year', 'article_type']
      }
    ]
  },

  // 🟩 3. CIENCIAS SOCIALES (Educación, Sociología, Derecho, Administración, Economía, Psicología)
  'ciencias-sociales': {
    name: 'Ciencias Sociales y Humanidades',
    icon: '🟩',
    keywords: ['educación', 'sociología', 'psicología', 'derecho', 'administración', 'economía', 'política', 'social', 'cultural', 'sociedad', 'comunidad', 'comportamiento'],
    databases: [
      {
        id: 'scopus',
        name: 'Scopus',
        url: 'https://www.scopus.com',
        description: 'Base multidisciplinaria con cobertura en ciencias sociales',
        hasAPI: true,
        syntax: 'scopus',
        operators: { and: 'AND', or: 'OR', not: 'AND NOT', phrase: '""' },
        fields: { title: 'TITLE', abstract: 'ABS', keywords: 'KEY', all: 'TITLE-ABS-KEY' },
        structure: 'TITLE-ABS-KEY((term1 OR term2) AND (term3))',
        example: 'TITLE-ABS-KEY(("education" OR "learning") AND ("technology"))',
        filters: ['year', 'document_type', 'subject_area']
      },
      {
        id: 'webofscience',
        name: 'Web of Science',
        url: 'https://www.webofscience.com',
        description: 'Base multidisciplinaria de alto impacto',
        hasAPI: false,
        syntax: 'wos',
        operators: { and: 'AND', or: 'OR', not: 'NOT', phrase: '""' },
        fields: { title: 'TI', abstract: 'AB', topic: 'TS' },
        structure: 'TS=(term1 OR term2) AND TI=(term3)',
        example: 'TS=("social media" OR "social networks") AND TI=(behavior)',
        filters: ['year', 'document_type', 'research_area']
      },
      {
        id: 'eric',
        name: 'ERIC',
        url: 'https://eric.ed.gov',
        description: 'Base de datos especializada en educación',
        hasAPI: true,
        syntax: 'eric',
        operators: { and: 'AND', or: 'OR', not: 'NOT', phrase: '""' },
        fields: { title: 'title', abstract: 'abstract', descriptor: 'descriptor' },
        structure: 'title:(term1 OR term2) AND abstract:(term3)',
        example: 'title:("online learning" OR "distance education") AND abstract:(effectiveness)',
        filters: ['year', 'publication_type', 'education_level']
      },
      {
        id: 'econlit',
        name: 'EconLit',
        url: 'https://www.aeaweb.org/econlit',
        description: 'Base de datos especializada en economía',
        hasAPI: false,
        syntax: 'econlit',
        operators: { and: 'AND', or: 'OR', not: 'NOT', phrase: '""' },
        fields: { title: 'TI', abstract: 'AB', subject: 'SU' },
        structure: 'TI (term1 OR term2) AND AB (term3)',
        example: 'TI ("monetary policy" OR "fiscal policy") AND AB (inflation)',
        filters: ['year', 'document_type', 'jel_classification']
      },
      {
        id: 'jstor',
        name: 'JSTOR',
        url: 'https://www.jstor.org',
        description: 'Archivo digital de revistas académicas',
        hasAPI: false,
        syntax: 'jstor',
        operators: { and: 'AND', or: 'OR', not: 'NOT', phrase: '""' },
        fields: { title: 'ti', content: 'ab' },
        structure: 'ti:(term1 OR term2) AND ab:(term3)',
        example: 'ti:("social justice" OR "inequality") AND ab:(education)',
        filters: ['year', 'discipline', 'item_type']
      },
      {
        id: 'sage',
        name: 'SAGE Journals',
        url: 'https://journals.sagepub.com',
        description: 'Editorial con fuerte presencia en ciencias sociales',
        hasAPI: false,
        syntax: 'sage',
        operators: { and: 'AND', or: 'OR', not: 'NOT', phrase: '""' },
        fields: { anywhere: 'anywhere', title: 'title', abstract: 'abstract' },
        structure: 'title:(term1) AND abstract:(term2)',
        example: 'title:(migration) AND abstract:("social integration")',
        filters: ['year', 'content_type']
      },
      {
        id: 'psycinfo',
        name: 'PsycINFO',
        url: 'https://www.apa.org/pubs/databases/psycinfo',
        description: 'Base de datos especializada en psicología',
        hasAPI: false,
        syntax: 'psycinfo',
        operators: { and: 'AND', or: 'OR', not: 'NOT', phrase: '""' },
        fields: { title: 'TI', abstract: 'AB', descriptor: 'DE' },
        structure: 'TI (term1 OR term2) AND AB (term3)',
        example: 'TI ("cognitive therapy" OR "CBT") AND AB (depression)',
        filters: ['year', 'publication_type', 'age_group', 'methodology']
      },
      {
        id: 'sciencedirect',
        name: 'ScienceDirect',
        url: 'https://www.sciencedirect.com',
        description: 'Colección con sección de ciencias sociales',
        hasAPI: true,
        syntax: 'sciencedirect',
        operators: { and: 'AND', or: 'OR', not: 'AND NOT', phrase: '""' },
        fields: { title: 'Title', abstract: 'Abstract' },
        structure: 'title(term1) AND abstract(term2)',
        example: 'title("organizational behavior") AND abstract:(leadership)',
        filters: ['year', 'article_type']
      }
    ]
  },

  // 🟪 4. ARQUITECTURA, CONSTRUCCIÓN, DISEÑO Y URBANISMO
  'arquitectura-diseño': {
    name: 'Arquitectura, Diseño y Urbanismo',
    icon: '🟪',
    keywords: ['arquitectura', 'construcción', 'diseño', 'urbanismo', 'edificación', 'planeación', 'urbano', 'ciudad', 'espacio', 'estructura', 'proyecto'],
    databases: [
      {
        id: 'scopus',
        name: 'Scopus',
        url: 'https://www.scopus.com',
        description: 'Base multidisciplinaria',
        hasAPI: true,
        syntax: 'scopus',
        operators: { and: 'AND', or: 'OR', not: 'AND NOT', phrase: '""' },
        fields: { title: 'TITLE', abstract: 'ABS', keywords: 'KEY', all: 'TITLE-ABS-KEY' },
        structure: 'TITLE-ABS-KEY((term1 OR term2) AND (term3))',
        example: 'TITLE-ABS-KEY(("sustainable architecture" OR "green building") AND (design))',
        filters: ['year', 'document_type']
      },
      {
        id: 'webofscience',
        name: 'Web of Science',
        url: 'https://www.webofscience.com',
        description: 'Base multidisciplinaria',
        hasAPI: false,
        syntax: 'wos',
        operators: { and: 'AND', or: 'OR', not: 'NOT', phrase: '""' },
        fields: { title: 'TI', abstract: 'AB', topic: 'TS' },
        structure: 'TS=(term1 OR term2) AND TI=(term3)',
        example: 'TS=("urban planning" OR "city planning") AND TI=(sustainability)',
        filters: ['year', 'document_type']
      },
      {
        id: 'avery',
        name: 'Avery Index',
        url: 'https://www.proquest.com/avery',
        description: 'Índice especializado en arquitectura',
        hasAPI: false,
        syntax: 'avery',
        operators: { and: 'AND', or: 'OR', not: 'NOT', phrase: '""' },
        fields: { anywhere: 'anywhere', subject: 'SU' },
        structure: 'SU(term1 OR term2) AND anywhere(term3)',
        example: 'SU("architectural design" OR "building design") AND anywhere(residential)',
        filters: ['year', 'document_type']
      },
      {
        id: 'sciencedirect',
        name: 'ScienceDirect',
        url: 'https://www.sciencedirect.com',
        description: 'Sección de arquitectura y construcción',
        hasAPI: true,
        syntax: 'sciencedirect',
        operators: { and: 'AND', or: 'OR', not: 'AND NOT', phrase: '""' },
        fields: { title: 'Title', abstract: 'Abstract' },
        structure: 'title(term1) AND abstract(term2)',
        example: 'title("construction management") AND abstract:(BIM)',
        filters: ['year', 'article_type']
      },
      {
        id: 'springer',
        name: 'SpringerLink',
        url: 'https://link.springer.com',
        description: 'Editorial con cobertura en arquitectura',
        hasAPI: true,
        syntax: 'springer',
        operators: { and: 'AND', or: 'OR', not: 'NOT', phrase: '""' },
        fields: { title: 'title', abstract: 'abstract' },
        structure: 'title:(term1) abstract:(term2)',
        example: 'title:(parametric OR "parametric design") abstract:(architecture)',
        filters: ['year', 'content_type']
      },
      {
        id: 'taylor',
        name: 'Taylor & Francis',
        url: 'https://www.tandfonline.com',
        description: 'Editorial con revistas de arquitectura',
        hasAPI: false,
        syntax: 'taylor',
        operators: { and: 'AND', or: 'OR', not: 'NOT', phrase: '""' },
        fields: { anywhere: 'anywhere', title: 'title', abstract: 'abstract' },
        structure: 'title:(term1) AND abstract:(term2)',
        example: 'title:("urban design") AND abstract:(public space)',
        filters: ['year', 'content_type']
      }
    ]
  }
};

/**
 * Detecta el área de investigación basada en palabras clave
 */
function detectResearchArea(selectedArea, description = '') {
  // Si el usuario ya seleccionó un área, usarla
  if (selectedArea && ACADEMIC_DATABASES[selectedArea]) {
    return selectedArea;
  }

  // Si no hay área seleccionada, intentar detectar por descripción
  const lowerDesc = description.toLowerCase();
  
  for (const [areaKey, areaData] of Object.entries(ACADEMIC_DATABASES)) {
    const matchCount = areaData.keywords.filter(keyword => 
      lowerDesc.includes(keyword.toLowerCase())
    ).length;
    
    if (matchCount >= 2) { // Si coinciden al menos 2 palabras clave
      return areaKey;
    }
  }

  // Por defecto, retornar ingeniería-tecnología
  return 'ingenieria-tecnologia';
}

/**
 * Obtiene las bases de datos disponibles para un área específica
 */
function getDatabasesByArea(area) {
  const areaData = ACADEMIC_DATABASES[area];
  if (!areaData) {
    console.warn(`Área no encontrada: ${area}, usando ingeniería por defecto`);
    return ACADEMIC_DATABASES['ingenieria-tecnologia'].databases;
  }
  return areaData.databases;
}

/**
 * Obtiene la configuración de una base de datos específica
 */
function getDatabaseConfig(databaseId, area = null) {
  if (area && ACADEMIC_DATABASES[area]) {
    const db = ACADEMIC_DATABASES[area].databases.find(d => d.id === databaseId);
    if (db) return db;
  }

  // Buscar en todas las áreas
  for (const areaData of Object.values(ACADEMIC_DATABASES)) {
    const db = areaData.databases.find(d => d.id === databaseId);
    if (db) return db;
  }

  return null;
}

/**
 * Obtiene todas las áreas disponibles
 */
function getAllAreas() {
  return Object.entries(ACADEMIC_DATABASES).map(([key, data]) => ({
    key,
    name: data.name,
    icon: data.icon,
    databaseCount: data.databases.length,
    databases: data.databases.map(db => ({
      id: db.id,
      name: db.name,
      hasAPI: db.hasAPI
    }))
  }));
}

module.exports = {
  ACADEMIC_DATABASES,
  detectResearchArea,
  getDatabasesByArea,
  getDatabaseConfig,
  getAllAreas
};
