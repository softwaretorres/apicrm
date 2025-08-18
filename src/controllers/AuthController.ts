import { Request, Response } from 'express';
import { validate } from 'class-validator';
import { AuthService, LoginCredentials, RegisterData } from '../services/AuthService';
import { JWTService } from '../services/JWTService';
import { UserService } from '../services/UserService';
import { EmailService } from '../services/EmailService';

interface AuthenticatedRequest extends Request {
  user?: any;
  token?: string;
}

export class AuthController {
  private authService = new AuthService();
  private jwtService = new JWTService();
  private userService = new UserService();
  private emailService = new EmailService();

  /**
   * Login de usuario
   */
  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Validaciones básicas
      if (!email || !password) {
        res.status(400).json({
          message: 'Email and password are required',
          errors: {
            email: !email ? ['Email is required'] : [],
            password: !password ? ['Password is required'] : []
          }
        });
        return;
      }

      const credentials: LoginCredentials = { email, password };
      const authResponse = await this.authService.login(credentials);

      // Opcional: enviar notificación de login
      try {
        await this.emailService.sendLoginNotification(authResponse.user as any, {
          ip: req.ip || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown'
        });
      } catch (error) {
        console.error('Failed to send login notification:', error);
      }

      res.status(200).json({
        message: 'Login successful',
        data: authResponse
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({
        message: 'Login failed',
        error: error instanceof Error ? error.message : 'Invalid credentials'
      });
    }
  };

