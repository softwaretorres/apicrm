// src/types/api.ts

// Respuestas API estándar
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
  errors?: ValidationError[];
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  message: string;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Parámetros de paginación
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// Parámetros de búsqueda
export interface SearchParams extends PaginationParams {
  query?: string;
  filters?: Record<string, any>;
}

// Headers de autenticación
export interface AuthHeaders {
  authorization?: string;
  'x-organization-id'?: string;
}

// Errores HTTP estándar
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500
}

// Tipos para manejo de errores
export interface ErrorResponse {
  success: false;
  message: string;
  error: string;
  code?: string;
  details?: any;
  timestamp: string;
  path: string;
}

// Importar AuthenticatedUser solo para el tipo de Request extendido
import type { AuthenticatedUser } from './auth';

// Tipos para middlewares
export interface RequestWithUser extends Request {
  user?: AuthenticatedUser;
  token?: string;
}

// Re-exports de tipos importantes al final
export type { AuthenticatedUser } from './auth';