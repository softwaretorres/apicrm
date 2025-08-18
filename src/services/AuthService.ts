import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { OAuthAccessToken } from '../entities/OAuthAccessToken';
import { JWTService } from './JWTService';
import { EmailService } from './EmailService';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: Partial<User>;
}

// 🔧 Definir la interfaz aquí para asegurar compatibilidad
interface RefreshTokenPayload {
  sub: string;
  type: string;
  iat: number;
  exp: number;
}

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);
  private tokenRepository = AppDataSource.getRepository(OAuthAccessToken);
  private jwtService = new JWTService();
  private emailService = new EmailService();

  /**
   * Autenticar usuario (login)
   */
  public async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { email, password } = credentials;

    // Buscar usuario
    const user = await this.userRepository.findOne({ 
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.active) {
      throw new Error('Account is inactive');
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Actualizar último login
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    // Generar tokens
    return await this.generateTokenResponse(user);
  }

  /**
   * Registrar nuevo usuario
   */
  public async register(userData: RegisterData): Promise<AuthResponse> {
    // Verificar si el email ya existe
    const existingUser = await this.userRepository.findOne({
      where: { email: userData.email.toLowerCase() }
    });

    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    // Crear nuevo usuario
    const user = this.userRepository.create({
      ...userData,
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      active: true
    });

    await this.userRepository.save(user);

    // Enviar email de bienvenida
    try {
      await this.emailService.sendWelcomeEmail(user);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }

    // Generar tokens
    return await this.generateTokenResponse(user);
  }

  /**
   * Refrescar token de acceso
   */
  public async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      // 🔧 Verificar el token sin cast
      const payload = this.jwtService.verifyToken(refreshToken);
      
      // Verificar que es un refresh token usando type guard
      if (!this.isRefreshTokenPayload(payload)) {
        throw new Error('Invalid refresh token');
      }

      const user = await this.userRepository.findOne({
        where: { id: parseInt(payload.sub) }
      });

      if (!user || !user.active) {
        throw new Error('User not found or inactive');
      }

      return await this.generateTokenResponse(user);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Type guard para verificar si es un refresh token
   */
  private isRefreshTokenPayload(payload: any): payload is RefreshTokenPayload {
    return payload && 
           typeof payload.sub === 'string' && 
           typeof payload.type === 'string' && 
           payload.type === 'refresh';
  }

  /**
   * Cerrar sesión (revocar token)
   */
  public async logout(tokenId: string): Promise<void> {
    const accessToken = await this.tokenRepository.findOne({
      where: { id: tokenId }
    });

    if (accessToken) {
      accessToken.revoked = true;
      await this.tokenRepository.save(accessToken);
    }
  }

  /**
   * Cerrar sesión en todos los dispositivos
   */
  public async logoutAll(userId: number): Promise<void> {
    await this.tokenRepository.update(
      { userId, revoked: false },
      { revoked: true }
    );
  }

  /**
   * Verificar email
   */
  public async verifyEmail(userId: number): Promise<void> {
    await this.userRepository.update(userId, {
      emailVerifiedAt: new Date()
    });
  }

  /**
   * Solicitar restablecimiento de contraseña
   */
  public async requestPasswordReset(email: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      // No revelar si el email existe o no por seguridad
      return;
    }

    // Generar token de reset
    const resetToken = uuidv4();
    const hashedToken = await bcrypt.hash(resetToken, 12);
    
    user.rememberToken = hashedToken;
    await this.userRepository.save(user);

    // Enviar email con enlace de reset
    try {
      await this.emailService.sendPasswordResetEmail(user, resetToken);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  /**
   * Restablecer contraseña
   */
  public async resetPassword(token: string, newPassword: string): Promise<void> {
    const users = await this.userRepository.find({
      where: { rememberToken: 'NOT NULL' }
    });

    let validUser: User | null = null;

    // Verificar token hasheado
    for (const user of users) {
      if (user.rememberToken && await bcrypt.compare(token, user.rememberToken)) {
        validUser = user;
        break;
      }
    }

    if (!validUser) {
      throw new Error('Invalid or expired reset token');
    }

    // Actualizar contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    validUser.password = hashedPassword;
    validUser.rememberToken = undefined; // 🔧 Cambiar null por undefined
    
    await this.userRepository.save(validUser);

    // Revocar todos los tokens existentes
    await this.logoutAll(validUser.id);
  }

  /**
   * Generar respuesta de tokens
   */
  private async generateTokenResponse(user: User): Promise<AuthResponse> {
    const tokenId = uuidv4();
    const expiresIn = 24 * 60 * 60; // 24 horas en segundos
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    // Generar JWT
    const accessToken = this.jwtService.generateToken(user, tokenId, ['*']);
    const refreshToken = this.jwtService.generateRefreshToken(user.id);

    // Guardar token en la base de datos (compatible con Laravel Passport)
    const oauthToken = this.tokenRepository.create({
      id: tokenId,
      userId: user.id,
      clientId: 1, // Cliente por defecto (personal access client)
      name: 'Personal Access Token',
      scopes: JSON.stringify(['*']),
      revoked: false,
      expiresAt
    });

    await this.tokenRepository.save(oauthToken);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: expiresIn,
      user: user.toJSON()
    };
  }

  /**
   * Obtener información del usuario autenticado
   */
  public async me(userId: number): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user.toJSON();
  }

  /**
   * Actualizar perfil del usuario
   */
  public async updateProfile(userId: number, updateData: Partial<User>): Promise<Partial<User>> {
    // Campos permitidos para actualizar
    const allowedFields = ['name', 'firstName', 'lastName', 'phone', 'avatar'];
    const filteredData: Partial<User> = {};

    for (const field of allowedFields) {
      if (updateData[field as keyof User] !== undefined) {
        (filteredData as any)[field] = updateData[field as keyof User];
      }
    }

    await this.userRepository.update(userId, filteredData);

    const updatedUser = await this.userRepository.findOne({
      where: { id: userId }
    });

    return updatedUser!.toJSON();
  }

  /**
   * Cambiar contraseña
   */
  public async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verificar contraseña actual
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Actualizar contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    
    await this.userRepository.save(user);

    // Opcional: revocar todos los tokens para forzar re-login
    await this.logoutAll(userId);
  }
}