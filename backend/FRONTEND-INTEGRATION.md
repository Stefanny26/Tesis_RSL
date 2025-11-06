# Integración Frontend-Backend

Esta guía muestra cómo conectar tu frontend Next.js con el backend Express.

## 🔗 Configuración del Frontend

### 1. Crear archivo de configuración de API

Crea `frontend/lib/api-client.ts`:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = API_URL;
    
    // Cargar token del localStorage si existe
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error en la petición');
    }

    return data;
  }

  // Auth
  async register(email: string, fullName: string, password: string) {
    const data = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, fullName, password }),
    });
    
    if (data.data.token) {
      this.setToken(data.data.token);
    }
    
    return data.data;
  }

  async login(email: string, password: string) {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (data.data.token) {
      this.setToken(data.data.token);
    }
    
    return data.data;
  }

  async getMe() {
    const data = await this.request('/api/auth/me');
    return data.data.user;
  }

  // Projects
  async getProjects(limit = 50, offset = 0) {
    const data = await this.request(
      `/api/projects?limit=${limit}&offset=${offset}`
    );
    return data.data;
  }

  async getProject(id: string) {
    const data = await this.request(`/api/projects/${id}`);
    return data.data.project;
  }

  async createProject(title: string, description?: string, deadline?: string) {
    const data = await this.request('/api/projects', {
      method: 'POST',
      body: JSON.stringify({ title, description, deadline }),
    });
    return data.data.project;
  }

  async updateProject(id: string, updates: any) {
    const data = await this.request(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return data.data.project;
  }

  async deleteProject(id: string) {
    await this.request(`/api/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Protocol
  async getProtocol(projectId: string) {
    const data = await this.request(`/api/projects/${projectId}/protocol`);
    return data.data.protocol;
  }

  async updateProtocol(projectId: string, protocolData: any) {
    const data = await this.request(`/api/projects/${projectId}/protocol`, {
      method: 'PUT',
      body: JSON.stringify(protocolData),
    });
    return data.data.protocol;
  }
}

export const apiClient = new ApiClient();
```

### 2. Actualizar el contexto de autenticación

Actualiza `frontend/lib/auth-context.tsx`:

```typescript
'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from './api-client'

interface User {
  id: string
  email: string
  fullName: string
  avatarUrl?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, fullName: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Cargar usuario al iniciar
  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const userData = await apiClient.getMe()
      setUser(userData)
    } catch (error) {
      console.error('Error cargando usuario:', error)
      apiClient.clearToken()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const { user: userData } = await apiClient.login(email, password)
    setUser(userData)
    router.push('/dashboard')
  }

  const register = async (email: string, fullName: string, password: string) => {
    const { user: userData } = await apiClient.register(email, fullName, password)
    setUser(userData)
    router.push('/dashboard')
  }

  const logout = () => {
    apiClient.clearToken()
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}
```

### 3. Actualizar componente de login

Actualiza `frontend/components/auth/login-form.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    window.location.href = `${apiUrl}/api/auth/google`
  }

  return (
    <div className="w-full max-w-md space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div>
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        {error && (
          <div className="text-sm text-red-500">{error}</div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            O continúa con
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogleLogin}
      >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Continuar con Google
      </Button>
    </div>
  )
}
```

### 4. Crear página de callback de OAuth

Crea `frontend/app/auth/callback/page.tsx`:

```typescript
'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiClient } from '@/lib/api-client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')

    if (error) {
      router.push(`/login?error=${encodeURIComponent(error)}`)
      return
    }

    if (token) {
      apiClient.setToken(token)
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }, [router, searchParams])

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p>Completando autenticación...</p>
      </div>
    </div>
  )
}
```

### 5. Configurar variables de entorno

Crea `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🧪 Probar la Integración

### 1. Iniciar ambos servidores

Terminal 1 (Backend):
```powershell
cd backend
npm run dev
```

Terminal 2 (Frontend):
```powershell
cd frontend
pnpm dev
```

### 2. Verificar conexión

1. Abre http://localhost:3000/login
2. Prueba registrar un usuario
3. Verifica que el token se guarde en localStorage
4. Navega a /dashboard
5. Prueba el botón "Continuar con Google"

## 📝 Ejemplos de Uso

### Crear un proyecto

```typescript
import { apiClient } from '@/lib/api-client'

const handleCreateProject = async () => {
  try {
    const project = await apiClient.createProject(
      'Mi RSL sobre IA',
      'Revisión sistemática sobre inteligencia artificial en educación',
      '2025-12-31'
    )
    console.log('Proyecto creado:', project)
  } catch (error) {
    console.error('Error:', error)
  }
}
```

### Actualizar protocolo

```typescript
const handleUpdateProtocol = async (projectId: string) => {
  try {
    const protocol = await apiClient.updateProtocol(projectId, {
      population: 'Estudiantes universitarios',
      intervention: 'Uso de IA generativa',
      comparison: 'Métodos tradicionales',
      outcomes: 'Rendimiento académico',
      researchQuestions: [
        '¿Cómo impacta la IA en el aprendizaje?',
        '¿Qué beneficios trae?'
      ]
    })
    console.log('Protocolo actualizado:', protocol)
  } catch (error) {
    console.error('Error:', error)
  }
}
```

## 🔒 Seguridad

- El token JWT se guarda en localStorage
- Todas las rutas protegidas requieren el header `Authorization: Bearer <token>`
- El token expira en 7 días (configurable en backend)
- Google OAuth redirige de vuelta al frontend con el token

## 🐛 Solución de Problemas

### Error de CORS
- Verifica que `FRONTEND_URL` en backend/.env sea correcto
- El backend debe aceptar peticiones desde http://localhost:3000

### Token no se guarda
- Verifica que localStorage esté disponible
- Revisa la consola del navegador

### Google OAuth no funciona
- Verifica las URIs de redirección en Google Cloud Console
- Debe incluir: http://localhost:3001/api/auth/google/callback
