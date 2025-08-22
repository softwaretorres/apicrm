// src/seeders/PropertyConditionsSeeder.ts

import { BaseSeeder } from './BaseSeeder';
import { PropertyCondition } from '../entities/PropertyCondition';

export class PropertyConditionsSeeder extends BaseSeeder {
  
  async run(): Promise<void> {
    // Verificar si ya existen datos
    if (await this.hasData(PropertyCondition)) {
      this.log('Property conditions already exist, skipping creation...', 'info');
      return;
    }

    const propertyConditions = [
      {
        name: 'Excelente',
        description: 'Propiedad en excelente estado',
        displayOrder: 1,
        isActive: true
      },
      {
        name: 'Muy Buena',
        description: 'Propiedad en muy buen estado',
        displayOrder: 2,
        isActive: true
      },
      {
        name: 'Buena',
        description: 'Propiedad en buen estado',
        displayOrder: 3,
        isActive: true
      },
      {
        name: 'Regular',
        description: 'Propiedad en estado regular',
        displayOrder: 4,
        isActive: true
      },
      {
        name: 'Necesita Reparaciones',
        description: 'Propiedad que necesita reparaciones menores',
        displayOrder: 5,
        isActive: true
      },
      {
        name: 'Necesita Renovación',
        description: 'Propiedad que necesita renovación completa',
        displayOrder: 6,
        isActive: true
      },
      {
        name: 'En Construcción',
        description: 'Propiedad en proceso de construcción',
        displayOrder: 7,
        isActive: true
      },
      {
        name: 'Obra Gris',
        description: 'Propiedad en obra gris',
        displayOrder: 8,
        isActive: true
      },
      {
        name: 'Nuevo',
        description: 'Propiedad completamente nueva',
        displayOrder: 0,
        isActive: true
      },
      {
        name: 'Para Demoler',
        description: 'Propiedad destinada para demolición',
        displayOrder: 9,
        isActive: true
      }
    ];

    this.log('Creating property conditions...', 'info');
    const createdConditions = await this.createIfNotExists(PropertyCondition, propertyConditions, 'name');
    this.log(`Successfully created ${createdConditions.length} property conditions`, 'success');
  }
}