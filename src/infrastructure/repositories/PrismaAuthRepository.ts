/**
 * Infrastructure: Prisma Auth Repository
 * 
 * Implementación del repositorio de autenticación usando Prisma ORM y PostgreSQL.
 * Reemplaza LocalStorageAuthRepository en producción.
 */

import { User as DomainUser } from "@domain/entities"
import { 
  IAuthRepository, 
  LoginCredentials, 
  RegisterData 
} from "@domain/repositories"
import prisma from "@/lib/prisma"
// Note: Prisma enum type for role varies by version; we'll map string value and cast at usage sites.
import bcrypt from 'bcryptjs'

export class PrismaAuthRepository implements IAuthRepository {
  
  async login(credentials: LoginCredentials): Promise<DomainUser> {
    // Buscar usuario por email
    const user = await prisma.user.findUnique({
      where: { email: credentials.email }
    })

    if (!user) {
      throw new Error("Usuario no encontrado")
    }

    // Verificar contraseña
    if (user.passwordHash) {
      const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
      if (!isValid) {
        throw new Error("Contraseña incorrecta")
      }
    }

    // Convertir a entidad del dominio
    return this.toDomain(user)
  }

  async loginWithGoogle(): Promise<DomainUser> {
    // Implementación temporal: upsert de un usuario "Google" por email fijo.
    const googleEmail = "usuario@gmail.com"
    const googleName = "Usuario Google"

    const user = await prisma.user.upsert({
      where: { email: googleEmail },
      update: {
        fullName: googleName,
        passwordHash: null,
      },
      create: {
        email: googleEmail,
        fullName: googleName,
        institution: "Universidad de las Fuerzas Armadas ESPE",
      }
    })

    return this.toDomain(user)
  }

  async register(data: RegisterData): Promise<DomainUser> {
    // Hash de contraseña
    const passwordHash = await bcrypt.hash(data.password, 10)

    // Crear usuario en la base de datos
    const user = await prisma.user.create({
      data: {
        email: data.email,
        fullName: data.name,
        passwordHash,
        institution: data.institution || "Universidad de las Fuerzas Armadas ESPE",
      }
    })

    // Convertir a entidad del dominio
    return this.toDomain(user)
  }

  async logout(): Promise<void> {
    // En una API REST, esto limpiaría la sesión del servidor
    // En Next.js con cookies, limpiarías la cookie de sesión
    // Por ahora, es una operación cliente-side manejada por el context
  }

  async getCurrentUser(): Promise<DomainUser | null> {
    // Sesión no integrada aún; retornar null hasta integrar con el sistema de sesiones (p.ej., NextAuth)
    return null
  }

  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser()
    return user !== null
  }

  // Métodos auxiliares privados
  
  private toDomain(prismaUser: any): DomainUser {
    return new DomainUser({
      id: prismaUser.id,
      email: prismaUser.email,
      name: prismaUser.fullName,
      institution: prismaUser.institution || undefined,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    })
  }

  // Métodos adicionales para gestión de usuarios
  
  async getUserById(id: string): Promise<DomainUser | null> {
    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) return null
    return this.toDomain(user)
  }

  async getUserByEmail(email: string): Promise<DomainUser | null> {
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) return null
    return this.toDomain(user)
  }

  async updateUser(id: string, data: Partial<RegisterData>): Promise<DomainUser> {
    const updateData: any = {}

    if (data.name) updateData.fullName = data.name
    if (data.institution) updateData.institution = data.institution
    // Role update removed: all users are researchers
    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10)
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData
    })

    return this.toDomain(user)
  }
}
