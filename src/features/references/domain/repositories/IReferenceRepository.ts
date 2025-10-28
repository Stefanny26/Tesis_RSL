/**
 * Repository Interface: IReferenceRepository
 * 
 * Define el contrato para operaciones con referencias bibliográficas.
 */

import { Reference } from "../entities/Reference"

export interface CreateReferenceData {
  projectId: string
  title: string
  authors: string[]
  year: number
  abstract: string
  source: string
  doi?: string
}

export interface UpdateReferenceData {
  title?: string
  authors?: string[]
  year?: number
  abstract?: string
  source?: string
  doi?: string
  status?: "pending" | "included" | "excluded" | "duplicate"
  screeningScore?: number
  reviewedBy?: string
  notes?: string
}

export interface IReferenceRepository {
  /**
   * Crea una nueva referencia
   */
  create(data: CreateReferenceData): Promise<Reference>

  /**
   * Obtiene una referencia por su ID
   */
  findById(id: string): Promise<Reference | null>

  /**
   * Obtiene todas las referencias de un proyecto
   */
  findByProjectId(projectId: string): Promise<Reference[]>

  /**
   * Obtiene referencias filtradas por estado
   */
  findByStatus(projectId: string, status: "pending" | "included" | "excluded" | "duplicate"): Promise<Reference[]>

  /**
   * Actualiza una referencia existente
   */
  update(id: string, data: UpdateReferenceData): Promise<Reference>

  /**
   * Elimina una referencia
   */
  delete(id: string): Promise<void>

  /**
   * Importa múltiples referencias en batch
   */
  importBatch(projectId: string, references: CreateReferenceData[]): Promise<Reference[]>

  /**
   * Busca referencias por texto en título o abstract
   */
  search(projectId: string, query: string): Promise<Reference[]>
}
