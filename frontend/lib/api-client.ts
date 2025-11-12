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
      'Content-Type': 'application/json',
      ...options.headers,
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
  async generateProtocolAnalysis(title: string, description: string, aiProvider: 'chatgpt' | 'gemini' = 'chatgpt') {
    const data = await this.request('/api/ai/protocol-analysis', {
      method: 'POST',
      body: JSON.stringify({ title, description, aiProvider }),
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

  async generateSearchStrategies(
    matrixData: any, 
    picoData: any, 
    databases: string[], 
    keyTerms?: string[], 
    aiProvider: 'chatgpt' | 'gemini' = 'gemini'
  ) {
    const data = await this.request('/api/ai/generate-search-strategies', {
      method: 'POST',
      body: JSON.stringify({ matrixData, picoData, keyTerms, databases, aiProvider }),
    })
    return data.data
  }

  // Protocol
  async getProtocol(projectId: string) {
    const data = await this.request(`/api/projects/${projectId}/protocol`)
    return data.data // Retorna todo el objeto { protocol }
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
    
    const query = params.toString()
    const data = await this.request(`/api/references/${projectId}${query ? '?' + query : ''}`)
    return data.data
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

  async findDuplicates(referenceId: string, projectId: string) {
    const data = await this.request(`/api/references/${referenceId}/duplicates?projectId=${projectId}`)
    return data.data
  }

  async deleteReference(referenceId: string) {
    await this.request(`/api/references/${referenceId}`, {
      method: 'DELETE',
    })
  }

  async getYearDistribution(projectId: string) {
    const data = await this.request(`/api/references/${projectId}/year-distribution`)
    return data.data
  }

  async getSourceDistribution(projectId: string) {
    const data = await this.request(`/api/references/${projectId}/source-distribution`)
    return data.data
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
}

export const apiClient = new ApiClient()
