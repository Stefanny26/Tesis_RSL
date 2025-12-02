const BSON = require('bson');

/**
 * Middleware para serializar respuestas grandes con BSON
 * BSON es más eficiente que JSON para datos grandes
 */
const bsonMiddleware = (req, res, next) => {
  // Guardar el método JSON original
  const originalJson = res.json.bind(res);

  // Override res.json para usar BSON en respuestas grandes
  res.json = function(data) {
    // Si el cliente acepta BSON
    const acceptsBson = req.headers['accept']?.includes('application/bson');
    
    // Si la respuesta es grande (> 50KB) y el cliente acepta BSON
    const jsonSize = JSON.stringify(data).length;
    const useBson = acceptsBson && jsonSize > 50000;

    if (useBson) {
      try {
        const bsonData = BSON.serialize(data);
        res.setHeader('Content-Type', 'application/bson');
        res.setHeader('X-Original-Size', jsonSize);
        res.setHeader('X-Compressed-Size', bsonData.length);
        res.setHeader('X-Compression-Ratio', ((1 - bsonData.length / jsonSize) * 100).toFixed(2) + '%');
        return res.send(bsonData);
      } catch (error) {
        console.warn('⚠️  Error serializando con BSON, usando JSON:', error.message);
        return originalJson(data);
      }
    }

    // Usar JSON normal para respuestas pequeñas o clientes que no soportan BSON
    return originalJson(data);
  };

  next();
};

/**
 * Helper para comprimir JSON grandes (fallback si no se usa BSON)
 */
const compressJson = (data) => {
  try {
    // Remover espacios innecesarios
    return JSON.stringify(data, null, 0);
  } catch (error) {
    return JSON.stringify(data);
  }
};

module.exports = { bsonMiddleware, compressJson };
