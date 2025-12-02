const axios = require('axios');

/**
 * Use Case: Búsqueda en Scopus
 * 
 * Integración con la API de Scopus para búsqueda de literatura académica.
 * Permite buscar, contar y validar conexión con Scopus.
 */
class ScopusSearchUseCase {
  constructor(referenceRepository) {
    this.referenceRepository = referenceRepository;
    this.baseUrl = 'https://api.elsevier.com/content/search/scopus';
    this.defaultApiKey = process.env.SCOPUS_API_KEY;
  }

  /**
   * Valida la conexión con Scopus
   */
  async validateConnection(apiKey = this.defaultApiKey) {
    try {
      console.log('🔍 Validando conexión con Scopus...');

      if (!apiKey) {
        throw new Error('API Key de Scopus no proporcionada');
      }

      // Hacer una búsqueda simple para validar
      const response = await axios.get(this.baseUrl, {
        params: {
          query: 'TITLE("systematic review")',
          count: 1
        },
        headers: {
          'X-ELS-APIKey': apiKey,
          'Accept': 'application/json'
        },
        timeout: 10000
      });

      const totalResults = parseInt(response.data['search-results']['opensearch:totalResults']) || 0;

      console.log('✅ Conexión con Scopus validada');

      return {
        success: true,
        connected: true,
        totalResults,
        message: 'Conexión exitosa con Scopus'
      };

    } catch (error) {
      console.error('❌ Error validando conexión con Scopus:', error.message);
      
      return {
        success: false,
        connected: false,
        error: error.response?.data?.message || error.message,
        statusCode: error.response?.status
      };
    }
  }

