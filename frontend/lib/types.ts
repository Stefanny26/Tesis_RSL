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
  researchArea?: string // Área de investigación del proyecto
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
  // prismaCompliance deprecado - ahora se calcula desde API /prisma
  // prismaCompliance?: number
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
  fullTextAvailable?: boolean
  fullTextUrl?: string
  fullTextPath?: string
  aiClassification?: string
  aiReasoning?: string
  aiConfidenceScore?: number
  confidenceThreshold?: number
  matchedCriteria?: string[]
  screeningMethod?: string
  screeningModel?: string
  screeningStatus?: string // 'pending', 'phase1_included', 'phase1_excluded', 'phase2_included', 'phase2_excluded', 'fulltext_included', 'fulltext_excluded'
  exclusionReason?: string
}
