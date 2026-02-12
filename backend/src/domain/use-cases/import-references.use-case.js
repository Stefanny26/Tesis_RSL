/**
 * Caso de uso: Importar referencias desde archivos
 * Versión simplificada - parsea formatos básicos
 */
class ImportReferencesUseCase {
  constructor({ referenceRepository }) {
    this.referenceRepository = referenceRepository;
  }

  /**
   * Detecta la base de datos de origen desde el nombre del archivo o metadatos
   * @param {string} filename - Nombre del archivo
   * @param {Object} ref - Objeto de referencia parseado
   * @returns {string} - Nombre de la base de datos
   */
  detectDatabaseSource(filename, ref = {}) {
    const lowerFilename = filename.toLowerCase();
    
    // Detección por nombre de archivo
    if (lowerFilename.includes('ieee')) return 'IEEE Xplore';
    if (lowerFilename.includes('scopus')) return 'Scopus';
    if (lowerFilename.includes('acm')) return 'ACM Digital Library';
    if (lowerFilename.includes('pubmed') || lowerFilename.includes('.nb ib')) return 'PubMed';
    if (lowerFilename.includes('wos') || lowerFilename.includes('webofscience') || lowerFilename.endsWith('.ciw')) return 'Web of Science';
    if (lowerFilename.includes('springer')) return 'Springer';
    if (lowerFilename.includes('sciencedirect') || lowerFilename.includes('elsevier')) return 'ScienceDirect';
    if (lowerFilename.includes('arxiv')) return 'arXiv';
    
    // Detección por metadatos de la referencia (para CSV normalizado)
    if (ref.database) return ref.database;
    
    // Detección por identificadores únicos
    if (ref.externalId) {
      const id = String(ref.externalId).toLowerCase();
      if (id.startsWith('2-s2.0-')) return 'Scopus'; // Scopus EID format
      if (id.match(/^\d{8}$/)) return 'PubMed'; // PMID format
      if (id.startsWith('wos:')) return 'Web of Science';
      if (id.length === 7 && !isNaN(id)) return 'IEEE Xplore'; // IEEE Document ID
    }
    
    // Detección por formato de DOI o estructuras específicas
    if (ref.doi && ref.doi.includes('10.1109')) return 'IEEE Xplore';
    if (ref.doi && ref.doi.includes('10.1145')) return 'ACM Digital Library';
    if (ref.doi && ref.doi.includes('10.1007')) return 'Springer';
    if (ref.doi && ref.doi.includes('101016')) return 'ScienceDirect';
    
    // Por defecto
    return null;
  }

