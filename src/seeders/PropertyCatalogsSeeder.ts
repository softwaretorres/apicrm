// src/seeders/PropertyCatalogsSeeder.ts

import { BaseSeeder } from './BaseSeeder';
import { PropertyType } from '../entities/PropertyType';
import { PropertyStatus } from '../entities/PropertyStatus';
import { TransactionType } from '../entities/TransactionType';
import { PropertyCondition } from '../entities/PropertyCondition';
import { PropertyFeature, FeatureType, FeatureCategory } from '../entities/PropertyFeature';

export class PropertyCatalogsSeeder extends BaseSeeder {
  
  async run(): Promise<void> {
    await this.seedPropertyTypes();
    await this.seedPropertyStatuses();
    await this.seedTransactionTypes();
    await this.seedPropertyConditions();
    await this.seedPropertyFeatures();
  }

  private async seedPropertyTypes(): Promise<void> {
    const propertyTypes = [
      { name: 'Casa', description: 'Casa unifamiliar' },
      { name: 'Apartamento', description: 'Apartamento o departamento' },
      { name: 'Condominio', description: 'Condominio o townhouse' },
      { name: 'Lote', description: 'Terreno o lote' },
      { name: 'Comercial', description: 'Propiedad comercial' },
      { name: 'Oficina', description: 'Espacio de oficina' },
      { name: 'Bodega', description: 'Bodega o almacén' },
      { name: 'Local Comercial', description: 'Local para negocio' },
      { name: 'Finca', description: 'Finca o propiedad rural' },
      { name: 'Penthouse', description: 'Penthouse de lujo' },
      { name: 'Studio', description: 'Estudio o loft' },
      { name: 'Duplex', description: 'Duplex o casa de dos niveles' }
    ];

    this.log('Creating property types...', 'info');
    await this.createIfNotExists<PropertyType>(PropertyType, propertyTypes, 'name');
  }

  private async seedPropertyStatuses(): Promise<void> {
    const propertyStatuses = [
      { name: 'Disponible', description: 'Propiedad disponible para venta/alquiler', color: '#28a745' },
      { name: 'En Proceso', description: 'Negociación en curso', color: '#ffc107' },
      { name: 'Vendida', description: 'Propiedad vendida', color: '#17a2b8' },
      { name: 'Alquilada', description: 'Propiedad alquilada', color: '#6f42c1' },
      { name: 'Retirada', description: 'Retirada del mercado', color: '#6c757d' },
      { name: 'Reservada', description: 'Reservada por cliente', color: '#fd7e14' },
      { name: 'En Construcción', description: 'Propiedad en construcción', color: '#20c997' },
      { name: 'Mantenimiento', description: 'En proceso de mantenimiento', color: '#dc3545' }
    ];

    this.log('Creating property statuses...', 'info');
    await this.createIfNotExists<PropertyStatus>(PropertyStatus, propertyStatuses, 'name');
  }

  private async seedTransactionTypes(): Promise<void> {
    const transactionTypes = [
      { name: 'Venta', description: 'Venta de propiedad' },
      { name: 'Alquiler', description: 'Alquiler de propiedad' },
      { name: 'Venta/Alquiler', description: 'Disponible para venta o alquiler' },
      { name: 'Permuta', description: 'Intercambio de propiedades' },
      { name: 'Traspaso', description: 'Traspaso de negocio' },
      { name: 'Anticresis', description: 'Anticresis o préstamo con garantía' }
    ];

    this.log('Creating transaction types...', 'info');
    await this.createIfNotExists<TransactionType>(TransactionType, transactionTypes, 'name');
  }

  private async seedPropertyConditions(): Promise<void> {
    const propertyConditions = [
      { name: 'Excelente', description: 'Estado excelente, como nuevo', displayOrder: 1 },
      { name: 'Muy Bueno', description: 'Estado muy bueno, pocas mejoras necesarias', displayOrder: 2 },
      { name: 'Bueno', description: 'Estado bueno, algunas mejoras menores', displayOrder: 3 },
      { name: 'Regular', description: 'Estado regular, requiere mejoras', displayOrder: 4 },
      { name: 'A Remodelar', description: 'Requiere remodelación completa', displayOrder: 5 },
      { name: 'En Construcción', description: 'Propiedad en construcción', displayOrder: 6 },
      { name: 'Obra Gris', description: 'Construcción en obra gris', displayOrder: 7 },
      { name: 'Nuevo', description: 'Propiedad completamente nueva', displayOrder: 0 }
    ];

    this.log('Creating property conditions...', 'info');
    await this.createIfNotExists<PropertyCondition>(PropertyCondition, propertyConditions, 'name');
  }

