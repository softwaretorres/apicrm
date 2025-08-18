import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// Rate limit general para autenticación
export const rateLimitMiddleware = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '5'), // 5 intentos por IP
  message: {
    error: 'Too many attempts, please try again later',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    // Usar IP + User-Agent para ser más específico
    return `${req.ip}-${req.get('User-Agent') || 'unknown'}`;
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      message: 'Too many requests',
      error: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') / 1000 / 60) + ' minutes'
    });
  }
});

// Rate limit más estricto para login
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 3, // 3 intentos por IP
  message: {
    error: 'Too many login attempts, please try again later',
    retryAfter: '15 minutes'
  },
  skipSuccessfulRequests: true, // No contar requests exitosos
  keyGenerator: (req: Request) => {
    // Rate limit por IP y email para login
    const email = req.body?.email || 'unknown';
    return `login-${req.ip}-${email}`;
  }
});

// Rate limit para registro
export const registerRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // 3 registros por IP por hora
  message: {
    error: 'Too many registration attempts, please try again later',
    retryAfter: '1 hour'
  },
  keyGenerator: (req: Request) => `register-${req.ip}`
});

// Rate limit para reset de contraseña
export const passwordResetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // 3 intentos por IP por hora
  message: {
    error: 'Too many password reset attempts, please try again later',
    retryAfter: '1 hour'
  },
  keyGenerator: (req: Request) => {
    const email = req.body?.email || 'unknown';
    return `reset-${req.ip}-${email}`;
  }
});

// Rate limit general para API
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por IP
  message: {
    error: 'API rate limit exceeded',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});