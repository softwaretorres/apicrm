import { Request, Response, NextFunction } from 'express';
import { JWTService } from '../services/JWTService';
import { UserService } from '../services/UserService';
import { RoleService } from '../services/RoleService';
import { AppDataSource } from '../config/database';
import { OAuthAccessToken } from '../entities/OAuthAccessToken';
import { AuthenticatedUser, TokenPayload } from '../types';

interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  token?: string;
}

export class AuthMiddleware {
  private jwtService: JWTService;
  private userService: UserService;
  private roleService: RoleService;

  constructor() {
    this.jwtService = new JWTService();
    this.userService = new UserService();
    this.roleService = new RoleService();
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
        relations: ['user', 'user.userRoles', 'user.userRoles.role', 'user.userRoles.role.rolePermissions', 'user.userRoles.role.rolePermissions.permission', 'user.organization']
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

      // Agregar información al request (mantener compatibilidad)
      req.user = await this.createAuthenticatedUser(user);
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
   * Crear objeto AuthenticatedUser con métodos de conveniencia
   */
  private async createAuthenticatedUser(user: any): Promise<AuthenticatedUser> {
    const userRoles = await this.roleService.getUserRoles(user.id, user.organizationId);
    
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      avatar: user.avatar,
      active: user.active,
      lastLoginAt: user.lastLoginAt,
      organizationId: user.organizationId,
      invitedBy: user.invitedBy,
      invitationAcceptedAt: user.invitationAcceptedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      
      // Información extendida
      fullName: user.getFullName ? user.getFullName() : user.name,
      invitationPending: user.isInvitationPending ? user.isInvitationPending() : false,
      isActive: user.active,
      
      // Métodos de conveniencia para roles
      hasRole: async (roleName: string) => {
        return this.roleService.userHasRole(user.id, roleName, user.organizationId);
      },
      hasPermission: async (permissionName: string) => {
        return this.roleService.userHasPermission(user.id, permissionName, user.organizationId);
      },
      canAccessModule: async (module: string) => {
        return this.roleService.userCanAccessModule(user.id, module, user.organizationId);
      },
      isSuperAdmin: async () => {
        return this.roleService.userHasRole(user.id, 'super_admin');
      },
      isAdmin: async () => {
        return this.roleService.userHasRole(user.id, 'admin', user.organizationId);
      },
      
      // Información de roles
      activeRoles: userRoles.map(role => ({
        id: user.userRoles?.find((ur: any) => ur.roleId === role.id)?.id || 0,
        userId: user.id,
        roleId: role.id,
        organizationId: user.organizationId,
        role: {
          id: role.id,
          name: role.name,
          displayName: role.displayName
        }
      }))
    };
  }

  /**
   * Middleware para verificar scopes específicos (mantener compatibilidad)
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
   * NUEVO: Middleware para verificar roles específicos
   */
  public requireRole = (roles: string | string[]) => {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({
            message: 'Unauthorized',
            error: 'Authentication required'
          });
          return;
        }

        const roleArray = Array.isArray(roles) ? roles : [roles];
        const userId = req.user.id;
        const organizationId = req.user.organizationId;

        let hasRole = false;
        for (const role of roleArray) {
          if (await this.roleService.userHasRole(userId, role, organizationId)) {
            hasRole = true;
            break;
          }
        }

        if (!hasRole) {
          res.status(403).json({
            message: 'Forbidden',
            error: `Access denied. Required roles: ${roleArray.join(', ')}`,
            required_roles: roleArray
          });
          return;
        }

