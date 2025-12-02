/**
 * Caso de uso: Exportar referencias a diferentes formatos
 * Versión simplificada - soporta CSV y JSON
 */
class ExportReferencesUseCase {
  constructor(referenceRepository) {
    this.referenceRepository = referenceRepository;
  }

  /**
   * Ejecuta la exportación de referencias
   * @param {string} projectId - ID del proyecto
   * @param {string} format - Formato de exportación (csv, json)
   * @param {Object} filters - Filtros opcionales para las referencias
   * @returns {Promise<Object>} - Contenido formateado y metadata
   */
  async execute(projectId, format = 'csv', filters = {}) {
    // Obtener referencias del proyecto
    const references = await this.referenceRepository.findByProjectId(
      projectId,
      filters,
      10000, // límite alto para exportación
      0
    );

    if (references.length === 0) {
      throw new Error('No hay referencias para exportar con los filtros especificados');
    }

    // Convertir a objetos planos
    const plainReferences = references.map(ref => 
      typeof ref.toJSON === 'function' ? ref.toJSON() : ref
    );

    let content;
    let mimeType;
    let extension;

    // Formatear según el formato solicitado
    switch (format.toLowerCase()) {
      case 'csv':
        content = this.formatCSV(plainReferences);
        mimeType = 'text/csv';
        extension = 'csv';
        break;
      case 'json':
        content = JSON.stringify(plainReferences, null, 2);
        mimeType = 'application/json';
        extension = 'json';
        break;
      default:
        throw new Error(`Formato de exportación no soportado: ${format}. Use csv o json.`);
    }

    return {
      content,
      mimeType,
      extension,
      filename: `references_${projectId}_${Date.now()}.${extension}`,
      count: references.length
    };
  }

  /**
   * Formatea referencias a CSV
   */
  formatCSV(references) {
    if (references.length === 0) return '';

    // Obtener todas las claves únicas
    const allKeys = new Set();
    references.forEach(ref => {
      Object.keys(ref).forEach(key => allKeys.add(key));
    });

    const headers = Array.from(allKeys);
    const rows = [headers.join(',')];

    references.forEach(ref => {
      const values = headers.map(header => {
        const value = ref[header] || '';
        // Escapar comillas y envolver en comillas si contiene comas
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      });
      rows.push(values.join(','));
    });

    return rows.join('\n');
  }
}

module.exports = ExportReferencesUseCase;

