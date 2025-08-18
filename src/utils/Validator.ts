import { validate, ValidationError } from 'class-validator';
import { Request } from 'express';

export interface ValidationResult {
  isValid: boolean;
  errors: { [key: string]: string[] };
}

export class ValidatorHelper {
  /**
   * Validar entidad usando class-validator
   */
  static async validateEntity(entity: any): Promise<ValidationResult> {
    const validationErrors = await validate(entity);
    
    if (validationErrors.length === 0) {
      return { isValid: true, errors: {} };
    }

    const errors: { [key: string]: string[] } = {};
    
    validationErrors.forEach((error: ValidationError) => {
      if (error.constraints) {
        errors[error.property] = Object.values(error.constraints);
      }
    });

    return { isValid: false, errors };
  }

  /**
   * Validar email
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validar contraseña fuerte
   */
  static isStrongPassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validar número de teléfono
   */
  static isValidPhone(phone: string): boolean {
    // Expresión regular para números de teléfono internacionales
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  /**
   * Validar URL
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validar JWT token format (sin verificar signature)
   */
  static isValidJwtFormat(token: string): boolean {
    const parts = token.split('.');
    return parts.length === 3 && parts.every(part => part.length > 0);
  }

  /**
   * Sanitizar string (remover caracteres peligrosos)
   */
  static sanitizeString(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remover < y >
      .replace(/javascript:/gi, '') // Remover javascript:
      .replace(/on\w+=/gi, '') // Remover event handlers
      .trim();
  }

  /**
   * Validar y sanitizar entrada de usuario
   */
  static sanitizeInput(input: any): any {
    if (typeof input === 'string') {
      return this.sanitizeString(input);
    }
    
    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeInput(item));
    }
    
    if (typeof input === 'object' && input !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[key] = this.sanitizeInput(value);
      }
      return sanitized;
    }
    
    return input;
  }

  /**
   * Validar datos de registro
   */
  static validateRegistrationData(data: any): ValidationResult {
    const errors: { [key: string]: string[] } = {};

    // Validar nombre
    if (!data.name || typeof data.name !== 'string') {
      errors.name = ['Name is required'];
    } else if (data.name.length < 2) {
      errors.name = ['Name must be at least 2 characters long'];
    } else if (data.name.length > 100) {
      errors.name = ['Name must not exceed 100 characters'];
    }

    // Validar email
    if (!data.email || typeof data.email !== 'string') {
      errors.email = ['Email is required'];
    } else if (!this.isValidEmail(data.email)) {
      errors.email = ['Please provide a valid email address'];
    }

    // Validar contraseña
    if (!data.password || typeof data.password !== 'string') {
      errors.password = ['Password is required'];
    } else {
      const passwordValidation = this.isStrongPassword(data.password);
      if (!passwordValidation.isValid) {
        errors.password = passwordValidation.errors;
      }
    }

    // Validar confirmación de contraseña
    if (data.password !== data.password_confirmation) {
      errors.password_confirmation = ['Password confirmation does not match'];
    }

    // Validar teléfono (opcional)
    if (data.phone && typeof data.phone === 'string' && !this.isValidPhone(data.phone)) {
      errors.phone = ['Please provide a valid phone number'];
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Validar datos de login
   */
  static validateLoginData(data: any): ValidationResult {
    const errors: { [key: string]: string[] } = {};

    // Validar email
    if (!data.email || typeof data.email !== 'string') {
      errors.email = ['Email is required'];
    } else if (!this.isValidEmail(data.email)) {
      errors.email = ['Please provide a valid email address'];
    }

    // Validar contraseña
    if (!data.password || typeof data.password !== 'string') {
      errors.password = ['Password is required'];
    } else if (data.password.length < 6) {
      errors.password = ['Password must be at least 6 characters long'];
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Validar datos de actualización de perfil
   */
  static validateProfileUpdateData(data: any): ValidationResult {
    const errors: { [key: string]: string[] } = {};

    // Validar nombre (si se proporciona)
    if (data.name !== undefined) {
      if (typeof data.name !== 'string') {
        errors.name = ['Name must be a string'];
      } else if (data.name.length < 2) {
        errors.name = ['Name must be at least 2 characters long'];
      } else if (data.name.length > 100) {
        errors.name = ['Name must not exceed 100 characters'];
      }
    }

    // Validar email (si se proporciona)
    if (data.email !== undefined) {
      if (typeof data.email !== 'string') {
        errors.email = ['Email must be a string'];
      } else if (!this.isValidEmail(data.email)) {
        errors.email = ['Please provide a valid email address'];
      }
    }

    // Validar teléfono (si se proporciona)
    if (data.phone !== undefined && data.phone !== null && data.phone !== '') {
      if (typeof data.phone !== 'string') {
        errors.phone = ['Phone must be a string'];
      } else if (!this.isValidPhone(data.phone)) {
        errors.phone = ['Please provide a valid phone number'];
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Validar datos de cambio de contraseña
   */
  static validatePasswordChangeData(data: any): ValidationResult {
    const errors: { [key: string]: string[] } = {};

    // Validar contraseña actual
    if (!data.current_password || typeof data.current_password !== 'string') {
      errors.current_password = ['Current password is required'];
    }

    // Validar nueva contraseña
    if (!data.new_password || typeof data.new_password !== 'string') {
      errors.new_password = ['New password is required'];
    } else {
      const passwordValidation = this.isStrongPassword(data.new_password);
      if (!passwordValidation.isValid) {
        errors.new_password = passwordValidation.errors;
      }
    }

    // Validar confirmación de nueva contraseña
    if (data.new_password !== data.new_password_confirmation) {
      errors.new_password_confirmation = ['New password confirmation does not match'];
    }

    // Verificar que la nueva contraseña sea diferente a la actual
    if (data.current_password && data.new_password && data.current_password === data.new_password) {
      errors.new_password = ['New password must be different from current password'];
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Validar parámetros de paginación
   */
  static validatePaginationParams(req: Request): { page: number; limit: number; errors: string[] } {
    const errors: string[] = [];
    let page = 1;
    let limit = 10;

    // Validar página
    if (req.query.page) {
      const pageNum = parseInt(req.query.page as string);
      if (isNaN(pageNum) || pageNum < 1) {
        errors.push('Page must be a positive integer');
      } else {
        page = pageNum;
      }
    }

    // Validar límite
    if (req.query.limit) {
      const limitNum = parseInt(req.query.limit as string);
      if (isNaN(limitNum) || limitNum < 1) {
        errors.push('Limit must be a positive integer');
      } else if (limitNum > 100) {
        errors.push('Limit cannot exceed 100');
      } else {
        limit = limitNum;
      }
    }

    return { page, limit, errors };
  }

  /**
   * Validar ID de parámetro
   */
  static validateIdParam(id: string): { id: number | null; errors: string[] } {
    const errors: string[] = [];
    const numericId = parseInt(id);

    if (isNaN(numericId) || numericId < 1) {
      errors.push('ID must be a positive integer');
      return { id: null, errors };
    }

    return { id: numericId, errors };
  }
}