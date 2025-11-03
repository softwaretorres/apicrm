// controllers/AuthController.ts
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthService, LoginCredentials, RegisterData } from '../services/AuthService';
import { RoleService } from '../services/RoleService';
import { AuthenticatedUser } from '../types';

interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  token?: string;
}

export class AuthController {
  private authService: AuthService;
  private roleService: RoleService;

  constructor() {
    this.authService = new AuthService();
    this.roleService = new RoleService();
  }

  /**
   * Registro de nuevo usuario
   */
  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
        return;
      }

      const registerData: RegisterData = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phone: req.body.phone
      };

      // Registrar usuario usando tu AuthService
      const authResponse = await this.authService.register(registerData);

      // Asignar rol de usuario por defecto usando tu RoleService
      const userId = (authResponse.user as any).id;
      const organizationId = (authResponse.user as any).organizationId;
      
      // Buscar el rol 'user' por nombre
      const userRole = await this.roleService.findByName('admin');
      console.log(userRole)
      if (userRole) {
        await this.roleService.assignRoleToUser({
          userId: userId,
          roleId: userRole.id,
          organizationId: organizationId
        });
      }

      // Obtener usuario con roles y permisos usando tu RoleService
      const userRoles = await this.roleService.getUserRoles(userId, organizationId);
      const userPermissions = await this.roleService.getUserPermissions(userId, organizationId);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            ...authResponse.user,
            roles: userRoles,
            permissions: userPermissions
          },
          tokens: {
            accessToken: authResponse.access_token,
            refreshToken: authResponse.refresh_token,
            tokenType: authResponse.token_type,
            expiresIn: authResponse.expires_in
          }
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({
        success: false,
        message: 'Registration failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Login de usuario
   */
  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
        return;
      }

      const credentials: LoginCredentials = {
        email: req.body.email,
        password: req.body.password
      };

      // Login usando tu AuthService
      const authResponse = await this.authService.login(credentials);

      // Obtener usuario con roles usando tu RoleService
      const userId = (authResponse.user as any).id;
      const organizationId = (authResponse.user as any).organizationId;
      const userRoles = await this.roleService.getUserRoles(userId, organizationId);
      const userPermissions = await this.roleService.getUserPermissions(userId, organizationId);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            ...authResponse.user,
            roles: userRoles,
            permissions: userPermissions
          },
          tokens: {
            accessToken: authResponse.access_token,
            refreshToken: authResponse.refresh_token,
            tokenType: authResponse.token_type,
            expiresIn: authResponse.expires_in
          }
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({
        success: false,
        message: 'Login failed',
        error: error instanceof Error ? error.message : 'Invalid credentials'
      });
    }
  };

  /**
   * Logout de usuario
   */
  public logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // Tu AuthMiddleware ya maneja el token ID en el JWT payload
      const token = req.token;
      
      if (token) {
        // Extraer token ID del JWT para logout
        const payload = require('../services/JWTService').JWTService.prototype.verifyToken(token);
        await this.authService.logout(payload.jti);
      }

      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Refrescar token
   */
  public refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: 'Refresh token required'
        });
        return;
      }

      const authResponse = await this.authService.refreshToken(refreshToken);

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          tokens: {
            accessToken: authResponse.access_token,
            refreshToken: authResponse.refresh_token,
            tokenType: authResponse.token_type,
            expiresIn: authResponse.expires_in
          }
        }
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(401).json({
        success: false,
        message: 'Token refresh failed',
        error: error instanceof Error ? error.message : 'Invalid refresh token'
      });
    }
  };

  /**
   * Obtener usuario actual (tu AuthMiddleware ya carga toda la info)
   */
  public me = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      // Tu AuthMiddleware ya crea el AuthenticatedUser completo
      // Solo necesitamos obtener roles y permisos actualizados
      const userRoles = await this.roleService.getUserRoles(req.user.id, req.user.organizationId);
      const userPermissions = await this.roleService.getUserPermissions(req.user.id, req.user.organizationId);

      res.json({
        success: true,
        data: {
          ...req.user,
          roles: userRoles,
          permissions: userPermissions,
          // Métodos helper para el frontend
          hasRole: undefined, // No serializar funciones
          hasPermission: undefined,
          canAccessModule: undefined,
          isSuperAdmin: undefined,
          isAdmin: undefined
        },
        message: 'User profile retrieved successfully'
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Cambiar contraseña
   */
  public changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
        return;
      }

      const { currentPassword, newPassword } = req.body;

      await this.authService.changePassword(req.user!.id, currentPassword, newPassword);

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(400).json({
        success: false,
        message: 'Failed to change password',
        error: error instanceof Error ? error.message : 'Current password is incorrect'
      });
    }
  };

  /**
   * Solicitar restablecimiento de contraseña
   */
  public requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;

      await this.authService.requestPasswordReset(email);

      res.json({
        success: true,
        message: 'Password reset instructions sent to your email'
      });
    } catch (error) {
      console.error('Password reset request error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send password reset email',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Restablecer contraseña
   */
  public resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token, password } = req.body;

      await this.authService.resetPassword(token, password);

      res.json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(400).json({
        success: false,
        message: 'Failed to reset password',
        error: error instanceof Error ? error.message : 'Invalid or expired token'
      });
    }
  };

  /**
   * Verificar email
   */
  public verifyEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;

      await this.authService.verifyEmail(parseInt(userId));

      res.json({
        success: true,
        message: 'Email verified successfully'
      });
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(400).json({
        success: false,
        message: 'Failed to verify email',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Actualizar perfil
   */
  public updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
        return;
      }

      const updatedUser = await this.authService.updateProfile(req.user!.id, req.body);

      res.json({
        success: true,
        data: updatedUser,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Cerrar sesión en todos los dispositivos
   */
  public logoutAll = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      await this.authService.logoutAll(req.user!.id);

      res.json({
        success: true,
        message: 'Logged out from all devices successfully'
      });
    } catch (error) {
      console.error('Logout all error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to logout from all devices',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}