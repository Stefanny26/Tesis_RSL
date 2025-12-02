const axios = require('axios');

const SERPAPI_KEY = process.env.GOOGLE_SCHOLAR_API_KEY || '5e71e222374829431209da40f8ada5dc910ee50b8c54b79d79cf2bc55300cd81';

class GoogleScholarSearch {
  async count({ query, startYear, endYear }) {
    try {
      const params = {
        engine: 'google_scholar',
        q: query,
        api_key: SERPAPI_KEY,
        as_ylo: startYear,
        as_yhi: endYear,
        num: 10 // solo para paginación, no afecta el conteo
      };
      const url = 'https://serpapi.com/search';
      const response = await axios.get(url, { params });
      const organicResults = response.data.organic_results || [];
      const totalResults = response.data.search_information?.total_results || organicResults.length;
      return {
        success: true,
        count: totalResults,
        searchedAt: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al consultar Google Scholar'
      };
    }
  }
}

module.exports = new GoogleScholarSearch();

