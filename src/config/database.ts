import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { OAuthAccessToken } from '../entities/OAuthAccessToken';
//iMPORTAR CLIENT
import { OAuthClient } from '../entities/OAuthClient';
import { PropertyType } from '../entities/PropertyType';
import { PropertyStatus } from '../entities/PropertyStatus';
import { TransactionType } from '../entities/TransactionType';
import { PropertyCondition } from '../entities/PropertyCondition';
import { PropertyFeature } from '../entities/PropertyFeature';
import { PropertyFeatureValue } from '../entities/PropertyFeatureValue';
import { PropertyImage } from '../entities/PropertyImage';
import { Property } from '../entities/Property';
import dotenv from 'dotenv';
import { Role } from '../entities/Role';
import { Organization } from '../entities/Organization';
import { Permission } from '../entities/Permission';
import { RolePermission } from '../entities/RolePermission';
import { UserRole } from '../entities/UserRole';
dotenv.config();

export const AppDataSource = new DataSource({
  type: process.env.DB_TYPE as 'mysql' | 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'laravel_db',
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.DB_LOGGING === 'true',
  entities: [
    User, OAuthAccessToken, OAuthClient, Role,
    UserRole,
    Permission,
    RolePermission,
    Organization,
    PropertyType, PropertyStatus, TransactionType, PropertyCondition,
    PropertyFeature, PropertyFeatureValue, PropertyImage, Property

  ],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: ['src/subscribers/**/*.ts'],
  extra: {
    // Para MySQL
    charset: 'utf8mb4_unicode_ci',
    // Para mejorar performance
    acquireTimeout: 60000,
    timeout: 60000,
    // Pool de conexiones
    connectionLimit: 10,
  },
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection initialized successfully');
  } catch (error) {
    console.error('❌ Error during database initialization:', error);
    process.exit(1);
  }
};
