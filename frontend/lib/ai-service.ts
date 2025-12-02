// AI Service for generating protocol content using backend API
// Todas las llamadas pasan por el backend para proteger las API keys

export type AIProvider = 'deepseek' | 'chatgpt' | 'gemini'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// Helper para obtener el token
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || ''
  }
  return ''
}

/**
 * Servicio principal de IA
 */
export const aiService = {
  /**
   * 1. ANÁLISIS COMPLETO DE PROTOCOLO PRISMA
   */
  async generateProtocolAnalysis(
    title: string,
    description: string,
    aiProvider: AIProvider = 'deepseek'
  ) {
    const response = await fetch(`${API_URL}/api/ai/protocol-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ title, description, aiProvider })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error al generar análisis')
    }

    return await response.json()
  },

  /**
   * 2. GENERACIÓN DE TÍTULO ACADÉMICO
   */
  async generateTitle(
    researchQuestion: string,
    aiProvider: AIProvider = 'deepseek'
  ) {
    const response = await fetch(`${API_URL}/api/ai/generate-title`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ researchQuestion, aiProvider })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error al generar título')
    }

    return await response.json()
  },

  /**
   * 3. SCREENING DE REFERENCIA INDIVIDUAL
   */
  async screenReference(
    reference: any,
    inclusionCriteria: string[],
    exclusionCriteria: string[],
    researchQuestion: string,
    aiProvider: AIProvider = 'gemini'
  ) {
    const response = await fetch(`${API_URL}/api/ai/screen-reference`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({
        reference,
        inclusionCriteria,
        exclusionCriteria,
        researchQuestion,
        aiProvider
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error al analizar referencia')
    }

    return await response.json()
  },

  /**
   * 4. SCREENING POR LOTES
   */
  async screenReferencesBatch(
    references: any[],
    inclusionCriteria: string[],
    exclusionCriteria: string[],
    researchQuestion: string,
    aiProvider: AIProvider = 'gemini'
  ) {
    const response = await fetch(`${API_URL}/api/ai/screen-references-batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({
        references,
        inclusionCriteria,
        exclusionCriteria,
        researchQuestion,
        aiProvider
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error al analizar referencias')
    }

    return await response.json()
  },

  /**
   * 5. REFINAMIENTO DE CADENA DE BÚSQUEDA
   */
  async refineSearchString(
    currentSearchString: string,
    searchResults: any[],
    researchQuestion: string,
    databases: string[] = ['IEEE Xplore', 'ACM', 'Scopus'],
    aiProvider: AIProvider = 'deepseek'
  ) {
    const response = await fetch(`${API_URL}/api/ai/refine-search-string`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({
        currentSearchString,
        searchResults,
        researchQuestion,
        databases,
        aiProvider
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error al refinar búsqueda')
    }

    return await response.json()
  }
}

// Exportaciones para compatibilidad
export const generateCompleteProtocolAnalysis = aiService.generateProtocolAnalysis
export const generateTitle = aiService.generateTitle
export const screenReference = aiService.screenReference
export const screenReferencesBatch = aiService.screenReferencesBatch
export const refineSearchString = aiService.refineSearchString