  private async seedPropertyFeatures(): Promise<void> {
    const propertyFeatures = [
      // Características Internas
      { 
        name: 'Aire Acondicionado', 
        description: 'Sistema de aire acondicionado',
        type: FeatureType.BOOLEAN,
        category: FeatureCategory.INTERNAL,
        displayOrder: 1
      },
      { 
        name: 'Calefacción', 
        description: 'Sistema de calefacción',
        type: FeatureType.BOOLEAN,
        category: FeatureCategory.INTERNAL,
        displayOrder: 2
      },
      { 
        name: 'Chimenea', 
        description: 'Chimenea funcional',
        type: FeatureType.BOOLEAN,
        category: FeatureCategory.INTERNAL,
        displayOrder: 3
      },
      { 
        name: 'Cocina Integral', 
        description: 'Cocina completamente equipada',
        type: FeatureType.BOOLEAN,
        category: FeatureCategory.INTERNAL,
        displayOrder: 4
      },
      { 
        name: 'Walk-in Closet', 
        description: 'Closet vestidor',
        type: FeatureType.BOOLEAN,
        category: FeatureCategory.INTERNAL,
        displayOrder: 5
      },
      { 
        name: 'Estudio/Oficina', 
        description: 'Espacio para estudio u oficina',
        type: FeatureType.BOOLEAN,
        category: FeatureCategory.INTERNAL,
        displayOrder: 6
      },
      { 
        name: 'Cuarto de Servicio', 
        description: 'Habitación de servicio',
        type: FeatureType.BOOLEAN,
        category: FeatureCategory.INTERNAL,
        displayOrder: 7
      },
      { 
        name: 'Sala de TV', 
        description: 'Sala familiar o de televisión',
        type: FeatureType.BOOLEAN,
        category: FeatureCategory.INTERNAL,
        displayOrder: 8
      },

      // Características Externas
      { 
        name: 'Jardín', 
        description: 'Área de jardín',
        type: FeatureType.BOOLEAN,
        category: FeatureCategory.EXTERNAL,
        displayOrder: 1
      },
      { 
        name: 'Piscina', 
        description: 'Piscina privada',
        type: FeatureType.BOOLEAN,
        category: FeatureCategory.EXTERNAL,
        displayOrder: 2
      },
      { 
        name: 'Terraza', 
        description: 'Terraza o balcón',
        type: FeatureType.BOOLEAN,
        category: FeatureCategory.EXTERNAL,
        displayOrder: 3
      },
      { 
        name: 'BBQ/Parrilla', 
        description: 'Área de barbacoa',
        type: FeatureType.BOOLEAN,
        category: FeatureCategory.EXTERNAL,
        displayOrder: 4
      },
      { 
        name: 'Garaje Cubierto', 
        description: 'Garaje techado',
        type: FeatureType.BOOLEAN,
        category: FeatureCategory.EXTERNAL,
        displayOrder: 5
      },
      { 
        name: 'Portón Eléctrico', 
        description: 'Portón automático',
        type: FeatureType.BOOLEAN,
        category: FeatureCategory.EXTERNAL,
        displayOrder: 6
      },

      // Características Generales
      { 
        name: 'Amoblado', 
        description: 'Propiedad amoblada',
        type: FeatureType.BOOLEAN,
        category: FeatureCategory.GENERAL,
        displayOrder: 1
      },
      { 
        name: 'Seguridad 24/7', 
        description: 'Seguridad las 24 horas',
        type: FeatureType.BOOLEAN,
        category: FeatureCategory.GENERAL,
        displayOrder: 2
      },
      { 
        name: 'Ascensor', 
        description: 'Acceso por ascensor',
        type: FeatureType.BOOLEAN,
        category: FeatureCategory.GENERAL,
        displayOrder: 3
      },
      { 
        name: 'Mascotas Permitidas', 
        description: 'Se permiten mascotas',
        type: FeatureType.BOOLEAN,
        category: FeatureCategory.GENERAL,
        displayOrder: 4
      },
      { 
        name: 'Vista Panorámica', 
        description: 'Vista excepcional',
        type: FeatureType.BOOLEAN,
        category: FeatureCategory.GENERAL,
        displayOrder: 5
      },
      { 
        name: 'Cerca Transporte', 
        description: 'Cerca al transporte público',
        type: FeatureType.BOOLEAN,
        category: FeatureCategory.GENERAL,
        displayOrder: 6
      },
      { 
        name: 'Zona Comercial', 
        description: 'Cerca a centros comerciales',
        type: FeatureType.BOOLEAN,
        category: FeatureCategory.GENERAL,
        displayOrder: 7
      },
      { 
        name: 'Colegios Cercanos', 
        description: 'Cerca a instituciones educativas',
        type: FeatureType.BOOLEAN,
        category: FeatureCategory.GENERAL,
        displayOrder: 8
      },

      // Características con valores numéricos
      { 
        name: 'Edad de Construcción', 
        description: 'Años desde la construcción',
        type: FeatureType.NUMBER,
        category: FeatureCategory.GENERAL,
        unit: 'años',
        displayOrder: 20
      },
      { 
        name: 'Número de Niveles', 
        description: 'Cantidad de pisos o niveles',
        type: FeatureType.NUMBER,
        category: FeatureCategory.GENERAL,
        unit: 'niveles',
        displayOrder: 21
      },

      // Características de texto
      { 
        name: 'Tipo de Construcción', 
        description: 'Material principal de construcción',
        type: FeatureType.TEXT,
        category: FeatureCategory.GENERAL,
        displayOrder: 30
      },
      { 
        name: 'Observaciones Especiales', 
        description: 'Características únicas o especiales',
        type: FeatureType.TEXT,
        category: FeatureCategory.GENERAL,
        displayOrder: 31
      },

      // Características de opción múltiple
      { 
        name: 'Tipo de Cocina', 
        description: 'Tipo de cocina instalada',
        type: FeatureType.MULTIPLE_CHOICE,
        category: FeatureCategory.INTERNAL,
        options: ['Integral', 'Americana', 'Tradicional', 'Kitchenette'],
        displayOrder: 10
      },
      { 
        name: 'Vista', 
        description: 'Tipo de vista de la propiedad',
        type: FeatureType.MULTIPLE_CHOICE,
        category: FeatureCategory.GENERAL,
        options: ['Ciudad', 'Montaña', 'Mar', 'Jardín', 'Piscina', 'Interior'],
        displayOrder: 32
      }
    ];

    this.log('Creating property features...', 'info');
    await this.createIfNotExists<PropertyFeature>(PropertyFeature, propertyFeatures, 'name');
  }
}