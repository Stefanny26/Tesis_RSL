/**
 * Domain Entity: Project
 * 
 * Representa un proyecto de Revisión Sistemática de Literatura.
 */

export type ProjectStatus = "draft" | "in-progress" | "screening" | "analysis" | "completed"

export interface PicoFramework {
  population: string
  intervention: string
  comparison: string
  outcome: string
}

export interface ProjectProtocol {
  researchQuestions: string[]
  picoFramework?: PicoFramework
  inclusionCriteria: string[]
  exclusionCriteria: string[]
}

export interface ProjectReferences {
  total: number
  screened: number
  included: number
  excluded: number
}

export interface ProjectProps {
  id: string
  title: string
  description: string
  status: ProjectStatus
  ownerId: string
  ownerName: string
  collaborators: string[]
  protocol?: ProjectProtocol
  references?: ProjectReferences
  prismaCompliance?: number
  createdAt?: Date
  updatedAt?: Date
}

export class Project {
  private readonly props: ProjectProps

  constructor(props: ProjectProps) {
    this.validateProps(props)
    this.props = {
      ...props,
      collaborators: props.collaborators || [],
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    }
  }

  private validateProps(props: ProjectProps): void {
    if (!props.id || props.id.trim() === "") {
      throw new Error("Project ID is required")
    }
    if (!props.title || props.title.trim() === "") {
      throw new Error("Project title is required")
    }
    if (!props.ownerId || props.ownerId.trim() === "") {
      throw new Error("Project owner ID is required")
    }
    const validStatuses: ProjectStatus[] = ["draft", "in-progress", "screening", "analysis", "completed"]
    if (!validStatuses.includes(props.status)) {
      throw new Error("Invalid project status")
    }
  }

  // Getters
  get id(): string {
    return this.props.id
  }

  get title(): string {
    return this.props.title
  }

  get description(): string {
    return this.props.description
  }

  get status(): ProjectStatus {
    return this.props.status
  }

  get ownerId(): string {
    return this.props.ownerId
  }

  get ownerName(): string {
    return this.props.ownerName
  }

  get collaborators(): string[] {
    return [...this.props.collaborators]
  }

  get protocol(): ProjectProtocol | undefined {
    return this.props.protocol
  }

  get references(): ProjectReferences | undefined {
    return this.props.references
  }

  get prismaCompliance(): number | undefined {
    return this.props.prismaCompliance
  }

  get createdAt(): Date {
    return this.props.createdAt!
  }

  get updatedAt(): Date {
    return this.props.updatedAt!
  }

  // Business methods
  isOwner(userId: string): boolean {
    return this.props.ownerId === userId
  }

  isCollaborator(userId: string): boolean {
    return this.props.collaborators.includes(userId)
  }

  canEdit(userId: string): boolean {
    return this.isOwner(userId) || this.isCollaborator(userId)
  }

  isCompleted(): boolean {
    return this.props.status === "completed"
  }

  isActive(): boolean {
    return this.props.status === "in-progress" || this.props.status === "screening"
  }

  getScreeningProgress(): number {
    if (!this.props.references || this.props.references.total === 0) {
      return 0
    }
    return Math.round((this.props.references.screened / this.props.references.total) * 100)
  }

  // Conversion methods
  toJSON(): ProjectProps {
    return { ...this.props }
  }

  static fromJSON(json: any): Project {
    return new Project({
      id: json.id,
      title: json.title,
      description: json.description,
      status: json.status,
      ownerId: json.ownerId,
      ownerName: json.ownerName,
      collaborators: json.collaborators || [],
      protocol: json.protocol,
      references: json.references,
      prismaCompliance: json.prismaCompliance,
      createdAt: json.createdAt ? new Date(json.createdAt) : undefined,
      updatedAt: json.updatedAt ? new Date(json.updatedAt) : undefined,
    })
  }
}
