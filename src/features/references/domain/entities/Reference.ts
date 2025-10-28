/**
 * Domain Entity: Reference
 * 
 * Representa una referencia bibliográfica en un proyecto RSL.
 */

export type ReferenceStatus = "pending" | "included" | "excluded" | "duplicate"

export interface ReferenceProps {
  id: string
  projectId: string
  title: string
  authors: string[]
  year: number
  abstract: string
  source: string
  doi?: string
  status: ReferenceStatus
  screeningScore?: number
  reviewedBy?: string
  reviewedAt?: Date
  notes?: string
  createdAt?: Date
  updatedAt?: Date
}

export class Reference {
  private readonly props: ReferenceProps

  constructor(props: ReferenceProps) {
    this.validateProps(props)
    this.props = {
      ...props,
      authors: props.authors || [],
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    }
  }

  private validateProps(props: ReferenceProps): void {
    if (!props.id || props.id.trim() === "") {
      throw new Error("Reference ID is required")
    }
    if (!props.projectId || props.projectId.trim() === "") {
      throw new Error("Project ID is required")
    }
    if (!props.title || props.title.trim() === "") {
      throw new Error("Reference title is required")
    }
    if (!props.year || props.year < 1900 || props.year > new Date().getFullYear() + 1) {
      throw new Error("Valid publication year is required")
    }
    const validStatuses: ReferenceStatus[] = ["pending", "included", "excluded", "duplicate"]
    if (!validStatuses.includes(props.status)) {
      throw new Error("Invalid reference status")
    }
  }

  // Getters
  get id(): string {
    return this.props.id
  }

  get projectId(): string {
    return this.props.projectId
  }

  get title(): string {
    return this.props.title
  }

  get authors(): string[] {
    return [...this.props.authors]
  }

  get year(): number {
    return this.props.year
  }

  get abstract(): string {
    return this.props.abstract
  }

  get source(): string {
    return this.props.source
  }

  get doi(): string | undefined {
    return this.props.doi
  }

  get status(): ReferenceStatus {
    return this.props.status
  }

  get screeningScore(): number | undefined {
    return this.props.screeningScore
  }

  get reviewedBy(): string | undefined {
    return this.props.reviewedBy
  }

  get reviewedAt(): Date | undefined {
    return this.props.reviewedAt
  }

  get notes(): string | undefined {
    return this.props.notes
  }

  get createdAt(): Date {
    return this.props.createdAt!
  }

  get updatedAt(): Date {
    return this.props.updatedAt!
  }

  // Business methods
  isPending(): boolean {
    return this.props.status === "pending"
  }

  isIncluded(): boolean {
    return this.props.status === "included"
  }

  isExcluded(): boolean {
    return this.props.status === "excluded"
  }

  isDuplicate(): boolean {
    return this.props.status === "duplicate"
  }

  isReviewed(): boolean {
    return this.props.status !== "pending"
  }

  getAuthorsString(): string {
    return this.props.authors.join(", ")
  }

  // Conversion methods
  toJSON(): ReferenceProps {
    return { ...this.props }
  }

  static fromJSON(json: any): Reference {
    return new Reference({
      id: json.id,
      projectId: json.projectId,
      title: json.title,
      authors: json.authors || [],
      year: json.year,
      abstract: json.abstract,
      source: json.source,
      doi: json.doi,
      status: json.status,
      screeningScore: json.screeningScore,
      reviewedBy: json.reviewedBy,
      reviewedAt: json.reviewedAt ? new Date(json.reviewedAt) : undefined,
      notes: json.notes,
      createdAt: json.createdAt ? new Date(json.createdAt) : undefined,
      updatedAt: json.updatedAt ? new Date(json.updatedAt) : undefined,
    })
  }
}
