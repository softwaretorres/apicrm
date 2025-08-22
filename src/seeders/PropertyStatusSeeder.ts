// src/seeders/PropertyStatusSeeder.ts

import { BaseSeeder } from './BaseSeeder';
import { PropertyStatus } from '../entities/PropertyStatus';

export class PropertyStatusSeeder extends BaseSeeder {
  
  async run(): Promise<void> {
    // Verificar si ya existen datos
    if (await this.hasData(PropertyStatus)) {
      this.log('Property statuses already exist, skipping creation...', 'info');
      return;
    }

    const propertyStatuses = [
      {
        name: 'Disponible',
        description: 'Propiedad disponible para transacción',
        color: '#28a745',
        isActive: true
      },
      {
        name: 'Vendida',
        description: 'Propiedad ya vendida',
        color: '#dc3545',
        isActive: true
      },
      {
        name: 'Alquilada',
        description: 'Propiedad ya alquilada',
        color: '#ffc107',
        isActive: true
      },
      {
        name: 'En Proceso',
        description: 'Transacción en proceso',
        color: '#17a2b8',
        isActive: true
      },
      {
        name: 'Reservada',
        description: 'Propiedad reservada',
        color: '#6f42c1',
        isActive: true
      },
      {
        name: 'Suspendida',
        description: 'Publicación suspendida temporalmente',
        color: '#6c757d',
        isActive: true
      },
      {
        name: 'Borrador',
        description: 'Propiedad en borrador, no publicada',
        color: '#e9ecef',
        isActive: true
      },
      {
        name: 'En Negociación',
        description: 'Propiedad en proceso de negociación',
        color: '#fd7e14',
        isActive: true
      },
      {
        name: 'Retirada',
        description: 'Propiedad retirada del mercado',
        color: '#495057',
        isActive: true
      }
    ];

    this.log('Creating property statuses...', 'info');
    const createdStatuses = await this.createIfNotExists(PropertyStatus, propertyStatuses, 'name');
    this.log(`Successfully created ${createdStatuses.length} property statuses`, 'success');
  }
}