const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor() {
    this.baseUrl = API_URL
    
    // Cargar token del localStorage o cookies si existe
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token')
      
      // Si no está en localStorage, intentar obtenerlo de las cookies
      if (!this.token) {
        const cookies = document.cookie.split(';')
        const authCookie = cookies.find(c => c.trim().startsWith('authToken='))
        if (authCookie) {
          this.token = authCookie.split('=')[1]
          localStorage.setItem('token', this.token)
        }
      }
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token)
      
      // También guardar en cookies para el middleware
      document.cookie = `authToken=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      // También limpiar la cookie
      document.cookie = 'authToken=; path=/; max-age=0'
    }
  }

  getToken(): string | null {
    return this.token
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      ...options.headers,
    }

    // Solo agregar Content-Type si no es FormData
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Error en la petición')
    }

    return data
  }

  // Auth
  async register(email: string, fullName: string, password: string) {
    const data = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, fullName, password }),
    })
    
    if (data.data.token) {
      this.setToken(data.data.token)
    }
    
    return data.data
  }

  async login(email: string, password: string) {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    
    if (data.data.token) {
      this.setToken(data.data.token)
    }
    
    return data.data
  }

  async getMe() {
    const data = await this.request('/api/auth/me')
    return data.data.user
  }

  getGoogleAuthUrl() {
    return `${this.baseUrl}/api/auth/google`
  }

  // Projects
  async getProjects(limit = 50, offset = 0) {
    const data = await this.request(
      `/api/projects?limit=${limit}&offset=${offset}`
    )
    return data.data
  }

  async getProject(id: string) {
    const data = await this.request(`/api/projects/${id}`)
    return data.data.project
  }

  async createProject(projectData: { title: string; description?: string; deadline?: string }) {
    const data = await this.request('/api/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    })
    return data // Retorna el objeto completo con success, message y data
  }

  async updateProject(id: string, updates: any) {
    const data = await this.request(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
    return data.data.project
  }

  async deleteProject(id: string) {
    await this.request(`/api/projects/${id}`, {
      method: 'DELETE',
    })
  }

  // AI Methods
  async generateProtocolAnalysis(
    title: string, 
    description: string, 
    aiProvider: 'chatgpt' | 'gemini' = 'chatgpt',
    area?: string,
    yearStart?: number,
    yearEnd?: number
  ) {
    const data = await this.request('/api/ai/protocol-analysis', {
      method: 'POST',
      body: JSON.stringify({ title, description, area, yearStart, yearEnd, aiProvider }),
    })
    return data.data
  }

  async generateTitles(matrixData: any, picoData: any, aiProvider: 'chatgpt' | 'gemini' = 'gemini') {
    const data = await this.request('/api/ai/generate-titles', {
      method: 'POST',
      body: JSON.stringify({ matrixData, picoData, aiProvider }),
    })
    return data.data
  }

  async generateProtocolJustification(
    title: string,
    description: string,
    area: string,
    yearStart: number,
    yearEnd: number,
    pico: any,
    matrixData: any,
    aiProvider: 'chatgpt' | 'gemini' = 'chatgpt'
  ) {
    const data = await this.request('/api/ai/protocol-justification', {
      method: 'POST',
      body: JSON.stringify({ title, description, area, yearStart, yearEnd, pico, matrixData, aiProvider }),
    })
    return data.data
  }

  async generateSearchStrategies(
    protocolTerms: any,
    picoData: any, 
    databases: string[], 
    researchArea?: string,
    aiProvider: 'chatgpt' | 'gemini' = 'gemini'
  ) {
    const data = await this.request('/api/ai/generate-search-strategies', {
      method: 'POST',
      body: JSON.stringify({ protocolTerms, picoData, databases, researchArea, aiProvider }),
    })
    return data.data
  }

  async generateProtocolTerms(
    projectTitle: string,  // Puede ser selectedTitle o projectName (frontend decide)
    projectDescription: string,
    picoData: any,
    matrixData: any,
    aiProvider: 'chatgpt' | 'gemini' = 'gemini',
    specificSection?: 'tecnologia' | 'dominio' | 'focosTematicos',
    customFocus?: string
  ) {
    const data = await this.request('/api/ai/generate-protocol-terms', {
      method: 'POST',
      body: JSON.stringify({ 
        selectedTitle: projectTitle,  // ← REGLA: Frontend envía título seleccionado en este parámetro
        projectTitle,  // Mantener compatibilidad con código existente
        projectDescription, 
        picoData, 
        matrixData, 
        aiProvider,
        specificSection,
        customFocus
      }),
    })
    return data.data
  }

  async generateInclusionExclusionCriteria(
    protocolTerms: {
      tecnologia?: string[]
      dominio?: string[]
      tipoEstudio?: string[]
      focosTematicos?: string[]
    },
    picoData: any,
    aiProvider: 'chatgpt' | 'gemini' = 'gemini',
    specificType?: 'inclusion' | 'exclusion',
    customFocus?: string,
    categoryIndex?: number,
    categoryName?: string,
    yearStart?: number,
    yearEnd?: number,
    selectedTitle?: string
  ) {
    const data = await this.request('/api/ai/generate-inclusion-exclusion-criteria', {
      method: 'POST',
      body: JSON.stringify({ 
        protocolTerms, 
        picoData, 
        aiProvider,
        specificType,
        customFocus,
        categoryIndex,
        categoryName,
        yearStart,
        yearEnd,
        selectedTitle  // ← REGLA: Título RSL seleccionado para derivar criterios
      }),
    })
    return data.data
  }

  // Search Strategies - New Query Generator
  async generateSearchQueries(
    protocolTerms: {
      tecnologia?: string[]
      dominio?: string[]
      tipoEstudio?: string[]
      focosTematicos?: string[]
    },
    picoData: any,
    selectedDatabases: string[],
    researchArea?: string,
    matrixData?: any,
    yearStart?: number,
    yearEnd?: number,
    selectedTitle?: string
  ) {
    const data = await this.request('/api/ai/generate-search-strategies', {
      method: 'POST',
      body: JSON.stringify({ 
        databases: selectedDatabases,
        picoData, 
        matrixData,
        researchArea,
        protocolTerms,
        yearStart,
        yearEnd,
        selectedTitle
      }),
    })
    return data.data
  }

  async getSupportedDatabases() {
    const data = await this.request('/api/ai/supported-databases')
    return data
  }

  async scopusCount(query: string) {
    const data = await this.request('/api/ai/scopus-count', {
      method: 'POST',
      body: JSON.stringify({ query }),
    })
    return data
  }

  async googleScholarCount(query: string, startYear?: number, endYear?: number) {
    const data = await this.request('/api/ai/google-scholar-count', {
      method: 'POST',
      body: JSON.stringify({ query, startYear, endYear }),
    })
    return data
  }

  async scopusSearch(query: string, start = 0, count = 25, sortBy = 'relevance') {
    const data = await this.request('/api/ai/scopus-search', {
      method: 'POST',
      body: JSON.stringify({ query, start, count, sortBy }),
    })
    return data
  }

  async scopusValidate() {
    const data = await this.request('/api/ai/scopus-validate')
    return data
  }

  async scopusFetch(query: string, projectId: string, count = 25) {
    const data = await this.request('/api/ai/scopus-fetch', {
      method: 'POST',
      body: JSON.stringify({ query, projectId, count }),
    })
    return data
  }

  // Protocol
  async getProtocol(projectId: string) {
    const data = await this.request(`/api/projects/${projectId}/protocol`)
    return data.data.protocol // Retorna solo el objeto protocol
  }

  async updateProtocol(projectId: string, protocolData: any) {
    const data = await this.request(`/api/projects/${projectId}/protocol`, {
      method: 'PUT',
      body: JSON.stringify(protocolData),
    })
    return data.data.protocol
  }

  // Referencias
  async getReferences(projectId: string, filters: any = {}) {
    const params = new URLSearchParams()
    if (filters.status) params.append('status', filters.status)
    if (filters.year) params.append('year', filters.year)
    if (filters.source) params.append('source', filters.source)
    if (filters.limit !== undefined) params.append('limit', filters.limit.toString())
    
    const query = params.toString()
    const data = await this.request(`/api/references/${projectId}${query ? '?' + query : ''}`)
    return data.data
  }

  async getAllReferences(projectId: string) {
    // Obtener TODAS las referencias sin límite de paginación
    return this.getReferences(projectId, { limit: 10000 })
  }

  async createReference(projectId: string, referenceData: any) {
    const data = await this.request(`/api/references/${projectId}`, {
      method: 'POST',
      body: JSON.stringify(referenceData),
    })
    return data.data
  }

  async createReferencesBatch(projectId: string, references: any[]) {
    const data = await this.request(`/api/references/${projectId}/batch`, {
      method: 'POST',
      body: JSON.stringify({ references }),
    })
    return data.data
  }

  async updateReferenceScreening(referenceId: string, status: string, aiData?: any) {
    const data = await this.request(`/api/references/${referenceId}/screening`, {
      method: 'PUT',
      body: JSON.stringify({ status, aiData }),
    })
    return data.data
  }

  // Alias para updateReferenceScreening (más simple)
  async updateReferenceStatus(referenceId: string, statusData: { status: string; exclusionReason?: string; notes?: string }) {
    return this.updateReferenceScreening(referenceId, statusData.status, {
      exclusionReason: statusData.exclusionReason,
      notes: statusData.notes
    })
  }

  async updateReferencesBatch(updates: any[]) {
    const data = await this.request('/api/references/batch-update', {
      method: 'PUT',
      body: JSON.stringify({ updates }),
    })
    return data.data
  }

  async getScreeningStats(projectId: string) {
    const data = await this.request(`/api/references/${projectId}/stats`)
    return data.data
  }

  async detectDuplicates(projectId: string) {
    const data = await this.request(`/api/references/${projectId}/detect-duplicates`, {
      method: 'POST',
    })
    return data.data
  }

  async findDuplicates(referenceId: string, projectId: string) {
    const data = await this.request(`/api/references/${referenceId}/duplicates?projectId=${projectId}`)
    return data.data
  }

  async deleteReference(referenceId: string) {
    await this.request(`/api/references/${referenceId}`, {
      method: 'DELETE',
    })
  }

  async detectDuplicates(projectId: string) {
    const data = await this.request(`/api/references/${projectId}/detect-duplicates`, {
      method: 'POST'
    })
    return data
  }

  async resolveDuplicateGroup(projectId: string, groupId: string, keepReferenceId: string) {
    const data = await this.request(`/api/references/${projectId}/resolve-duplicate`, {
      method: 'POST',
      body: JSON.stringify({
        groupId,
        keepReferenceId
      })
    })
    return data
  }

  async getYearDistribution(projectId: string) {
    const data = await this.request(`/api/references/${projectId}/year-distribution`)
    return data.data
  }

  async getSourceDistribution(projectId: string) {
    const data = await this.request(`/api/references/${projectId}/source-distribution`)
    return data.data
  }

  async importReferences(projectId: string, formData: FormData) {
    const response = await fetch(`${this.baseUrl}/api/references/${projectId}/import`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData, // FormData se envía directamente sin Content-Type
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error al importar referencias')
    }

    return response.json()
  }

  async exportReferences(projectId: string, format: string = 'bibtex') {
    const response = await fetch(`${this.baseUrl}/api/references/${projectId}/export?format=${format}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error al exportar referencias')
    }

    return response.blob()
  }

  // IA - Screening automático
  async runScreeningEmbeddings(projectId: string, options: { threshold?: number } = {}) {
    // Timeout extendido para procesos largos (10 minutos)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 600000) // 10 minutos
    
    try {
      const response = await fetch(`${this.baseUrl}/api/ai/run-project-screening-embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
        body: JSON.stringify({
          projectId,
          threshold: options.threshold || 0.15,
          aiProvider: 'chatgpt'
        }),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Error en el screening')
      }
      
      return data
    } catch (error: any) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw new Error('El proceso tardó demasiado tiempo. Intenta con menos referencias.')
      }
      throw error
    }
  }

  async runScreeningLLM(projectId: string, options: { llmProvider?: 'gemini' | 'chatgpt' } = {}) {
    const data = await this.request('/api/ai/run-project-screening-llm', {
      method: 'POST',
      body: JSON.stringify({
        projectId,
        llmProvider: options.llmProvider || 'gemini'
      }),
    })
    return data
  }

  async searchAcademicReferences(searchData: {
    query: string
    database?: 'scopus' | 'ieee'
    maxResultsPerSource?: number
  }) {
    const data = await this.request('/api/references/search-academic', {
      method: 'POST',
      body: JSON.stringify(searchData),
    })
    return data.data
  }

  // PDF Upload
  async uploadPdf(referenceId: string, file: File) {
    const formData = new FormData()
    formData.append('pdf', file)

    const data = await this.request(`/api/references/${referenceId}/upload-pdf`, {
      method: 'POST',
      body: formData,
      // No establecer Content-Type, el browser lo hace automáticamente con el boundary correcto
      headers: {
        // Remover Content-Type para que FormData funcione correctamente
      }
    })
    return data.data
  }

  async deletePdf(referenceId: string) {
    const data = await this.request(`/api/references/${referenceId}/pdf`, {
      method: 'DELETE',
    })
    return data.data
  }

  // AI Screening with Embeddings
  async screenReferenceWithEmbeddings(referenceData: {
    reference: any
    protocol: any
    threshold?: number
  }) {
    const data = await this.request('/api/ai/screen-reference-embeddings', {
      method: 'POST',
      body: JSON.stringify(referenceData),
    })
    return data.data
  }

  async screenReferencesBatchWithEmbeddings(batchData: {
    references: any[]
    protocol: any
    threshold?: number
  }) {
    const data = await this.request('/api/ai/screen-references-batch-embeddings', {
      method: 'POST',
      body: JSON.stringify(batchData),
    })
    return data
  }

  // Análisis de distribución de similitudes (Elbow Analysis)
  async analyzeSimilarityDistribution(projectId: string) {
    const data = await this.request('/api/ai/analyze-similarity-distribution', {
      method: 'POST',
      body: JSON.stringify({ projectId }),
    })
    return data // Retornar el objeto completo { success, data }
  }

  async generateRankingWithEmbeddings(rankingData: {
    references: any[]
    protocol: any
    models?: string[]
  }) {
    const data = await this.request('/api/ai/ranking-embeddings', {
      method: 'POST',
      body: JSON.stringify(rankingData),
    })
    return data.data
  }

  // AI Screening with LLM (existing)
  async screenReferenceWithLLM(referenceData: {
    reference: any
    inclusionCriteria?: string[]
    exclusionCriteria?: string[]
    researchQuestion?: string
    aiProvider?: 'chatgpt' | 'gemini'
  }) {
    const data = await this.request('/api/ai/screen-reference', {
      method: 'POST',
      body: JSON.stringify(referenceData),
    })
    return data.data
  }

  async screenReferencesBatchWithLLM(batchData: {
    references: any[]
    inclusionCriteria?: string[]
    exclusionCriteria?: string[]
    researchQuestion?: string
    aiProvider?: 'chatgpt' | 'gemini'
  }) {
    const data = await this.request('/api/ai/screen-references-batch', {
      method: 'POST',
      body: JSON.stringify(batchData),
    })
    return data.data
  }

  async analyzeScreeningResults(projectId: string) {
    const data = await this.request(`/api/ai/analyze-screening-results/${projectId}`, {
      method: 'GET',
    })
    return data.data
  }

  // === API USAGE STATS ===
  async getApiUsageStats() {
    const data = await this.request('/api/usage/stats', {
      method: 'GET',
    })
    return data.data
  }

  async getRecentApiUsage(days: number = 30) {
    const data = await this.request(`/api/usage/recent?days=${days}`, {
      method: 'GET',
    })
    return data.data
  }
}

export { ApiClient }
export const apiClient = new ApiClient()