  /**
   * Cuenta el número de resultados para una query
   */
  async count({ query, apiKey = this.defaultApiKey }) {
    try {
      console.log('🔢 Contando resultados en Scopus...');

      if (!apiKey) {
        throw new Error('API Key de Scopus no proporcionada');
      }

      const response = await axios.get(this.baseUrl, {
        params: {
          query,
          count: 0 // Solo queremos el total, no los resultados
        },
        headers: {
          'X-ELS-APIKey': apiKey,
          'Accept': 'application/json'
        },
        timeout: 10000
      });

      const totalResults = parseInt(response.data['search-results']['opensearch:totalResults']) || 0;

      console.log(`✅ Encontrados ${totalResults} resultados`);

      return {
        success: true,
        total: totalResults,
        query
      };

    } catch (error) {
      console.error('❌ Error contando resultados:', error.message);
      throw new Error(`Error en Scopus count: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Busca referencias en Scopus
   */
  async search({ query, apiKey = this.defaultApiKey, start = 0, count = 25, yearRange = null }) {
    try {
      console.log(`🔍 Buscando en Scopus: "${query.substring(0, 100)}..."`);

      if (!apiKey) {
        throw new Error('API Key de Scopus no proporcionada');
      }

      // Construir query con rango de años si se proporciona
      let finalQuery = query;
      if (yearRange && yearRange.from && yearRange.to) {
        finalQuery = `${query} AND PUBYEAR > ${yearRange.from - 1} AND PUBYEAR < ${yearRange.to + 1}`;
      }

      const response = await axios.get(this.baseUrl, {
        params: {
          query: finalQuery,
          start,
          count: Math.min(count, 200), // Scopus limita a 200 por request
          sort: '-coverDate' // Ordenar por fecha descendente
        },
        headers: {
          'X-ELS-APIKey': apiKey,
          'Accept': 'application/json'
        },
        timeout: 30000
      });

      const searchResults = response.data['search-results'];
      const totalResults = parseInt(searchResults['opensearch:totalResults']) || 0;
      const entries = searchResults.entry || [];

      // Transformar resultados al formato de nuestra aplicación
      const references = entries
        .filter(entry => {
          // Validar que tenga al menos un título en cualquier campo
          const hasTitle = entry['dc:title'] || 
                          entry['title'] || 
                          entry['article-title'] || 
                          entry['prism:title'];
          return hasTitle && hasTitle.trim().length > 0;
        })
        .map(entry => this.transformScopusEntry(entry));

      console.log(`✅ Encontrados ${references.length} resultados de ${totalResults} totales`);

      return {
        success: true,
        total: totalResults,
        count: references.length,
        start,
        references,
        query: finalQuery
      };

    } catch (error) {
      console.error('❌ Error buscando en Scopus:', error.message);
      throw new Error(`Error en búsqueda Scopus: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Transforma una entrada de Scopus al formato de la aplicación
   */
  transformScopusEntry(entry) {
    // Obtener el título, manejando diferentes formatos
    let title = entry['dc:title'] || '';
    
    // Si no hay título, intentar obtenerlo de otros campos
    if (!title || title.trim() === '') {
      title = entry['title'] || 
              entry['article-title'] || 
              entry['prism:title'] || 
              'Untitled Document';
    }
    
    return {
      externalId: entry['dc:identifier']?.replace('SCOPUS_ID:', '') || null,
      database: 'Scopus',
      title: title.trim(),
      abstract: entry['dc:description'] || entry['description'] || '',
      authors: this.extractAuthors(entry),
      year: parseInt(entry['prism:coverDate']?.substring(0, 4)) || null,
      journal: entry['prism:publicationName'] || '',
      doi: entry['prism:doi'] || null,
      keywords: this.extractKeywords(entry),
      citationCount: parseInt(entry['citedby-count']) || 0,
      url: entry['prism:url'] || entry['link']?.find(l => l['@ref'] === 'scopus')?.['@href'] || null,
      metadata: {
        scopusId: entry['dc:identifier']?.replace('SCOPUS_ID:', ''),
        eid: entry['eid'],
        affiliations: entry['affiliation'] || [],
        aggregationType: entry['prism:aggregationType'],
        subtypeDescription: entry['subtypeDescription'],
        openAccess: entry['openaccess'] === '1',
        coverDate: entry['prism:coverDate']
      }
    };
  }

  /**
   * Extrae autores de la entrada de Scopus
   */
  extractAuthors(entry) {
    if (!entry['author']) return [];

    const authors = Array.isArray(entry['author']) ? entry['author'] : [entry['author']];
    
    return authors
      .map(author => {
        const surname = author['surname'] || '';
        const givenName = author['given-name'] || '';
        return givenName ? `${surname}, ${givenName}` : surname;
      })
      .filter(name => name.length > 0);
  }

  /**
   * Extrae keywords (Scopus no siempre las proporciona en resultados de búsqueda)
   */
  extractKeywords(entry) {
    // Scopus generalmente no incluye keywords en los resultados de búsqueda
    // Solo en consultas detalladas por artículo
    if (entry['authkeywords']) {
      return entry['authkeywords'].split('|').map(k => k.trim());
    }
    return [];
  }

  /**
   * Importa referencias desde Scopus a un proyecto
   */
  async importToProject({ projectId, query, apiKey, count = 100, yearRange = null }) {
    try {
      console.log(`📥 Importando hasta ${count} referencias de Scopus al proyecto ${projectId}...`);

      // Buscar referencias
      const searchResult = await this.search({ query, apiKey, start: 0, count, yearRange });

      // Guardar referencias en la base de datos
      const importedReferences = [];
      
      const errors = [];
      
      for (const ref of searchResult.references) {
        try {
          // Validar que tenga título antes de intentar guardar
          if (!ref.title || ref.title.trim() === '' || ref.title === 'Untitled Document') {
            console.warn(`⚠️  Saltando referencia sin título válido`);
            errors.push({ title: 'Unknown', error: 'Título vacío o inválido' });
            continue;
          }
          
          const savedRef = await this.referenceRepository.create({
            projectId,
            ...ref,
            screeningStatus: 'pending',
            importSource: 'scopus_api'
          });
          importedReferences.push(savedRef);
        } catch (error) {
          console.error(`⚠️  Error importando referencia: ${ref.title}`, error.message);
          errors.push({ title: ref.title || 'Unknown', error: error.message });
        }
      }

      console.log(`✅ Importadas ${importedReferences.length} referencias`);
      if (errors.length > 0) {
        console.warn(`⚠️  ${errors.length} referencias fallaron en la importación`);
      }

      return {
        success: true,
        imported: importedReferences.length,
        failed: errors.length,
        total: searchResult.total,
        references: importedReferences,
        errors: errors.length > 0 ? errors : undefined
      };

    } catch (error) {
      console.error('❌ Error importando desde Scopus:', error);
      throw error;
    }
  }
}

module.exports = ScopusSearchUseCase;

