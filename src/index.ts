
import dotenv from 'dotenv';
dotenv.config();


import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { initializeDatabase } from './config/database';
import { Logger } from './utils/Logger';
import { setupSwagger } from './config/swagger'; // ✅ AGREGAR ESTA LÍNEA
import { apiRateLimit } from './middlewares/RateLimitMiddleware';
import routes from './routes';

// Cargar variables de entorno

const app = express();
const logger = new Logger();
const PORT = process.env.PORT || 3000;
const API_VERSION = process.env.API_VERSION || 'v1';

setupSwagger(app);



// Configurar middlewares de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware de compresión
app.use(compression());

// Middleware de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging de requests
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: {
      write: (message: string) => {
        logger.info(message.trim());
      }
    }
  }));
}

// Rate limiting global
app.use(apiRateLimit);

// Trust proxy (para obtener IPs reales detrás de proxies/load balancers)
app.set('trust proxy', 1);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: process.env.SERVICE_NAME || 'auth-service',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use(`/api/${API_VERSION}`, routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Node.js Microservice - Laravel Passport Compatible',
    version: API_VERSION,
    documentation: `/api/${API_VERSION}/docs`,
    health: '/health'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Route not found',
    error: `The route ${req.method} ${req.originalUrl} does not exist`,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', error);

  // No enviar stack trace en producción
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(error.status || 500).json({
    message: 'Internal server error',
    error: isDevelopment ? error.message : 'Something went wrong',
    ...(isDevelopment && { stack: error.stack }),
    timestamp: new Date().toISOString()
  });
});

// Función para iniciar el servidor
async function startServer(): Promise<void> {
  try {
    // Inicializar base de datos
    await initializeDatabase();
    logger.info('✅ Database initialized successfully');

    // Iniciar servidor
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📖 API Documentation: http://localhost:${PORT}/api/${API_VERSION}/docs`);
      logger.info(`🏥 Health Check: http://localhost:${PORT}/health`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Graceful shutdown
    const shutdown = (signal: string) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      
      server.close((err) => {
        if (err) {
          logger.error('Error during server shutdown:', err);
          process.exit(1);
        }
        
        logger.info('Server closed. Exiting process...');
        process.exit(0);
      });

      // Force close after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after 30 seconds timeout');
        process.exit(1);
      }, 30000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection', { 
        promise: promise.toString(), 
        reason: reason 
      });
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Iniciar aplicación solo si no estamos en modo test
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;