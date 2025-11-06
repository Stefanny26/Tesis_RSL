const { Pool } = require('pg');

/**
 * Configuración y conexión a PostgreSQL
 */
class Database {
  constructor() {
    this.pool = null;
  }

  /**
   * Inicializa el pool de conexiones
   */
  async connect() {
    try {
      // Priorizar DATABASE_URL si está disponible
      const config = process.env.DATABASE_URL
        ? {
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
          }
        : {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432'),
            database: process.env.DB_NAME || 'thesis_rsl',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            max: 20, // Máximo de conexiones en el pool
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
          };

      this.pool = new Pool(config);

      // Probar la conexión
      const client = await this.pool.connect();
      console.log('✅ Conectado a PostgreSQL exitosamente');
      
      // Verificar extensiones necesarias
      try {
        await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
        await client.query('CREATE EXTENSION IF NOT EXISTS vector');
        console.log('✅ Extensiones de PostgreSQL verificadas');
      } catch (extError) {
        console.warn('⚠️  No se pudieron crear las extensiones (puede que ya existan o no tengas permisos):', extError.message);
      }
      
      client.release();

      // Manejar errores del pool
      this.pool.on('error', (err) => {
        console.error('❌ Error inesperado en el pool de PostgreSQL:', err);
      });

      return this.pool;
    } catch (error) {
      console.error('❌ Error conectando a PostgreSQL:', error);
      throw error;
    }
  }

  /**
   * Obtiene el pool de conexiones
   */
  getPool() {
    if (!this.pool) {
      throw new Error('Base de datos no conectada. Ejecuta connect() primero.');
    }
    return this.pool;
  }

  /**
   * Ejecuta una consulta
   */
  async query(text, params) {
    try {
      const start = Date.now();
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      
      if (process.env.LOG_LEVEL === 'debug') {
        console.log('📊 Query ejecutado:', { text, duration, rows: result.rowCount });
      }
      
      return result;
    } catch (error) {
      console.error('❌ Error en query:', error);
      throw error;
    }
  }

  /**
   * Inicia una transacción
   */
  async transaction(callback) {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Cierra todas las conexiones
   */
  async disconnect() {
    if (this.pool) {
      await this.pool.end();
      console.log('✅ Conexiones a PostgreSQL cerradas');
    }
  }
}

// Exportar instancia única (Singleton)
const database = new Database();
module.exports = database;