  /**
   * Ejecuta la importación de referencias
   * @param {string} projectId - ID del proyecto
   * @param {Array} files - Archivos subidos (req.files)
   * @returns {Promise<Object>} - Resultado de la importación
   */
  async execute(projectId, files) {
    console.log('ImportReferencesUseCase.execute()');
    console.log('   Project ID:', projectId);
    console.log('   Archivos:', files.length);
    
    if (!files || files.length === 0) {
      throw new Error('No se proporcionaron archivos para importar');
    }

    const results = {
      success: 0,
      failed: 0,
      duplicates: 0,
      references: [],
      errors: [],
      bySource: {} // Nuevo: estadísticas por base de datos
    };

    for (const file of files) {
      try {
        const fileExtension = file.originalname.split('.').pop().toLowerCase();
        console.log(`Procesando archivo: ${file.originalname}`);
        console.log(`   Extensión: ${fileExtension}`);
        console.log(`   Tamaño: ${file.buffer ? file.buffer.length : 0} bytes`);
        
        const content = file.buffer.toString('utf-8');
        console.log(`   Primeros 200 caracteres:`, content.substring(0, 200));
        
        let parsedReferences = [];

        try {
          // Parsear según el tipo de archivo
          if (fileExtension === 'csv') {
            console.log('Parseando como CSV...');
            parsedReferences = this.parseCSV(content);
          } else if (fileExtension === 'json') {
            console.log('Parseando como JSON...');
            parsedReferences = JSON.parse(content);
          } else if (fileExtension === 'ris' || fileExtension === 'txt') {
            console.log('Parseando como RIS...');
            parsedReferences = this.parseRIS(content);
          } else if (fileExtension === 'bib') {
            console.log('Parseando como BibTeX...');
            parsedReferences = this.parseBibTeX(content);
          } else if (fileExtension === 'nbib') {
            console.log('Parseando como PubMed (nbib)...');
            parsedReferences = this.parseRIS(content); // nbib usa formato similar a RIS
          } else if (fileExtension === 'ciw') {
            console.log('Parseando como Web of Science (ciw)...');
            parsedReferences = this.parseRIS(content); // ciw usa formato similar a RIS
          } else {
            console.log(`Formato no soportado: ${fileExtension}`);
            throw new Error(`Formato de archivo no soportado: ${fileExtension}. Formatos soportados: CSV, JSON, RIS, BibTeX, nbib, ciw.`);
          }
        } catch (parseError) {
          console.error(`Error parseando archivo ${file.originalname}:`, parseError);
          throw new Error(`Error al procesar el archivo ${file.originalname}: ${parseError.message}. Verifica que el archivo tenga el formato correcto y no esté corrupto.`);
        }
        
        console.log(`Parseadas ${parsedReferences.length} referencias del archivo`);

        // Detectar la fuente del archivo para estadísticas
        const fileSource = this.detectDatabaseSource(file.originalname, parsedReferences[0] || {});
        if (!results.bySource[fileSource]) {
          results.bySource[fileSource] = {
            fileName: file.originalname,
            parsed: 0,
            imported: 0,
            duplicates: 0
          };
        }
        results.bySource[fileSource].parsed = parsedReferences.length;

        // Guardar referencias en la base de datos
        console.log(`Guardando ${parsedReferences.length} referencias en BD...`);
        
        for (const refData of parsedReferences) {
          try {
            console.log(`   Procesando: ${refData.title || 'Sin título'}`);
            
            // Verificar si ya existe (por DOI o título)
            const existing = refData.doi || refData.title ? 
              await this.referenceRepository.findByDoiOrTitle(
                projectId,
                refData.doi,
                refData.title
              ) : null;

            if (existing) {
              console.log(`   Duplicado: ${refData.title}`);
              results.duplicates++;
              results.bySource[fileSource].duplicates++;
              continue;
            }

            // Crear la referencia
            console.log(`   Insertando en BD...`);
            
            // Detectar database source
            const detectedSource = this.detectDatabaseSource(file.originalname, refData);
            console.log(`   Detected source: ${detectedSource || 'Unknown'}`);
            
            const reference = await this.referenceRepository.create({
              ...refData,
              projectId: projectId,
              source: detectedSource || refData.database || refData.source || null,  // Map database → source
              screeningStatus: refData.screeningStatus || 'pending',
              importedFrom: file.originalname,
              importedAt: new Date()
            });

            console.log(`   Insertado ID: ${reference.id}`);
            results.references.push(reference);
            results.success++;
            results.bySource[fileSource].imported++;
          } catch (error) {
            console.log(`   Error insertando: ${error.message}`);
            results.failed++;
            results.errors.push({
              title: refData.title || 'Unknown',
              error: error.message
            });
          }
        }
      } catch (error) {
        results.errors.push({
          file: file.originalname,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Parser mejorado de CSV que maneja comillas y campos complejos
   */
  parseCSV(content) {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    // Parser de CSV que maneja comillas correctamente
    const parseCSVLine = (line) => {
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];
        
        if (char === '"') {
          if (inQuotes && nextChar === '"') {
            // Comilla escapada ""
            current += '"';
            i++; // Saltar la siguiente comilla
          } else {
            // Toggle estado de comillas
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          // Fin de campo
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      
      // Agregar el último campo
      values.push(current.trim());
      
      return values;
    };

    // Parsear headers
    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
    console.log('Headers detectados:', headers);
    
    const references = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      
      // Crear objeto de referencia mapeando los headers a campos estándar
      // IMPORTANTE: Normalizar headers a minúsculas para comparación case-insensitive
      const rawRef = {};
      headers.forEach((header, index) => {
        const normalizedHeader = header.toLowerCase().trim();
        rawRef[normalizedHeader] = values[index] || '';
      });
      
      // Mapear campos comunes a nombres estándar
      const ref = this.normalizeCSVFields(rawRef);
      
      // Solo agregar si tiene al menos título
      if (ref.title && ref.title.trim().length > 0) {
        references.push(ref);
      } else {
        console.warn(`Fila ${i + 1}: Sin título válido, saltando...`);
      }
    }

    return references;
  }

  /**
   * Normaliza los campos del CSV a nombres estándar
   * Soporta formatos de: Scopus, IEEE Xplore, Web of Science, PubMed, ACM, SpringerLink, ScienceDirect, etc.
   */
  normalizeCSVFields(rawRef) {
    const normalized = {
      title: '',
      abstract: '',
      authors: [],
      year: null,
      journal: '',
      doi: '',
      keywords: [],
      database: 'CSV Import',
      externalId: null,
      url: '',
      citationCount: 0
    };

    // ============ TITLE ============
    // Mapear Title (muchas variaciones de diferentes bases de datos)
    const titleFields = [
      'title', 
      'article title', 
      'document title',      // IEEE Xplore
      'item title', 
      'publication title',   // Generalmente es el journal, pero a veces es título
      'article name',
      'paper title',
      'ti',                  // RIS format
      'bt'                   // Book title en RIS
    ];
    for (const field of titleFields) {
      if (rawRef[field] && rawRef[field].trim() && rawRef[field].trim() !== '') {
        normalized.title = rawRef[field].trim();
        break;
      }
    }

    // ============ ABSTRACT ============
    const abstractFields = [
      'abstract', 
      'summary', 
      'description',
      'ab',                  // RIS format
      'abstract note'
    ];
    for (const field of abstractFields) {
      if (rawRef[field] && rawRef[field].trim()) {
        normalized.abstract = rawRef[field].trim();
        break;
      }
    }

    // ============ AUTHORS ============
    const authorFields = [
      'authors',             // IEEE Xplore, Scopus
      'author', 
      'author names', 
      'creators',
      'au',                  // RIS format
      'a1',
      'author full names',
      'inventor'             // Para patentes
    ];
    for (const field of authorFields) {
      if (rawRef[field] && rawRef[field].trim()) {
        const authorStr = rawRef[field].trim();
        // Detectar separadores: ; para IEEE/Scopus, , para otros
        if (authorStr.includes(';')) {
          normalized.authors = authorStr.split(';').map(a => a.trim()).filter(a => a);
        } else if (authorStr.includes('|')) {
          normalized.authors = authorStr.split('|').map(a => a.trim()).filter(a => a);
        } else {
          // Intentar detectar si hay varios autores por patrón "Apellido, Nombre"
          const parts = authorStr.split(',');
          if (parts.length > 2) {
            // Probablemente formato "Apellido1, Nombre1, Apellido2, Nombre2"
            normalized.authors = [];
            for (let i = 0; i < parts.length; i += 2) {
              if (parts[i] && parts[i + 1]) {
                normalized.authors.push(`${parts[i].trim()}, ${parts[i + 1].trim()}`);
              }
            }
          } else {
            normalized.authors = [authorStr];
          }
        }
        break;
      }
    }

    // ============ YEAR ============
    const yearFields = [
      'year', 
      'publication year',    // IEEE Xplore, Scopus
      'date', 
      'year published',
      'py',                  // RIS format
      'yr',
      'date added to xplore',
      'online date',
      'issue date',
      'cover date'
    ];
    for (const field of yearFields) {
      if (rawRef[field]) {
        const yearMatch = String(rawRef[field]).match(/\d{4}/);
        if (yearMatch) {
          normalized.year = parseInt(yearMatch[0]);
          break;
        }
      }
    }

    // ============ JOURNAL/SOURCE ============
    const journalFields = [
      'publication title',   // IEEE Xplore - nombre de conferencia/journal
      'journal', 
      'source', 
      'publication name', 
      'source title',
      'journal title',
      'jo',                  // RIS format
      'jf',                  // Full journal name
      'ja',                  // Abbreviated journal
      'booktitle',
      'proceedings'
    ];
    for (const field of journalFields) {
      if (rawRef[field] && rawRef[field].trim()) {
        normalized.journal = rawRef[field].trim();
        break;
      }
    }

    // ============ DOI ============
    const doiFields = [
      'doi',                 // Todos
      'digital object identifier',
      'do'                   // RIS format
    ];
    for (const field of doiFields) {
      if (rawRef[field] && rawRef[field].trim()) {
        let doi = rawRef[field].trim();
        // Limpiar URL si viene con https://doi.org/
        doi = doi.replace('https://doi.org/', '').replace('http://dx.doi.org/', '');
        normalized.doi = doi;
        break;
      }
    }

    // ============ KEYWORDS ============
    const keywordFields = [
      'author keywords',     // IEEE Xplore, Scopus
      'keywords', 
      'index terms',
      'ieee terms',          // IEEE Xplore
      'mesh_terms',          // PubMed
      'kw',                  // RIS format
      'subject',
      'descriptors'
    ];
    for (const field of keywordFields) {
      if (rawRef[field] && rawRef[field].trim()) {
        const keywordStr = rawRef[field].trim();
        if (keywordStr.includes(';')) {
          normalized.keywords = keywordStr.split(';').map(k => k.trim()).filter(k => k);
        } else if (keywordStr.includes('|')) {
          normalized.keywords = keywordStr.split('|').map(k => k.trim()).filter(k => k);
        } else {
          normalized.keywords = keywordStr.split(',').map(k => k.trim()).filter(k => k);
        }
        break;
      }
    }

    // ============ EXTERNAL ID ============
    const idFields = [
      'eid',                 // Scopus EID
      'scopus id', 
      'pubmed id',
      'pmid',
      'wos id',
      'accession number',
      'document identifier', // IEEE Xplore
      'id',
      'an'                   // RIS format
    ];
    for (const field of idFields) {
      if (rawRef[field] && rawRef[field].trim()) {
        normalized.externalId = rawRef[field].trim();
        break;
      }
    }

    // ============ URL ============
    const urlFields = [
      'url',
      'pdf link',            // IEEE Xplore
      'link',
      'ur',                  // RIS format
      'article url',
      'online link'
    ];
    for (const field of urlFields) {
      if (rawRef[field] && rawRef[field].trim()) {
        normalized.url = rawRef[field].trim();
        break;
      }
    }

    // ============ CITATION COUNT ============
    const citationFields = [
      'article citation count', // IEEE Xplore
      'times cited',            // Web of Science
      'cited by',               // Scopus
      'citations',
      'citation count'
    ];
    for (const field of citationFields) {
      if (rawRef[field]) {
        const count = parseInt(rawRef[field]);
        if (!isNaN(count)) {
          normalized.citationCount = count;
          break;
        }
      }
    }

    // ============ DATABASE SOURCE ============
    // Detectar automáticamente la base de datos por los campos presentes
    if (rawRef['document identifier'] || rawRef['ieee terms']) {
      normalized.database = 'IEEE Xplore';
    } else if (rawRef['eid'] || rawRef['scopus id']) {
      normalized.database = 'Scopus';
    } else if (rawRef['pmid'] || rawRef['mesh_terms']) {
      normalized.database = 'PubMed';
    } else if (rawRef['wos id'] || rawRef['times cited']) {
      normalized.database = 'Web of Science';
    } else if (rawRef['database']) {
      normalized.database = rawRef['database'].trim();
    } else if (rawRef['source database']) {
      normalized.database = rawRef['source database'].trim();
    }

    return normalized;
  }

  /**
   * Parser simple de RIS (Research Information Systems)
   * Formato usado por EndNote, RefWorks, Mendeley, Zotero, etc.
   * También compatible con nbib (PubMed) y ciw (Web of Science)
   */
  parseRIS(content) {
    console.log('parseRIS: Iniciando parsing...');
    console.log('parseRIS: Contenido length:', content.length);
    console.log('parseRIS: Primeros 500 caracteres:', content.substring(0, 500));
    
    const references = [];
    
    // Normalizar saltos de línea (algunos archivos usan \r\n, otros \n)
    const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Split by ER tag (end of record) - MUY flexible con variaciones
    // Soporta: "ER  -", "ER-", "ER -", "ER  - \n\n", etc.
    // IEEE usa: "ER  - \n\n\n" (dos espacios, guion, espacios, múltiples saltos)
    const records = normalizedContent.split(/\nER\s+-?\s*\n/).filter(r => r.trim());
    console.log(`parseRIS: Encontrados ${records.length} registros`);

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      console.log(`\nparseRIS: Procesando registro ${i + 1}/${records.length}`);
      console.log(`parseRIS: Primeras 200 caracteres del registro:`, record.substring(0, 200));
      
      const lines = record.split('\n');
      const ref = {
        title: '',
        authors: [],
        year: null,
        journal: '',
        volume: '',
        issue: '',
        pages: '',
        doi: '',
        abstract: '',
        keywords: [],
        url: '',
        type: 'article',
        database: null,  // Add database field
        externalId: null  // Add externalId field
      };

      let currentTag = null;
      let currentValue = '';

      for (const line of lines) {
        // Regex MUY flexible: permite múltiples espacios antes y después del guion
        // Soporta: "TY  - JOUR", "TY - JOUR", "TY- JOUR", "TY-JOUR", "TYJOUR"
        const match = line.match(/^([A-Z0-9]{2})\s*-?\s*(.*)$/);
        
        if (match) {
          // Procesar el tag anterior si existía
          if (currentTag && currentValue) {
            this.processRISTag(ref, currentTag, currentValue.trim());
          }
          
          // Nueva tag
          const [, tag, value] = match;
          currentTag = tag;
          currentValue = value;
        } else if (currentTag && line.trim()) {
          // Continuación de valor multi-línea
          currentValue += ' ' + line.trim();
        }
      }

      // Procesar el último tag
      if (currentTag && currentValue) {
        this.processRISTag(ref, currentTag, currentValue.trim());
      }

      // Solo agregar si tiene al menos título
      if (ref.title) {
        console.log(`parseRIS: ✓ Registro válido - Título: ${ref.title.substring(0, 60)}...`);
        references.push({
          ...ref,
          authors: ref.authors.join('; '),
          keywords: ref.keywords.join('; ')
        });
      } else {
        console.log(`parseRIS: ✗ Registro descartado - Sin título`);
        console.log(`parseRIS: Contenido del registro:`, JSON.stringify(ref, null, 2));
      }
    }

    console.log(`parseRIS: Total referencias parseadas: ${references.length}`);
    return references;
  }

  /**
   * Procesa un tag RIS y actualiza el objeto de referencia
   */
  processRISTag(ref, tag, value) {
    const cleanValue = value.trim();
    if (!cleanValue) return;

    switch (tag) {
      case 'TI': // Title
      case 'T1':
      case 'CT': // Title (algunos formatos)
        if (!ref.title) ref.title = cleanValue;
        break;
      case 'AU': // Author
      case 'A1':
      case 'A2': // Secondary author
        ref.authors.push(cleanValue);
        break;
      case 'PY': // Publication Year
      case 'Y1':
        const year = parseInt(cleanValue);
        if (!isNaN(year) && year > 1900 && year < 2100) {
          ref.year = year;
        }
        break;
      case 'JO': // Journal (full)
      case 'JF': // Journal (full)
      case 'JA': // Journal (abbreviated)
      case 'T2': // Secondary title (often journal for articles)
        if (!ref.journal) ref.journal = cleanValue;
        break;
      case 'VL': // Volume
      case 'VO': // Volume (alternate)
        ref.volume = cleanValue;
        break;
      case 'IS': // Issue
        ref.issue = cleanValue;
        break;
      case 'SP': // Start Page
        ref.pages = cleanValue;
        break;
      case 'EP': // End Page
        if (ref.pages) ref.pages += `-${cleanValue}`;
        else ref.pages = cleanValue;
        break;
      case 'DO': // DOI
        ref.doi = cleanValue;
        break;
      case 'AB': // Abstract
      case 'N2': // Abstract (alternate)
        if (!ref.abstract) ref.abstract = cleanValue;
        break;
      case 'KW': // Keywords
        ref.keywords.push(cleanValue);
        break;
      case 'UR': // URL
      case 'L1': // PDF Link
      case 'L2': // Full text link
      case 'L3': // Related records link
        if (!ref.url) ref.url = cleanValue;
        break;
      case 'TY': // Type of reference
        ref.type = this.mapRISType(cleanValue);
        break;
      case 'DB': // Database name
        ref.database = cleanValue;
        break;
      case 'AN': // Accession Number / External ID
      case 'ID': // Reference ID
        if (!ref.externalId) ref.externalId = cleanValue;
        break;
      case 'SN': // ISSN
      case 'BN': // ISBN
        // Podríamos agregar estos campos si los necesitamos
        break;
      case 'M3': // Type of work (for Scopus)
      case 'N1': // Notes (puede contener información adicional en Scopus)
        // Ignorar por ahora, pero reconocer
        break;
    }
  }

  /**
   * Mapea tipos RIS a tipos internos
   */
  mapRISType(risType) {
    const typeMap = {
      'JOUR': 'article',
      'CONF': 'conference',
      'BOOK': 'book',
      'CHAP': 'chapter',
      'THES': 'thesis',
      'RPRT': 'report',
      'GEN': 'generic'
    };
    return typeMap[risType] || 'article';
  }

  /**
   * Parser simple de BibTeX
   * Formato usado por LaTeX, BibDesk, JabRef, etc.
   */
  parseBibTeX(content) {
    console.log('parseBibTeX: Iniciando parsing...');
    console.log('parseBibTeX: Contenido length:', content.length);
    console.log('parseBibTeX: Primeros 500 caracteres:', content.substring(0, 500));
    
    const references = [];
    
    // Normalizar: separar entradas pegadas y limpiar
    let normalizedContent = content
      .replace(/\}@/g, '}\n\n@')  // Separar entradas pegadas
      .replace(/\r\n/g, '\n')      // Normalizar saltos de línea
      .replace(/\r/g, '\n');
    
    // Encontrar todas las entradas @TYPE{...}
    // Usar regex que busca desde @ hasta } balanceado
    const entryPattern = /@(\w+)\s*\{([^@]*?)(?=\n@|\n*$)/gs;
    const matches = [...normalizedContent.matchAll(entryPattern)];
    
    console.log(`parseBibTeX: Encontradas ${matches.length} entradas`);
    
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const type = match[1];
      let entryContent = match[2];
      
      console.log(`\nparseBibTeX: Procesando entrada ${i + 1}/${matches.length} - Tipo: ${type}`);
      console.log(`parseBibTeX: Primeros 200 caracteres:`, entryContent.substring(0, 200));
      
      // Extraer citation key (primer valor después de la llave)
      const keyMatch = entryContent.match(/^\s*([^,\s]+)\s*,/);
      if (!keyMatch) {
        console.log(`parseBibTeX: No se pudo extraer citation key`);
        continue;
      }
      
      const citationKey = keyMatch[1];
      console.log(`parseBibTeX: Citation Key: ${citationKey}`);
      
      // Remover el citation key del contenido para procesar solo los campos
      entryContent = entryContent.substring(keyMatch[0].length);
      
      const ref = {
        type: this.mapBibTeXType(type.toLowerCase()),
        citationKey: citationKey.trim(),
        title: '',
        authors: '',
        year: null,
        journal: '',
        volume: '',
        issue: '',
        pages: '',
        doi: '',
        abstract: '',
        keywords: '',
        url: '',
        database: null,
        externalId: null
      };

      // Parsear campos
      const fields = this.extractBibTeXFields(entryContent);
      console.log(`parseBibTeX: Extraídos ${Object.keys(fields).length} campos`);
      
      for (const [key, value] of Object.entries(fields)) {
        const cleanValue = value.trim();
        
        switch (key.toLowerCase()) {
          case 'title':
            ref.title = cleanValue;
            break;
          case 'author':
            // Reemplazar 'and' por '; ' para separar autores
            ref.authors = cleanValue.replace(/ and /g, '; ');
            break;
          case 'year':
            const year = parseInt(cleanValue);
            if (!isNaN(year) && year > 1900 && year < 2100) {
              ref.year = year;
            }
            break;
          case 'journal':
          case 'booktitle':
            if (!ref.journal) ref.journal = cleanValue;
            break;
          case 'volume':
            ref.volume = cleanValue;
            break;
          case 'number':
          case 'issue':
            ref.issue = cleanValue;
            break;
          case 'pages':
            ref.pages = cleanValue;
            break;
          case 'doi':
            ref.doi = cleanValue;
            break;
          case 'abstract':
            ref.abstract = cleanValue;
            break;
          case 'keywords':
            ref.keywords = cleanValue;
            break;
          case 'url':
          case 'link':
            if (!ref.url) ref.url = cleanValue;
            break;
          case 'database':
          case 'source':
            ref.database = cleanValue;
            break;
          case 'eprint':
          case 'id':
          case 'articleid':
            if (!ref.externalId) ref.externalId = cleanValue;
            break;
          case 'issn':
          case 'isbn':
          case 'month':
            // Ignorar por ahora
            break;
        }
      }

      // Solo agregar si tiene título
      if (ref.title) {
        console.log(`parseBibTeX: ✓ Entrada válida - Título: ${ref.title.substring(0, 60)}...`);
        references.push(ref);
      } else {
        console.log(`parseBibTeX: ✗ Entrada descartada - Sin título`);
        console.log(`parseBibTeX: Campos extraídos:`, Object.keys(fields));
      }
    }

    console.log(`parseBibTeX: Total referencias parseadas: ${references.length}`);
    return references;
  }

  /**
   * Extrae campos de una entrada BibTeX manejando llaves balanceadas
   */
  extractBibTeXFields(content) {
    const fields = {};
    
    // Limpiar: quitar llaves finales de la entrada y espacios
    content = content.trim();
    if (content.endsWith('}')) {
      content = content.substring(0, content.length - 1);
    }
    
    // Buscar campos: key = {value} o key = "value" o key = value
    let pos = 0;
    while (pos < content.length) {
      // Buscar nombre del campo
      const keyMatch = content.substring(pos).match(/^\s*(\w+)\s*=/);
      if (!keyMatch) {
        // Si no hay más campos, salir
        break;
      }
      
      const key = keyMatch[1];
      pos += keyMatch[0].length;
      
      // Saltar espacios después del =
      while (pos < content.length && /\s/.test(content[pos])) pos++;
      
      if (pos >= content.length) break;
      
      // Extraer valor según el delimitador
      let value = '';
      const delimiter = content[pos];
      
      if (delimiter === '{') {
        // Manejar llaves balanceadas
        let braceCount = 1;
        pos++; // Saltar la llave de apertura
        let start = pos;
        
        while (pos < content.length && braceCount > 0) {
          if (content[pos] === '\\' && pos + 1 < content.length) {
            // Saltar secuencias de escape
            pos += 2;
            continue;
          }
          if (content[pos] === '{') braceCount++;
          else if (content[pos] === '}') braceCount--;
          if (braceCount > 0) pos++;
        }
        
        value = content.substring(start, pos);
        pos++; // Saltar la llave de cierre
      } else if (delimiter === '"') {
        // Manejar comillas
        pos++; // Saltar la comilla de apertura
        let start = pos;
        
        while (pos < content.length && content[pos] !== '"') {
          if (content[pos] === '\\' && pos + 1 < content.length) {
            pos += 2; // Saltar caracteres escapados
            continue;
          }
          pos++;
        }
        
        value = content.substring(start, pos);
        if (pos < content.length) pos++; // Saltar la comilla de cierre
      } else {
        // Valor sin delimitadores (número o texto simple)
        let start = pos;
        while (pos < content.length && content[pos] !== ',' && content[pos] !== '}' && content[pos] !== '\n') {
          pos++;
        }
        value = content.substring(start, pos).trim();
      }
      
      // Solo agregar si el valor no está vacío
      if (value.trim()) {
        fields[key] = value;
      }
      
      // Saltar la coma y espacios si existen
      while (pos < content.length && (content[pos] === ',' || /\s/.test(content[pos]))) {
        pos++;
      }
    }
    
    return fields;
  }

  /**
   * Mapea tipos BibTeX a tipos internos
   */
  mapBibTeXType(bibType) {
    const typeMap = {
      'article': 'article',
      'inproceedings': 'conference',
      'conference': 'conference',
      'book': 'book',
      'incollection': 'chapter',
      'phdthesis': 'thesis',
      'mastersthesis': 'thesis',
      'techreport': 'report',
      'misc': 'generic'
    };
    return typeMap[bibType] || 'article';
  }
}

module.exports = ImportReferencesUseCase;

