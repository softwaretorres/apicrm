import { Request, Response, NextFunction } from 'express';
import { JWTService } from '@/services/JWTService';
import { UserService } from '@/services/UserService';
import { AppDataSource } from '@/config/database';
import { OAuthAccessToken } from '@/entities/OAuthAccessToken';

interface AuthenticatedRequest extends Request {
  user?: any;
  token?: string;
}

export class AuthMiddleware {
  private jwtService: JWTService;
  private userService: UserService;

  constructor() {
    this.jwtService = new JWTService();
    this.userService = new UserService();
  }

  /**
   * Middleware de autenticación compatible con Laravel Passport
   */
  public authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = this.extractToken(req);
      
      if (!token) {
        res.status(401).json({
          message: 'Unauthorized',
          error: 'Token not provided'
        });
        return;
      }

      // Verificar JWT
      const payload = this.jwtService.verifyToken(token);
      
      // Verificar en la base de datos (compatible con Laravel Passport)
      const accessTokenRepository = AppDataSource.getRepository(OAuthAccessToken);
      const accessToken = await accessTokenRepository.findOne({
        where: { id: payload.jti },
        relations: ['user']
      });

      if (!accessToken) {
        res.status(401).json({
          message: 'Unauthorized',
          error: 'Token not found in database'
        });
        return;
      }

      if (accessToken.revoked) {
        res.status(401).json({
          message: 'Unauthorized',
          error: 'Token has been revoked'
        });
        return;
      }

      if (new Date() > accessToken.expiresAt) {
        res.status(401).json({
          message: 'Unauthorized',
          error: 'Token has expired'
        });
        return;
      }

      // Verificar usuario
      const user = await this.userService.findById(parseInt(payload.sub));
      if (!user || !user.active) {
        res.status(401).json({
          message: 'Unauthorized',
          error: 'User not found or inactive'
        });
        return;
      }

      // Agregar información al request
      req.user = user;
      req.token = token;
      
      next();
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(401).json({
        message: 'Unauthorized',
        error: 'Invalid token'
      });
    }
  };

  /**
   * Middleware para verificar scopes específicos
   */
  public requireScopes = (requiredScopes: string[]) => {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
      try {
        const token = req.token;
        if (!token) {
          res.status(403).json({
            message: 'Forbidden',
            error: 'Token required for scope verification'
          });
          return;
        }

        const payload = this.jwtService.verifyToken(token);
        const tokenScopes = payload.scopes || [];

        // Si tiene scope '*', tiene acceso a todo
        if (tokenScopes.includes('*')) {
          next();
          return;
        }

        // Verificar si tiene los scopes requeridos
        const hasRequiredScopes = requiredScopes.every(scope => 
          tokenScopes.includes(scope)
        );

        if (!hasRequiredScopes) {
          res.status(403).json({
            message: 'Forbidden',
            error: 'Insufficient scopes',
            required: requiredScopes,
            provided: tokenScopes
          });
          return;
        }

        next();
      } catch (error) {
        console.error('Scope verification error:', error);
        res.status(403).json({
          message: 'Forbidden',
          error: 'Scope verification failed'
        });
      }
    };
  };

  /**
   * Middleware opcional (no falla si no hay token)
   */
  public optional = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = this.extractToken(req);
      
      if (token) {
        const payload = this.jwtService.verifyToken(token);
        const user = await this.userService.findById(parseInt(payload.sub));
        
        if (user && user.active) {
          req.user = user;
          req.token = token;
        }
      }
      
      next();
    } catch (error) {
      // En modo opcional, continuamos sin autenticar
      next();
    }
  };

  /**
   * Extraer token del header Authorization
   */
  private extractToken(req: Request): string | null {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return null;
    }

    // Soportar ambos formatos: "Bearer token" y "Bearer: token"
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      return parts[1];
    }

    return null;
  }
}