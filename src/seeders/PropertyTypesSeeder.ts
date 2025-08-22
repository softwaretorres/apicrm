// src/seeders/PropertyTypesSeeder.ts

import { BaseSeeder } from './BaseSeeder';
import { PropertyType } from '../entities/PropertyType';

export class PropertyTypesSeeder extends BaseSeeder {
  
  async run(): Promise<void> {
    // Verificar si ya existen datos
    if (await this.hasData(PropertyType)) {
      this.log('Property types already exist, skipping creation...', 'info');
      return;
    }

    const propertyTypes = [
      {
        name: 'Casa',
        description: 'Casa unifamiliar independiente con terreno propio',
        isActive: true
      },
      {
        name: 'Apartamento',
        description: 'Apartamento en edificio residencial',
        isActive: true
      },
      {
        name: 'Penthouse',
        description: 'Apartamento de lujo en los pisos superiores',
        isActive: true
      },
      {
        name: 'Edificio',
        description: 'Edificio completo para uso residencial o comercial',
        isActive: true
      },
      {
        name: 'Finca',
        description: 'Propiedad rural o finca para uso agrícola o recreativo',
        isActive: true
      },
      {
        name: 'Local Comercial',
        description: 'Local destinado para actividades comerciales',
        isActive: true
      },
      {
        name: 'Oficina',
        description: 'Espacio destinado para uso de oficina',
        isActive: true
      },
      {
        name: 'Bodega',
        description: 'Espacio de almacenamiento y depósito',
        isActive: true
      },
      {
        name: 'Lote',
        description: 'Terreno sin construcción para desarrollo',
        isActive: true
      },
      {
        name: 'Townhouse',
        description: 'Casa adosada en conjunto residencial',
        isActive: true
      },
      {
        name: 'Consultorio',
        description: 'Espacio para consultorios médicos u odontológicos',
        isActive: true
      },
      {
        name: 'Hotel',
        description: 'Propiedad hotelera para hospedaje',
        isActive: true
      },
      {
        name: 'Parqueadero',
        description: 'Espacio destinado exclusivamente para parqueo',
        isActive: true
      },
      {
        name: 'Casa Campestre',
        description: 'Casa ubicada en zona rural o campestre',
        isActive: true
      }
    ];

    this.log('Creating property types...', 'info');
    const createdTypes = await this.createIfNotExists(PropertyType, propertyTypes, 'name');
    this.log(`Successfully created ${createdTypes.length} property types`, 'success');
  }
}