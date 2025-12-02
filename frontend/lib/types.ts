export type ProjectStatus = "draft" | "in-progress" | "screening" | "analysis" | "completed"

export interface Project {
  id: string
  title: string
  description: string
  status: ProjectStatus
  createdAt: Date
  updatedAt: Date
  ownerId: string
  ownerName: string
  collaborators: string[]
  protocol?: {
    researchQuestions: string[]
    picoFramework?: {
      population: string
      intervention: string
      comparison: string
      outcome: string
    }
    inclusionCriteria: string[]
    exclusionCriteria: string[]
  }
  references?: {
    total: number
    screened: number
    included: number
    excluded: number
  }
  prismaCompliance?: number
}

export interface Reference {
  id: string
  projectId: string
  title: string
  authors: string[]
  year: number
  abstract: string
  source: string
  doi?: string
  url?: string
  database?: string
  keywords?: string
  status: "pending" | "included" | "excluded" | "duplicate" | "maybe"
  screeningScore?: number
  reviewedBy?: string
  reviewedAt?: Date
  notes?: string
}
