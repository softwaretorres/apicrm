import { DataSource } from 'typeorm';
import { User } from '@/entities/User';
import { OAuthAccessToken } from '@/entities/OAuthAccessToken';
import { OAuthClient } from '@/entities/OAuthClient';

export const AppDataSource = new DataSource({
  type: process.env.DB_TYPE as 'mysql' | 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'laravel_db',
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.DB_LOGGING === 'true',
  entities: [User, OAuthAccessToken, OAuthClient],
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