        next();
      } catch (error) {
        console.error('Role verification error:', error);
        res.status(500).json({
          message: 'Internal Server Error',
          error: 'Role verification failed'
        });
      }
    };
  };

  /**
   * NUEVO: Middleware para verificar permisos específicos
   */
  public requirePermission = (permissions: string | string[]) => {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({
            message: 'Unauthorized',
            error: 'Authentication required'
          });
          return;
        }

        const permissionArray = Array.isArray(permissions) ? permissions : [permissions];
        const userId = req.user.id;
        const organizationId = req.user.organizationId;

        let hasPermission = false;
        for (const permission of permissionArray) {
          if (await this.roleService.userHasPermission(userId, permission, organizationId)) {
            hasPermission = true;
            break;
          }
        }

        if (!hasPermission) {
          res.status(403).json({
            message: 'Forbidden',
            error: `Access denied. Required permissions: ${permissionArray.join(', ')}`,
            required_permissions: permissionArray
          });
          return;
        }

        next();
      } catch (error) {
        console.error('Permission verification error:', error);
        res.status(500).json({
          message: 'Internal Server Error',
          error: 'Permission verification failed'
        });
      }
    };
  };

  /**
   * NUEVO: Middleware para verificar acceso a módulos
   */
  public requireModuleAccess = (modules: string | string[]) => {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({
            message: 'Unauthorized',
            error: 'Authentication required'
          });
          return;
        }

        const moduleArray = Array.isArray(modules) ? modules : [modules];
        const userId = req.user.id;
        const organizationId = req.user.organizationId;

        let hasAccess = false;
        for (const module of moduleArray) {
          if (await this.roleService.userCanAccessModule(userId, module, organizationId)) {
            hasAccess = true;
            break;
          }
        }

        if (!hasAccess) {
          res.status(403).json({
            message: 'Forbidden',
            error: `Access denied to modules: ${moduleArray.join(', ')}`,
            required_modules: moduleArray
          });
          return;
        }

        next();
      } catch (error) {
        console.error('Module access verification error:', error);
        res.status(500).json({
          message: 'Internal Server Error',
          error: 'Module access verification failed'
        });
      }
    };
  };

  /**
   * NUEVO: Middleware para verificar pertenencia a organización
   */
  public requireOrganization = () => {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({
            message: 'Unauthorized',
            error: 'Authentication required'
          });
          return;
        }

        const organizationId = parseInt(req.params.organizationId) || req.user.organizationId;
        
        if (!organizationId) {
          res.status(400).json({
            message: 'Bad Request',
            error: 'Organization ID required'
          });
          return;
        }

        // Super admin puede acceder a cualquier organización
        if (await this.roleService.userHasRole(req.user.id, 'super_admin')) {
          next();
          return;
        }

        // Verificar si el usuario pertenece a la organización
        if (req.user.organizationId !== organizationId) {
          res.status(403).json({
            message: 'Forbidden',
            error: 'Access denied to this organization'
          });
          return;
        }

        next();
      } catch (error) {
        console.error('Organization verification error:', error);
        res.status(500).json({
          message: 'Internal Server Error',
          error: 'Organization verification failed'
        });
      }
    };
  };

  /**
   * NUEVO: Middleware solo para super admin
   */
  public requireSuperAdmin = () => {
    return this.requireRole('super_admin');
  };

  /**
   * NUEVO: Middleware para admin o super admin
   */
  public requireAdmin = () => {
    return this.requireRole(['super_admin', 'admin']);
  };

  /**
   * NUEVO: Middleware para verificar propiedad del recurso o permisos
   */
  public requireOwnershipOrPermission = (permission: string) => {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({
            message: 'Unauthorized',
            error: 'Authentication required'
          });
          return;
        }

        const userId = req.user.id;
        const resourceUserId = parseInt(req.params.userId) || parseInt(req.body.userId);
        const organizationId = req.user.organizationId;

        // Es el propio usuario
        if (userId === resourceUserId) {
          next();
          return;
        }

        // Tiene el permiso específico
        if (await this.roleService.userHasPermission(userId, permission, organizationId)) {
          next();
          return;
        }

        res.status(403).json({
          message: 'Forbidden',
          error: 'Access denied. You can only access your own resources or need specific permissions.'
        });
      } catch (error) {
        console.error('Ownership verification error:', error);
        res.status(500).json({
          message: 'Internal Server Error',
          error: 'Ownership verification failed'
        });
      }
    };
  };

  /**
   * Middleware opcional (no falla si no hay token) - MANTENER COMPATIBILIDAD
   */
  public optional = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = this.extractToken(req);
      
      if (token) {
        const payload = this.jwtService.verifyToken(token);
        const user = await this.userService.findById(parseInt(payload.sub));
        
        if (user && user.active) {
          req.user = await this.createAuthenticatedUser(user);
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
   * Extraer token del header Authorization - MANTENER COMPATIBILIDAD
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

// Instancia singleton para mantener compatibilidad
const authMiddlewareInstance = new AuthMiddleware();

// Exportar métodos individuales para facilitar el uso
export const authenticate = authMiddlewareInstance.authenticate;
export const requireScopes = authMiddlewareInstance.requireScopes;
export const requireRole = authMiddlewareInstance.requireRole;
export const requirePermission = authMiddlewareInstance.requirePermission;
export const requireModuleAccess = authMiddlewareInstance.requireModuleAccess;
export const requireOrganization = authMiddlewareInstance.requireOrganization;
export const requireSuperAdmin = authMiddlewareInstance.requireSuperAdmin;
export const requireAdmin = authMiddlewareInstance.requireAdmin;
export const requireOwnershipOrPermission = authMiddlewareInstance.requireOwnershipOrPermission;
export const optional = authMiddlewareInstance.optional;