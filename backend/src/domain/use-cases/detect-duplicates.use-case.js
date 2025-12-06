const ReferenceRepository = require('../../infrastructure/repositories/reference.repository');

/**
 * Caso de uso para detectar referencias duplicadas
 * Usa similitud de títulos y DOI para identificar duplicados
 */
class DetectDuplicatesUseCase {
  constructor() {
    this.referenceRepository = new ReferenceRepository();
  }

  /**
   * Detecta duplicados en un proyecto
   */
  async execute(projectId) {
    try {
      // Obtener todas las referencias del proyecto
      const references = await this.referenceRepository.findByProject(projectId);

      if (references.length < 2) {
        return {
          duplicates: [],
          groups: [],
          stats: {
            total: references.length,
            unique: references.length,
            duplicates: 0,
            duplicateGroups: 0
          }
        };
      }

      const duplicateGroups = [];
      const processedIds = new Set();

      // Comparar cada referencia con las demás
      for (let i = 0; i < references.length; i++) {
        if (processedIds.has(references[i].id)) continue;

        const group = [references[i]];
        
        for (let j = i + 1; j < references.length; j++) {
          if (processedIds.has(references[j].id)) continue;

          if (this._areDuplicates(references[i], references[j])) {
            group.push(references[j]);
            processedIds.add(references[j].id);
          }
        }

        if (group.length > 1) {
          duplicateGroups.push({
            originalId: group[0].id,
            originalTitle: group[0].title,
            duplicates: group.slice(1).map(ref => ({
              id: ref.id,
              title: ref.title,
              authors: ref.authors,
              year: ref.year,
              doi: ref.doi,
              source: ref.source || ref.database,
              similarity: this._calculateSimilarity(group[0].title, ref.title)
            })),
            count: group.length
          });
          processedIds.add(references[i].id);
        }
      }

      // Marcar duplicados en la base de datos
      const duplicateIds = duplicateGroups.flatMap(g => g.duplicates.map(d => d.id));
      if (duplicateIds.length > 0) {
        await this._markAsDuplicates(duplicateIds);
      }

      return {
        duplicates: duplicateIds,
        groups: duplicateGroups,
        stats: {
          total: references.length,
          unique: references.length - duplicateIds.length,
          duplicates: duplicateIds.length,
          duplicateGroups: duplicateGroups.length
        }
      };
    } catch (error) {
      console.error('Error detectando duplicados:', error);
      throw error;
    }
  }

  /**
   * Determina si dos referencias son duplicadas
   */
  _areDuplicates(ref1, ref2) {
    // 1. Si tienen el mismo DOI (y no está vacío), son duplicados
    if (ref1.doi && ref2.doi && ref1.doi.trim() !== '') {
      if (this._normalizeDOI(ref1.doi) === this._normalizeDOI(ref2.doi)) {
        return true;
      }
    }

    // 2. Comparar títulos normalizados
    const similarity = this._calculateSimilarity(ref1.title, ref2.title);
    
    // Si la similitud es muy alta (>= 85%), son duplicados
    if (similarity >= 85) {
      return true;
    }

    // Si la similitud es alta (>= 75%) y los autores coinciden, son duplicados
    if (similarity >= 75 && this._sameAuthors(ref1.authors, ref2.authors)) {
      return true;
    }

    // Si los títulos son muy similares (>= 80%) y el año coincide
    if (similarity >= 80 && ref1.year === ref2.year) {
      return true;
    }

    return false;
  }

  /**
   * Calcula similitud entre dos títulos usando algoritmo de Levenshtein
   */
  _calculateSimilarity(title1, title2) {
    const t1 = this._normalizeTitle(title1);
    const t2 = this._normalizeTitle(title2);

    if (t1 === t2) return 100;

    const distance = this._levenshteinDistance(t1, t2);
    const maxLength = Math.max(t1.length, t2.length);
    const similarity = ((maxLength - distance) / maxLength) * 100;

    return Math.round(similarity);
  }

  /**
   * Normaliza un título para comparación
   */
  _normalizeTitle(title) {
    if (!title) return '';
    
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
      .replace(/[^a-z0-9\s]/g, '') // Solo letras, números y espacios
      .replace(/\s+/g, ' ') // Normalizar espacios
      .trim();
  }

  /**
   * Normaliza DOI para comparación
   */
  _normalizeDOI(doi) {
    if (!doi) return '';
    return doi.toLowerCase().replace(/https?:\/\/(dx\.)?doi\.org\//gi, '').trim();
  }

  /**
   * Verifica si dos arrays de autores son similares
   */
  _sameAuthors(authors1, authors2) {
    if (!authors1 || !authors2) return false;
    
    const a1 = Array.isArray(authors1) ? authors1 : [authors1];
    const a2 = Array.isArray(authors2) ? authors2 : [authors2];

    if (a1.length === 0 || a2.length === 0) return false;

    // Normalizar nombres de autores
    const normalize = (author) => author.toLowerCase().replace(/[^a-z\s]/g, '').trim();
    const set1 = new Set(a1.map(normalize));
    const set2 = new Set(a2.map(normalize));

    // Contar coincidencias
    let matches = 0;
    for (const author of set1) {
      if (set2.has(author)) matches++;
    }

    // Si al menos 50% de los autores coinciden
    return matches / Math.max(set1.size, set2.size) >= 0.5;
  }

  /**
   * Calcula distancia de Levenshtein entre dos strings
   */
  _levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // Sustitución
            matrix[i][j - 1] + 1, // Inserción
            matrix[i - 1][j] + 1 // Eliminación
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Marca referencias como duplicadas en la base de datos
   */
  async _markAsDuplicates(referenceIds) {
    for (const id of referenceIds) {
      await this.referenceRepository.update(id, { status: 'duplicate' });
    }
  }
}

module.exports = DetectDuplicatesUseCase;

