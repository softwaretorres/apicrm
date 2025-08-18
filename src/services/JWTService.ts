import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { User } from '../entities/User';

interface JWTPayload {
  jti: string;
  sub: string;
  aud: string;
  iat: number;
  exp: number;
  iss: string;
  scopes: string[];
}

export class JWTService {
  private publicKey: string;
  private privateKey: string;

  constructor() {
    // Cargar claves públicas y privadas de Laravel Passport
    const publicKeyPath = process.env.PASSPORT_PUBLIC_KEY_PATH || './keys/oauth-public.key';
    const privateKeyPath = process.env.PASSPORT_PRIVATE_KEY_PATH || './keys/oauth-private.key';
    
    try {
      this.publicKey = fs.readFileSync(path.resolve(publicKeyPath), 'utf8');
      this.privateKey = fs.readFileSync(path.resolve(privateKeyPath), 'utf8');
    } catch (error) {
      console.warn('⚠️  Laravel Passport keys not found, using fallback JWT secret');
      // Fallback para desarrollo
      this.publicKey = process.env.JWT_SECRET || 'fallback-secret';
      this.privateKey = process.env.JWT_SECRET || 'fallback-secret';
    }
  }

  /**
   * Generar token compatible con Laravel Passport
   */
  public generateToken(user: User, tokenId: string, scopes: string[] = ['*']): string {
    const payload: JWTPayload = {
      jti: tokenId, // JWT ID (Laravel Passport lo usa)
      sub: user.id.toString(), // Subject (user ID)
      aud: process.env.SERVICE_NAME || 'auth-service',
      iat: Math.floor(Date.now() / 1000), // Issued at
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // Expires in 24 hours
      iss: process.env.APP_URL || 'http://localhost:3000', // Issuer
      scopes: scopes
    };

    try {
      // Si tenemos las claves RSA de Laravel Passport
      if (this.privateKey.includes('PRIVATE KEY')) {
        return jwt.sign(payload, this.privateKey, { algorithm: 'RS256' });
      } else {
        // Fallback con HMAC
        return jwt.sign(payload, this.privateKey, { algorithm: 'HS256' });
      }
    } catch (error) {
      console.error('Error generating JWT token:', error);
      throw new Error('Failed to generate token');
    }
  }

  /**
   * Verificar token de Laravel Passport
   */
  public verifyToken(token: string): JWTPayload {
    try {
      // Si tenemos las claves RSA de Laravel Passport
      if (this.publicKey.includes('PUBLIC KEY')) {
        return jwt.verify(token, this.publicKey, { algorithms: ['RS256'] }) as JWTPayload;
      } else {
        // Fallback con HMAC
        return jwt.verify(token, this.publicKey, { algorithms: ['HS256'] }) as JWTPayload;
      }
    } catch (error) {
      console.error('Error verifying JWT token:', error);
      throw new Error('Invalid token');
    }
  }

  /**
   * Decodificar token sin verificar (útil para debug)
   */
  public decodeToken(token: string): any {
    try {
      return jwt.decode(token, { complete: true });
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      return null;
    }
  }

  /**
   * Verificar si un token ha expirado
   */
  public isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as any;
      if (!decoded || !decoded.exp) return true;
      
      return Date.now() >= decoded.exp * 1000;
    } catch (error) {
      return true;
    }
  }

  /**
   * Generar refresh token
   */
  public generateRefreshToken(userId: number): string {
    const payload = {
      sub: userId.toString(),
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60 // 30 días
    };

    return jwt.sign(payload, this.privateKey, { 
      algorithm: this.privateKey.includes('PRIVATE KEY') ? 'RS256' : 'HS256' 
    });
  }
}