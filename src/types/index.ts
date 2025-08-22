// src/types/index.ts

// Exportar en orden para evitar referencias circulares
// 1. Tipos base y utilidades primero
export * from './api';

// 2. Tipos de autenticación (base para otros)
export * from './auth';

// 3. Tipos de usuario (referenciado por otros)
export * from './user';

// 4. Tipos de roles (depende de user)
export * from './roles';

// 5. Tipos de organización (puede usar los anteriores)
export * from './organization';

// Tipos adicionales comunes
export interface BaseEntity {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SoftDeleteEntity extends BaseEntity {
  deletedAt?: Date;
  isDeleted: boolean;
}

export interface AuditableEntity extends BaseEntity {
  createdBy?: number;
  updatedBy?: number;
}

// Tipos de configuración
export interface DatabaseConfig {
  type: string;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  synchronize: boolean;
  logging: boolean;
}

export interface JWTConfig {
  secret: string;
  expiresIn: string;
  refreshExpiresIn: string;
}

export interface AppConfig {
  port: number;
  env: 'development' | 'production' | 'test';
  database: DatabaseConfig;
  jwt: JWTConfig;
  corsOrigins: string[];
}

// Utilidad para tipos opcionales
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Utilidad para tipos de solo lectura
export type ReadOnly<T> = {
  readonly [P in keyof T]: T[P];
};

// Utilidad para extraer tipos de promesas
export type Awaited<T> = T extends Promise<infer U> ? U : T;

// Tipo para funciones que pueden ser async o sync
export type MaybePromise<T> = T | Promise<T>;