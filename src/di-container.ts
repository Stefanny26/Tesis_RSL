/**
 * Dependency Injection Container
 * 
 * Centraliza la creación e inyección de dependencias.
 * Facilita el testing y el cambio de implementaciones.
 */

// Repositories
import { 
  IAuthRepository 
} from "./features/auth/domain/repositories/IAuthRepository";

import { 
  IProjectRepository 
} from "./features/projects/domain/repositories/IProjectRepository";

// Implementations
import { 
  LocalStorageAuthRepository 
} from "./features/auth/infrastructure/repositories/LocalStorageAuthRepository";

import { 
  InMemoryProjectRepository 
} from "./features/projects/infrastructure/repositories/InMemoryProjectRepository";

// Use Cases - Auth
import {
  LoginUseCase,
  LoginWithGoogleUseCase,
  RegisterUseCase,
  LogoutUseCase,
  GetCurrentUserUseCase,
} from "./features/auth/application/use-cases";

// Use Cases - Projects
import {
  CreateProjectUseCase,
  GetProjectsUseCase,
  GetProjectByIdUseCase,
} from "./features/projects/application/use-cases";

// ======================
// Repositories
// ======================

// Auth Repository
// Cambiar a SupabaseAuthRepository cuando esté listo
export const authRepository: IAuthRepository = new LocalStorageAuthRepository()

// Project Repository
// Cambiar a SupabaseProjectRepository cuando esté listo
export const projectRepository: IProjectRepository = new InMemoryProjectRepository()

// ======================
// Auth Use Cases
// ======================

export const loginUseCase = new LoginUseCase(authRepository)
export const loginWithGoogleUseCase = new LoginWithGoogleUseCase(authRepository)
export const registerUseCase = new RegisterUseCase(authRepository)
export const logoutUseCase = new LogoutUseCase(authRepository)
export const getCurrentUserUseCase = new GetCurrentUserUseCase(authRepository)

// ======================
// Project Use Cases
// ======================

export const createProjectUseCase = new CreateProjectUseCase(projectRepository)
export const getProjectsUseCase = new GetProjectsUseCase(projectRepository)
export const getProjectByIdUseCase = new GetProjectByIdUseCase(projectRepository)

// ======================
// Factory Functions
// ======================

/**
 * Crear instancia de LoginUseCase con dependencias inyectadas
 */
export function createLoginUseCase(): LoginUseCase {
  return new LoginUseCase(authRepository)
}

/**
 * Crear instancia de CreateProjectUseCase con dependencias inyectadas
 */
export function createCreateProjectUseCase(): CreateProjectUseCase {
  return new CreateProjectUseCase(projectRepository)
}

// ======================
// Testing Helpers
// ======================

/**
 * Reemplazar repositorio de auth (útil para testing)
 */
export function setAuthRepository(repository: IAuthRepository): void {
  // En testing, puedes usar esto para inyectar un mock
  // authRepository = repository
}

/**
 * Reemplazar repositorio de proyectos (útil para testing)
 */
export function setProjectRepository(repository: IProjectRepository): void {
  // En testing, puedes usar esto para inyectar un mock
  // projectRepository = repository
}
