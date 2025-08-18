import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
  meta?: {
    timestamp: string;
    version?: string;
    [key: string]: any;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class ApiResponseHelper {
  private static getBaseMeta() {
    return {
      timestamp: new Date().toISOString(),
      version: process.env.API_VERSION || 'v1'
    };
  }

  /**
   * Respuesta exitosa
   */
  static success<T>(
    res: Response,
    data?: T,
    message: string = 'Operation successful',
    statusCode: number = 200,
    meta?: any
  ): void {
    const response: ApiResponse<T> = {
      success: true,
      message,
      ...(data !== undefined && { data }),
      meta: {
        ...this.getBaseMeta(),
        ...meta
      }
    };

    res.status(statusCode).json(response);
  }

  /**
   * Respuesta de error
   */
  static error(
    res: Response,
    message: string = 'An error occurred',
    statusCode: number = 500,
    errors?: any,
    meta?: any
  ): void {
    const response: ApiResponse = {
      success: false,
      message,
      ...(errors && { errors }),
      meta: {
        ...this.getBaseMeta(),
        ...meta
      }
    };

    res.status(statusCode).json(response);
  }

  /**
   * Respuesta con paginación
   */
  static paginated<T>(
    res: Response,
    data: T[],
    pagination: PaginationMeta,
    message: string = 'Data retrieved successfully',
    statusCode: number = 200
  ): void {
    const response: ApiResponse<T[]> = {
      success: true,
      message,
      data,
      meta: {
        ...this.getBaseMeta(),
        pagination: {
          ...pagination,
          hasNext: pagination.page < pagination.totalPages,
          hasPrev: pagination.page > 1
        }
      }
    };

    res.status(statusCode).json(response);
  }

  /**
   * Respuesta de validación fallida (422)
   */
  static validationError(
    res: Response,
    errors: any,
    message: string = 'Validation failed'
  ): void {
    this.error(res, message, 422, errors);
  }

  /**
   * Respuesta no autorizada (401)
   */
  static unauthorized(
    res: Response,
    message: string = 'Unauthorized access'
  ): void {
    this.error(res, message, 401);
  }

  /**
   * Respuesta prohibida (403)
   */
  static forbidden(
    res: Response,
    message: string = 'Access forbidden'
  ): void {
    this.error(res, message, 403);
  }

  /**
   * Respuesta no encontrado (404)
   */
  static notFound(
    res: Response,
    message: string = 'Resource not found'
  ): void {
    this.error(res, message, 404);
  }

  /**
   * Respuesta de conflicto (409)
   */
  static conflict(
    res: Response,
    message: string = 'Resource conflict',
    errors?: any
  ): void {
    this.error(res, message, 409, errors);
  }

  /**
   * Respuesta de rate limit excedido (429)
   */
  static tooManyRequests(
    res: Response,
    message: string = 'Too many requests',
    retryAfter?: string
  ): void {
    this.error(res, message, 429, null, retryAfter ? { retryAfter } : undefined);
  }

  /**
   * Respuesta de servidor interno (500)
   */
  static internalError(
    res: Response,
    message: string = 'Internal server error',
    error?: any
  ): void {
    // En producción no mostrar detalles del error
    const isDevelopment = process.env.NODE_ENV === 'development';
    const errors = isDevelopment && error ? { details: error } : undefined;
    
    this.error(res, message, 500, errors);
  }

  /**
   * Respuesta de servicio no disponible (503)
   */
  static serviceUnavailable(
    res: Response,
    message: string = 'Service temporarily unavailable'
  ): void {
    this.error(res, message, 503);
  }

  /**
   * Respuesta de creación exitosa (201)
   */
  static created<T>(
    res: Response,
    data?: T,
    message: string = 'Resource created successfully'
  ): void {
    this.success(res, data, message, 201);
  }

  /**
   * Respuesta de actualización exitosa (200)
   */
  static updated<T>(
    res: Response,
    data?: T,
    message: string = 'Resource updated successfully'
  ): void {
    this.success(res, data, message, 200);
  }

  /**
   * Respuesta de eliminación exitosa (200)
   */
  static deleted(
    res: Response,
    message: string = 'Resource deleted successfully'
  ): void {
    this.success(res, null, message, 200);
  }

  /**
   * Respuesta sin contenido (204)
   */
  static noContent(res: Response): void {
    res.status(204).send();
  }
}

// Clase para manejar errores personalizados
export class ApiError extends Error {
  public statusCode: number;
  public errors?: any;
  public isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    errors?: any,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;

    // Mantener el stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, errors?: any): ApiError {
    return new ApiError(message, 400, errors);
  }

  static unauthorized(message: string = 'Unauthorized access'): ApiError {
    return new ApiError(message, 401);
  }

  static forbidden(message: string = 'Access forbidden'): ApiError {
    return new ApiError(message, 403);
  }

  static notFound(message: string = 'Resource not found'): ApiError {
    return new ApiError(message, 404);
  }

  static conflict(message: string, errors?: any): ApiError {
    return new ApiError(message, 409, errors);
  }

  static validationError(message: string, errors: any): ApiError {
    return new ApiError(message, 422, errors);
  }

  static internalError(message: string = 'Internal server error'): ApiError {
    return new ApiError(message, 500);
  }
}

// Middleware para manejar errores de API
export const errorHandler = (error: any, req: any, res: Response, next: any) => {
  if (error instanceof ApiError) {
    return ApiResponseHelper.error(
      res,
      error.message,
      error.statusCode,
      error.errors
    );
  }

  // Error no manejado
  console.error('Unhandled error:', error);
  return ApiResponseHelper.internalError(res);
};