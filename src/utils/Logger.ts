import winston from 'winston';
import path from 'path';

export class Logger {
  private logger: winston.Logger;

  constructor() {
    const logLevel = process.env.LOG_LEVEL || 'info';
    const logFormat = process.env.LOG_FORMAT || 'json';

    // Configurar formato de logs
    const customFormat = winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      winston.format.errors({ stack: true }),
      winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] })
    );

    // Formato para desarrollo (más legible)
    const developmentFormat = winston.format.combine(
      customFormat,
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, metadata }) => {
        let log = `${timestamp} [${level}]: ${message}`;
        
        // 🔧 Verificar que metadata es un objeto antes de usar Object.keys
        if (metadata && typeof metadata === 'object' && Object.keys(metadata).length > 0) {
          log += `\n${JSON.stringify(metadata, null, 2)}`;
        }
        
        return log;
      })
    );

    // Formato para producción (JSON estructurado)
    const productionFormat = winston.format.combine(
      customFormat,
      winston.format.json()
    );

    // Seleccionar formato según entorno
    const format = process.env.NODE_ENV === 'production' || logFormat === 'json' 
      ? productionFormat 
      : developmentFormat;

    // Configurar transports
    const transports: winston.transport[] = [];

    // Console transport
    if (process.env.NODE_ENV !== 'production') {
      transports.push(
        new winston.transports.Console({
          level: logLevel,
          format: developmentFormat
        })
      );
    }

    // File transports
    transports.push(
      // Todos los logs
      new winston.transports.File({
        filename: path.join('logs', 'app.log'),
        level: logLevel,
        format: productionFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5
      }),
      
      // Solo errores
      new winston.transports.File({
        filename: path.join('logs', 'error.log'),
        level: 'error',
        format: productionFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5
      })
    );

    // Crear logger
    this.logger = winston.createLogger({
      level: logLevel,
      format,
      transports,
      // Prevenir que los logs se corten abruptamente
      exitOnError: false
    });

    // Crear directorio de logs si no existe
    this.ensureLogDirectory();
  }

  private ensureLogDirectory(): void {
    const fs = require('fs');
    const logDir = 'logs';
    
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  // Métodos de logging
  public info(message: string, metadata?: any): void {
    this.logger.info(message, metadata);
  }

  public error(message: string, error?: Error | any): void {
    if (error instanceof Error) {
      this.logger.error(message, {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        }
      });
    } else if (error) {
      this.logger.error(message, { error });
    } else {
      this.logger.error(message);
    }
  }

  public warn(message: string, metadata?: any): void {
    this.logger.warn(message, metadata);
  }

  public debug(message: string, metadata?: any): void {
    this.logger.debug(message, metadata);
  }

  public verbose(message: string, metadata?: any): void {
    this.logger.verbose(message, metadata);
  }

  // Métodos específicos para el contexto de la aplicación
  public logRequest(req: any, res: any, responseTime?: number): void {
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      ...(responseTime && { responseTime: `${responseTime}ms` }),
      ...(req.user && { userId: req.user.id })
    };

    if (res.statusCode >= 400) {
      this.error('HTTP Request Error', logData);
    } else {
      this.info('HTTP Request', logData);
    }
  }

  public logAuth(action: string, userId?: number, details?: any): void {
    this.info(`Auth: ${action}`, {
      userId,
      ...details
    });
  }

  public logDatabase(action: string, table?: string, details?: any): void {
    this.debug(`Database: ${action}`, {
      table,
      ...details
    });
  }

  public logEmail(action: string, to?: string, details?: any): void {
    this.info(`Email: ${action}`, {
      to,
      ...details
    });
  }

  public logSecurity(event: string, details?: any): void {
    this.warn(`Security: ${event}`, details);
  }

  // Método para obtener el logger de Winston directamente
  public getWinstonLogger(): winston.Logger {
    return this.logger;
  }

  // Método para logging de performance
  public logPerformance(operation: string, duration: number, details?: any): void {
    const level = duration > 1000 ? 'warn' : 'info'; // Warn si toma más de 1 segundo
    
    this.logger.log(level, `Performance: ${operation}`, {
      duration: `${duration}ms`,
      ...details
    });
  }

  // Stream para Morgan (logging de HTTP requests)
  public stream = {
    write: (message: string) => {
      this.info(message.trim());
    }
  };
}