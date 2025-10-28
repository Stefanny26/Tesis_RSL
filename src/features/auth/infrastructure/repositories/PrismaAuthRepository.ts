/**
 * Infrastructure: Prisma Auth Repository
 * 
 * Implementación del repositorio de autenticación usando Prisma ORM y PostgreSQL.
 * Reemplaza LocalStorageAuthRepository en producción.
 */

import { User as DomainUser } from "../../domain/entities/User"
import { 
  IAuthRepository, 
  LoginCredentials, 
  RegisterData 
} from "../../domain/repositories/IAuthRepository"
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
    // Implementación temporal: simula OAuth de Google con un usuario upsert por email fijo.
    // En producción, integra NextAuth/Supabase y recibe el perfil de Google.
    const googleEmail = "usuario@gmail.com"
    const googleName = "Usuario Google"

  const role = this.mapRoleToPrisma("researcher")

    const user = await prisma.user.upsert({
      where: { email: googleEmail },
      update: {
        fullName: googleName,
        role: role as any,
        passwordHash: null,
      },
      create: {
        email: googleEmail,
        fullName: googleName,
        role: role as any,
        institution: "Universidad de las Fuerzas Armadas ESPE",
      }
    })

    return this.toDomain(user)
  }

  async register(data: RegisterData): Promise<DomainUser> {
    // Hash de contraseña
    const passwordHash = await bcrypt.hash(data.password, 10)

  // Único rol permitido
  const role = this.mapRoleToPrisma("researcher")

    // Crear usuario en la base de datos
    const user = await prisma.user.create({
      data: {
        email: data.email,
        fullName: data.name,
        passwordHash,
        role: role as any,
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
      role: this.mapRoleFromPrisma(prismaUser.role),
      institution: prismaUser.institution || undefined,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    })
  }

  private mapRoleToPrisma(role: "researcher"): string {
    return "Investigador"
  }

  private mapRoleFromPrisma(_prismaRole: string): "researcher" {
    return "researcher"
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
    if (data.role) updateData.role = this.mapRoleToPrisma(data.role)
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
