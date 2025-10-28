/**
 * Domain Entity: User
 * 
 * Representa un usuario del sistema RSL.
 * Esta entidad NO depende de ningún framework o librería externa.
 */

export type UserRole = "researcher"

export interface UserProps {
  id: string
  email: string
  name: string
  role: UserRole
  institution?: string
  createdAt?: Date
  updatedAt?: Date
}

export class User {
  private readonly props: UserProps

  constructor(props: UserProps) {
    this.validateProps(props)
    this.props = {
      ...props,
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    }
  }

  private validateProps(props: UserProps): void {
    if (!props.id || props.id.trim() === "") {
      throw new Error("User ID is required")
    }
    if (!props.email || !this.isValidEmail(props.email)) {
      throw new Error("Valid email is required")
    }
    if (!props.name || props.name.trim() === "") {
      throw new Error("User name is required")
    }
    if (props.role !== "researcher") {
      throw new Error("Invalid user role: only 'researcher' is allowed")
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Getters
  get id(): string {
    return this.props.id
  }

  get email(): string {
    return this.props.email
  }

  get name(): string {
    return this.props.name
  }

  get role(): UserRole {
    return this.props.role
  }

  get institution(): string | undefined {
    return this.props.institution
  }

  get createdAt(): Date {
    return this.props.createdAt!
  }

  get updatedAt(): Date {
    return this.props.updatedAt!
  }

  // Business methods
  isAdmin(): boolean {
    return false
  }

  isResearcher(): boolean {
    return this.props.role === "researcher"
  }

  isReviewer(): boolean {
    return false
  }

  canCreateProject(): boolean {
    return true
  }

  canReviewReference(): boolean {
    return true // Todos los roles pueden revisar referencias
  }

  // Conversion methods
  toJSON(): UserProps {
    return { ...this.props }
  }

  static fromJSON(json: any): User {
    return new User({
      id: json.id,
      email: json.email,
      name: json.name,
      role: json.role,
      institution: json.institution,
      createdAt: json.createdAt ? new Date(json.createdAt) : undefined,
      updatedAt: json.updatedAt ? new Date(json.updatedAt) : undefined,
    })
  }
}
