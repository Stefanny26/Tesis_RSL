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
const prismaRoutes = require('./api/routes/prisma.routes');
const articleRoutes = require('./api/routes/article.routes');
const aiRoutes = require('./api/routes/ai.routes');
const referenceRoutes = require('./api/routes/reference.routes');
const screeningRoutes = require('./api/routes/screening.routes');
const usageRoutes = require('./api/routes/usage.routes');
const adminRoutes = require('./api/routes/admin.routes');
const rqsRoutes = require('./api/routes/rqs.routes');

// Importar middleware BSON
const { bsonMiddleware } = require('./infrastructure/middlewares/bson.middleware');

// Importar módulos para verificación de Python
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

/**
 * Verificar que Python y las dependencias estén instaladas
 */
async function verifyPythonEnvironment() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 VERIFICANDO ENTORNO PYTHON');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
  
  try {
    // Verificar versión de Python
    const { stdout: pythonVersion } = await execPromise(`${pythonCommand} --version`);
    console.log('✅ Python encontrado:', pythonVersion.trim());

    // Verificar matplotlib
    try {
      const { stdout: matplotlibVersion } = await execPromise(
        `${pythonCommand} -c "import matplotlib; print(matplotlib.__version__)"`
      );
      console.log('✅ Matplotlib instalado:', matplotlibVersion.trim());
    } catch (error) {
      console.error('❌ Matplotlib NO instalado');
      console.error('   Error:', error.message);
    }

    // Verificar pandas
    try {
      const { stdout: pandasVersion } = await execPromise(
        `${pythonCommand} -c "import pandas; print(pandas.__version__)"`
      );
      console.log('✅ Pandas instalado:', pandasVersion.trim());
    } catch (error) {
      console.error('❌ Pandas NO instalado');
      console.error('   Error:', error.message);
    }

    // Verificar que el script existe
    const path = require('path');
    const fs = require('fs');
    const scriptPath = path.join(__dirname, '../scripts/generate_charts.py');
    if (fs.existsSync(scriptPath)) {
      console.log('✅ Script generate_charts.py encontrado');
    } else {
      console.error('❌ Script generate_charts.py NO encontrado');
    }

    // Verificar carpeta de uploads
    const uploadsDir = path.join(__dirname, '../uploads/charts');
    if (fs.existsSync(uploadsDir)) {
      console.log('✅ Carpeta uploads/charts existe');
    } else {
      console.log('⚠️  Carpeta uploads/charts no existe (se creará automáticamente)');
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ VERIFICACIÓN DE PYTHON COMPLETADA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ ERROR: Python NO está instalado o no está en el PATH');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('Error:', error.message);
    console.error('\n⚠️  Las imágenes de gráficos NO se generarán.');
    console.error('   Solución: Actualiza el Build Command en Render a:');
    console.error('   npm install && pip3 install -r requirements.txt\n');
  }
}

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

    // Body parsers - Aumentar límite para artículos con imágenes base64
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    // Servir archivos estáticos (PDFs)
    const path = require('path');
    this.app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

    // BSON middleware para respuestas grandes
    this.app.use(bsonMiddleware);

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
    this.app.use('/api/projects', prismaRoutes);
    this.app.use('/api/projects', articleRoutes);
    this.app.use('/api/projects', rqsRoutes);
    this.app.use('/api/ai', aiRoutes);
    this.app.use('/api/references', referenceRoutes);
    this.app.use('/api/screening', screeningRoutes);
    this.app.use('/api/usage', usageRoutes);
    this.app.use('/api/admin', adminRoutes);

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

      // Verificar entorno Python (para generación de gráficos)
      await verifyPythonEnvironment();

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
