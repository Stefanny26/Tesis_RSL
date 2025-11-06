export interface ArticleVersion {
  id: string
  projectId: string
  version: number
  title: string
  content: {
    abstract: string
    introduction: string
    methods: string
    results: string
    discussion: string
    conclusions: string
    references: string
  }
  createdAt: Date
  createdBy: string
  changeDescription: string
  wordCount: number
  isPublished: boolean
}

export interface ArticleSection {
  id: string
  title: string
  content: string
  order: number
}