  /**
   * Registro de usuario
   */
  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, password, password_confirmation, firstName, lastName, phone } = req.body;

      // Validaciones básicas
      const errors: any = {};

      if (!name) errors.name = ['Name is required'];
      if (!email) errors.email = ['Email is required'];
      if (!password) errors.password = ['Password is required'];
      if (password && password.length < 6) {
        errors.password = errors.password || [];
        errors.password.push('Password must be at least 6 characters');
      }
      if (password !== password_confirmation) {
        errors.password_confirmation = ['Password confirmation does not match'];
      }

      if (Object.keys(errors).length > 0) {
        res.status(422).json({
          message: 'Validation failed',
          errors
        });
        return;
      }

      // Verificar si el email ya existe
      const existingUser = await this.userService.findByEmail(email);
      if (existingUser) {
        res.status(422).json({
          message: 'Validation failed',
          errors: {
            email: ['Email already registered']
          }
        });
        return;
      }

      const userData: RegisterData = {
        name,
        email,
        password,
        firstName,
        lastName,
        phone
      };

      const authResponse = await this.authService.register(userData);

      res.status(201).json({
        message: 'Registration successful',
        data: authResponse
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({
        message: 'Registration failed',
        error: error instanceof Error ? error.message : 'Registration error'
      });
    }
  };

  /**
   * Logout de usuario
   */
  public logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.token) {
        res.status(401).json({
          message: 'No token provided'
        });
        return;
      }

      // Extraer token ID del JWT
      const decoded = this.jwtService.decodeToken(req.token);
      if (decoded && decoded.payload.jti) {
        await this.authService.logout(decoded.payload.jti);
      }

      res.status(200).json({
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        message: 'Logout failed',
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  /**
   * Logout de todos los dispositivos
   */
  public logoutAll = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          message: 'User not authenticated'
        });
        return;
      }

      await this.authService.logoutAll(req.user.id);

      res.status(200).json({
        message: 'Logged out from all devices successfully'
      });
    } catch (error) {
      console.error('Logout all error:', error);
      res.status(500).json({
        message: 'Logout failed',
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  /**
   * Obtener información del usuario autenticado
   */
  public me = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          message: 'User not authenticated'
        });
        return;
      }

      const user = await this.authService.me(req.user.id);

      res.status(200).json({
        message: 'User information retrieved successfully',
        data: user
      });
    } catch (error) {
      console.error('Me error:', error);
      res.status(500).json({
        message: 'Failed to retrieve user information',
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  /**
   * Actualizar perfil del usuario
   */
  public updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          message: 'User not authenticated'
        });
        return;
      }

      const { name, firstName, lastName, phone, avatar } = req.body;
      const updateData = { name, firstName, lastName, phone, avatar };

      const updatedUser = await this.authService.updateProfile(req.user.id, updateData);

      res.status(200).json({
        message: 'Profile updated successfully',
        data: updatedUser
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        message: 'Failed to update profile',
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  /**
   * Cambiar contraseña
   */
  public changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          message: 'User not authenticated'
        });
        return;
      }

      const { current_password, new_password, new_password_confirmation } = req.body;

      // Validaciones
      const errors: any = {};
      if (!current_password) errors.current_password = ['Current password is required'];
      if (!new_password) errors.new_password = ['New password is required'];
      if (new_password && new_password.length < 6) {
        errors.new_password = errors.new_password || [];
        errors.new_password.push('New password must be at least 6 characters');
      }
      if (new_password !== new_password_confirmation) {
        errors.new_password_confirmation = ['Password confirmation does not match'];
      }

      if (Object.keys(errors).length > 0) {
        res.status(422).json({
          message: 'Validation failed',
          errors
        });
        return;
      }

      await this.authService.changePassword(req.user.id, current_password, new_password);

      res.status(200).json({
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(400).json({
        message: 'Failed to change password',
        error: error instanceof Error ? error.message : 'Password change failed'
      });
    }
  };

  /**
   * Solicitar restablecimiento de contraseña
   */
  public requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          message: 'Email is required',
          errors: {
            email: ['Email is required']
          }
        });
        return;
      }

      await this.authService.requestPasswordReset(email);

      // Siempre devolver éxito por seguridad (no revelar si el email existe)
      res.status(200).json({
        message: 'If the email exists, a password reset link has been sent'
      });
    } catch (error) {
      console.error('Request password reset error:', error);
      res.status(500).json({
        message: 'Failed to process password reset request',
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  /**
   * Restablecer contraseña
   */
  public resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token, password, password_confirmation } = req.body;

      // Validaciones
      const errors: any = {};
      if (!token) errors.token = ['Reset token is required'];
      if (!password) errors.password = ['Password is required'];
      if (password && password.length < 6) {
        errors.password = errors.password || [];
        errors.password.push('Password must be at least 6 characters');
      }
      if (password !== password_confirmation) {
        errors.password_confirmation = ['Password confirmation does not match'];
      }

      if (Object.keys(errors).length > 0) {
        res.status(422).json({
          message: 'Validation failed',
          errors
        });
        return;
      }

      await this.authService.resetPassword(token, password);

      res.status(200).json({
        message: 'Password reset successfully'
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(400).json({
        message: 'Failed to reset password',
        error: error instanceof Error ? error.message : 'Invalid or expired token'
      });
    }
  };

  /**
   * Refrescar token de acceso
   */
  public refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refresh_token } = req.body;

      if (!refresh_token) {
        res.status(400).json({
          message: 'Refresh token is required',
          errors: {
            refresh_token: ['Refresh token is required']
          }
        });
        return;
      }

      const authResponse = await this.authService.refreshToken(refresh_token);

      res.status(200).json({
        message: 'Token refreshed successfully',
        data: authResponse
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(401).json({
        message: 'Failed to refresh token',
        error: error instanceof Error ? error.message : 'Invalid refresh token'
      });
    }
  };

  /**
   * Verificar email
   */
  public verifyEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.body;

      if (!token) {
        res.status(400).json({
          message: 'Verification token is required'
        });
        return;
      }

      // Aquí implementarías la lógica de verificación
      // Por simplicidad, asumimos que el token contiene el user ID
      const payload = this.jwtService.verifyToken(token);
      await this.authService.verifyEmail(parseInt(payload.sub));

      res.status(200).json({
        message: 'Email verified successfully'
      });
    } catch (error) {
      console.error('Verify email error:', error);
      res.status(400).json({
        message: 'Email verification failed',
        error: error instanceof Error ? error.message : 'Invalid verification token'
      });
    }
  };
}