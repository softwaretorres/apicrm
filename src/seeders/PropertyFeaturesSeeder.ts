// src/seeders/PropertyFeaturesSeeder.ts

import { BaseSeeder } from './BaseSeeder';
import { PropertyFeature, FeatureType, FeatureCategory } from '../entities/PropertyFeature';

export class PropertyFeaturesSeeder extends BaseSeeder {
  
  async run(): Promise<void> {
    // Verificar si ya existen datos
    if (await this.hasData(PropertyFeature)) {
      this.log('Property features already exist, skipping creation...', 'info');
      return;
    }

    const propertyFeatures: Partial<PropertyFeature>[] = [
      // Características externas
      {
        name: 'Piscina',
        description: 'Tiene piscina',
        type: 'boolean' as FeatureType,
        category: 'external' as FeatureCategory,
        displayOrder: 1,
        isRequired: false,
        isActive: true
      },
      {
        name: 'Garaje',
        description: 'Número de espacios de garaje',
        type: 'number' as FeatureType,
        category: 'external' as FeatureCategory,
        unit: 'espacios',
        displayOrder: 2,
        isRequired: false,
        isActive: true
      },
      {
        name: 'Terraza',
        description: 'Tiene terraza',
        type: 'boolean' as FeatureType,
        category: 'external' as FeatureCategory,
        displayOrder: 4,
        isRequired: false,
        isActive: true
      },
      {
        name: 'Jardín',
        description: 'Tiene jardín',
        type: 'boolean' as FeatureType,
        category: 'external' as FeatureCategory,
        displayOrder: 5,
        isRequired: false,
        isActive: true
      },
      {
        name: 'Gimnasio',
        description: 'Tiene gimnasio',
        type: 'boolean' as FeatureType,
        category: 'external' as FeatureCategory,
        displayOrder: 15,
        isRequired: false,
        isActive: true
      },

      // Características internas
      {
        name: 'Balcón',
        description: 'Tiene balcón',
        type: 'boolean' as FeatureType,
        category: 'internal' as FeatureCategory,
        displayOrder: 3,
        isRequired: false,
        isActive: true
      },
      {
        name: 'Aire Acondicionado',
        description: 'Tipo de aire acondicionado',
        type: 'multiple_choice' as FeatureType,
        category: 'internal' as FeatureCategory,
        options: ["Central", "Splits", "Ventiladores", "No tiene"],
        displayOrder: 6,
        isRequired: false,
        isActive: true
      },
      {
        name: 'Calefacción',
        description: 'Tipo de calefacción',
        type: 'multiple_choice' as FeatureType,
        category: 'internal' as FeatureCategory,
        options: ["Gas", "Eléctrica", "Solar", "No tiene"],
        displayOrder: 7,
        isRequired: false,
        isActive: true
      },
      {
        name: 'Amueblado',
        description: 'Estado de amueblado',
        type: 'multiple_choice' as FeatureType,
        category: 'internal' as FeatureCategory,
        options: ["Completamente", "Parcialmente", "Sin amueblar"],
        displayOrder: 8,
        isRequired: false,
        isActive: true
      },
      {
        name: 'Ascensor',
        description: 'Tiene ascensor',
        type: 'boolean' as FeatureType,
        category: 'internal' as FeatureCategory,
        displayOrder: 9,
        isRequired: false,
        isActive: true
      },
      {
        name: 'Cocina Integral',
        description: 'Tiene cocina integral',
        type: 'boolean' as FeatureType,
        category: 'internal' as FeatureCategory,
        displayOrder: 12,
        isRequired: false,
        isActive: true
      },
      {
        name: 'Chimenea',
        description: 'Tiene chimenea',
        type: 'boolean' as FeatureType,
        category: 'internal' as FeatureCategory,
        displayOrder: 13,
        isRequired: false,
        isActive: true
      },
      {
        name: 'Biblioteca',
        description: 'Tiene biblioteca/estudio',
        type: 'boolean' as FeatureType,
        category: 'internal' as FeatureCategory,
        displayOrder: 14,
        isRequired: false,
        isActive: true
      },

      // Características generales
      {
        name: 'Seguridad',
        description: 'Tipo de seguridad',
        type: 'multiple_choice' as FeatureType,
        category: 'general' as FeatureCategory,
        options: ["Portería", "Cámaras", "Alarma", "Conjunto cerrado", "Sin seguridad"],
        displayOrder: 10,
        isRequired: false,
        isActive: true
      },
      {
        name: 'Mascotas',
        description: 'Acepta mascotas',
        type: 'boolean' as FeatureType,
        category: 'general' as FeatureCategory,
        displayOrder: 11,
        isRequired: false,
        isActive: true
      },

      // Características adicionales
      {
        name: 'Vista al Mar',
        description: 'Tiene vista al mar',
        type: 'boolean' as FeatureType,
        category: 'external' as FeatureCategory,
        displayOrder: 16,
        isRequired: false,
        isActive: true
      },
      {
        name: 'Vista a la Montaña',
        description: 'Tiene vista a la montaña',
        type: 'boolean' as FeatureType,
        category: 'external' as FeatureCategory,
        displayOrder: 17,
        isRequired: false,
        isActive: true
      },
      {
        name: 'Área de BBQ',
        description: 'Tiene área de parrilla/BBQ',
        type: 'boolean' as FeatureType,
        category: 'external' as FeatureCategory,
        displayOrder: 18,
        isRequired: false,
        isActive: true
      },
      {
        name: 'Cuarto de Servicio',
        description: 'Tiene cuarto de servicio',
        type: 'boolean' as FeatureType,
        category: 'internal' as FeatureCategory,
        displayOrder: 19,
        isRequired: false,
        isActive: true
      },
      {
        name: 'Closets',
        description: 'Número de closets',
        type: 'number' as FeatureType,
        category: 'internal' as FeatureCategory,
        unit: 'unidades',
        displayOrder: 20,
        isRequired: false,
        isActive: true
      }
    ];

    this.log('Creating property features...', 'info');
    const createdFeatures = await this.createIfNotExists(PropertyFeature, propertyFeatures, 'name');
    this.log(`Successfully created ${createdFeatures.length} property features`, 'success');
  }
}