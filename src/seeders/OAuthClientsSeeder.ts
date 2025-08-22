// src/seeders/OAuthClientsSeeder.ts

import { BaseSeeder } from './BaseSeeder';
import { OAuthClient } from '../entities/OAuthClient';
import { randomBytes } from 'crypto';

export class OAuthClientsSeeder extends BaseSeeder {
  
  async run(): Promise<void> {
    const clients = [
      {
        name: 'Frontend Application',
        secret: this.generateSecret(),
        redirect: 'http://localhost:3000/callback',
        personalAccessClient: false,
        passwordClient: true, // Para autenticación con usuario/contraseña
        revoked: false
      },
      {
        name: 'Mobile Application',
        secret: this.generateSecret(),
        redirect: 'com.yourapp://oauth/callback',
        personalAccessClient: false,
        passwordClient: true,
        revoked: false
      },
      {
        name: 'Personal Access Client',
        secret: this.generateSecret(),
        redirect: '',
        personalAccessClient: true, // Para tokens de acceso personal
        passwordClient: false,
        revoked: false
      },
      {
        name: 'API Testing Client',
        secret: this.generateSecret(),
        redirect: 'http://localhost:8080/callback',
        personalAccessClient: false,
        passwordClient: true,
        revoked: false
      },
      {
        name: 'Third Party Integration',
        secret: this.generateSecret(),
        redirect: 'https://partner.example.com/oauth/callback',
        personalAccessClient: false,
        passwordClient: false,
        revoked: false
      }
    ];

    this.log('Creating OAuth clients...', 'info');
    await this.createIfNotExists<OAuthClient>(OAuthClient, clients, 'name');
  }

  private generateSecret(): string {
    return randomBytes(40).toString('hex');
  }

  /**
   * Método estático para obtener un cliente específico después del seeding
   */
  static async getClientByName(name: string): Promise<OAuthClient | null> {
    const seeder = new OAuthClientsSeeder();
    await seeder.ensureConnection();
    
    const clientRepository = seeder['getRepository'](OAuthClient);
    return clientRepository.findOne({ where: { name } });
  }

  /**
   * Método para obtener el cliente de aplicación principal
   */
  static async getMainAppClient(): Promise<OAuthClient | null> {
    return this.getClientByName('Frontend Application');
  }

  /**
   * Método para obtener el cliente de acceso personal
   */
  static async getPersonalAccessClient(): Promise<OAuthClient | null> {
    return this.getClientByName('Personal Access Client');
  }
}