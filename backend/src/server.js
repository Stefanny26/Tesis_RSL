require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const database = require('./config/database');
const setupPassport = require('./config/passport-setup');

// Importar rutas
const authRoutes = require('./api/routes/auth.routes');
const projectRoutes = require('./api/routes/project.routes');
const protocolRoutes = require('./api/routes/protocol.routes');
const aiRoutes = require('./api/routes/ai.routes');
const referenceRoutes = require('./api/routes/reference.routes');

/**
 * Servidor principal de la aplicación
 */
class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3001;
    
    this.initializeMiddlewares();
    this.initializePassport();
    this.initializeRoutes();
    this.initializeErrorHandlers();
  }

  /**
   * Configurar middlewares globales
   */
  initializeMiddlewares() {
    // CORS
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Body parsers
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging middleware
    this.app.use((req, res, next) => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] ${req.method} ${req.path}`);
      next();
    });
  }

  /**
   * Configurar Passport
   */
  initializePassport() {
    setupPassport();
    this.app.use(passport.initialize());
  }

  /**
   * Configurar rutas
   */
  initializeRoutes() {
    // Ruta de health check
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'API funcionando correctamente',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0'
      });
    });

    // Rutas principales
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/projects', projectRoutes);
    this.app.use('/api/projects', protocolRoutes);
    this.app.use('/api/ai', aiRoutes);
    this.app.use('/api/references', referenceRoutes);

    // Ruta 404
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        message: 'Endpoint no encontrado',
        path: req.originalUrl
      });
    });
  }

  /**
   * Configurar manejadores de errores
   */
  initializeErrorHandlers() {
    // Manejador de errores global
    this.app.use((err, req, res, next) => {
      console.error('❌ Error no manejado:', err);

      const statusCode = err.statusCode || 500;
      const message = err.message || 'Error interno del servidor';

      res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
      });
    });
  }

  /**
   * Conectar a la base de datos
   */
  async connectDatabase() {
    try {
      await database.connect();
      console.log('✅ Base de datos conectada');
    } catch (error) {
      console.error('❌ Error conectando a la base de datos:', error);
      process.exit(1);
    }
  }

  /**
   * Iniciar el servidor
   */
  async start() {
    try {
      // Conectar a la base de datos
      await this.connectDatabase();

      // Iniciar servidor HTTP
      this.app.listen(this.port, () => {
        console.log('');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🚀 Servidor iniciado exitosamente');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📍 URL: http://localhost:${this.port}`);
        console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🔗 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
        console.log('');
        console.log('📡 Endpoints disponibles:');
        console.log(`   GET  http://localhost:${this.port}/health`);
        console.log(`   POST http://localhost:${this.port}/api/auth/register`);
        console.log(`   POST http://localhost:${this.port}/api/auth/login`);
        console.log(`   GET  http://localhost:${this.port}/api/auth/google`);
        console.log(`   GET  http://localhost:${this.port}/api/projects`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('');
      });

      // Manejo de señales para cierre graceful
      process.on('SIGTERM', () => this.shutdown());
      process.on('SIGINT', () => this.shutdown());

    } catch (error) {
      console.error('❌ Error iniciando el servidor:', error);
      process.exit(1);
    }
  }

  /**
   * Cerrar servidor gracefully
   */
  async shutdown() {
    console.log('\n🛑 Cerrando servidor...');
    
    try {
      await database.disconnect();
      console.log('✅ Conexiones cerradas correctamente');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error cerrando conexiones:', error);
      process.exit(1);
    }
  }
}

// Crear e iniciar servidor
const server = new Server();
server.start();

// Exportar para pruebas
module.exports = server;
