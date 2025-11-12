const axios = require('axios');

/**
 * Use Case: Buscar en bases de datos académicas (Scopus e IEEE)
 */
class SearchAcademicDatabasesUseCase {
  /**
   * Buscar artículos en Scopus
   */
  async searchScopus(query, apiKey, maxResults = 50) {
    try {
      const url = 'https://api.elsevier.com/content/search/scopus';
      const response = await axios.get(url, {
        params: {
          query: query,
          apiKey: apiKey,
          count: maxResults,
          view: 'COMPLETE'
        },
        headers: {
          'Accept': 'application/json'
        }
      });

      const entries = response.data['search-results']?.entry || [];
      
      return entries.map(item => ({
        title: item['dc:title'] || 'Sin título',
        abstract: item['dc:description'] || 'Sin resumen disponible',
        year: item['prism:coverDate'] ? item['prism:coverDate'].substring(0, 4) : '',
        source: item['prism:publicationName'] || '',
        doi: item['prism:doi'] || '',
        authors: item['dc:creator'] || '',
        url: item['prism:url'] || '',
        citationCount: item['citedby-count'] || 0,
        database: 'Scopus',
        externalId: item['dc:identifier'] || ''
      }));
    } catch (error) {
      console.error('Error buscando en Scopus:', error.message);
      throw new Error(`Error en búsqueda Scopus: ${error.message}`);
    }
  }

  /**
   * Buscar artículos en IEEE Xplore
   */
  async searchIEEE(query, apiKey, maxResults = 50) {
    try {
      const url = 'https://ieeexploreapi.ieee.org/api/v1/search/articles';
      const response = await axios.get(url, {
        params: {
          apikey: apiKey,
          querytext: query,
          max_records: maxResults,
          format: 'json'
        }
      });

      const articles = response.data.articles || [];
      
      return articles.map(art => {
        // Extraer autores
        const authors = art.authors?.authors || [];
        const authorNames = authors.map(a => a.full_name).join(', ');

        return {
          title: art.title || 'Sin título',
          abstract: art.abstract || 'Sin resumen disponible',
          year: art.publication_year?.toString() || '',
          source: art.publication_title || '',
          doi: art.doi || '',
          authors: authorNames || 'Desconocido',
          url: art.html_url || '',
          citationCount: art.citing_paper_count || 0,
          database: 'IEEE Xplore',
          externalId: art.article_number || ''
        };
      });
    } catch (error) {
      console.error('Error buscando en IEEE:', error.message);
      throw new Error(`Error en búsqueda IEEE: ${error.message}`);
    }
  }

  /**
   * Eliminar duplicados basándose en DOI o título
   */
  removeDuplicates(articles) {
    const seen = new Set();
    const unique = [];

    for (const article of articles) {
      // Priorizar DOI para detectar duplicados
      const key = article.doi || article.title.toLowerCase().trim();
      
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(article);
      }
    }

    return unique;
  }

  /**
   * Ejecutar búsqueda en ambas bases de datos
   */
  async execute({ query, scopusApiKey, ieeeApiKey, maxResultsPerSource = 50 }) {
    const results = {
      scopus: [],
      ieee: [],
      combined: [],
      stats: {
        totalScopus: 0,
        totalIEEE: 0,
        totalCombined: 0,
        duplicatesRemoved: 0
      }
    };

    try {
      // Buscar en Scopus si hay API key
      if (scopusApiKey) {
        try {
          results.scopus = await this.searchScopus(query, scopusApiKey, maxResultsPerSource);
          results.stats.totalScopus = results.scopus.length;
        } catch (error) {
          console.error('Scopus search failed:', error.message);
        }
      }

      // Buscar en IEEE si hay API key
      if (ieeeApiKey) {
        try {
          results.ieee = await this.searchIEEE(query, ieeeApiKey, maxResultsPerSource);
          results.stats.totalIEEE = results.ieee.length;
        } catch (error) {
          console.error('IEEE search failed:', error.message);
        }
      }

      // Combinar y eliminar duplicados
      const allArticles = [...results.scopus, ...results.ieee];
      results.combined = this.removeDuplicates(allArticles);
      
      results.stats.totalCombined = results.combined.length;
      results.stats.duplicatesRemoved = allArticles.length - results.combined.length;

      return results;
    } catch (error) {
      throw new Error(`Error en búsqueda académica: ${error.message}`);
    }
  }
}

module.exports = SearchAcademicDatabasesUseCase;
