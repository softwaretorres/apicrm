// src/seeders/PropertySeeder.ts

import { BaseSeeder } from './BaseSeeder';
import { AppDataSource } from '../config/database';
import { Property } from '../entities/Property';
import { PropertyType } from '../entities/PropertyType';
import { PropertyStatus } from '../entities/PropertyStatus';
import { TransactionType } from '../entities/TransactionType';
import { PropertyCondition } from '../entities/PropertyCondition';
import { PropertyFeature } from '../entities/PropertyFeature';
import { PropertyFeatureValue } from '../entities/PropertyFeatureValue';
import { PropertyImage } from '../entities/PropertyImage';
import { User } from '../entities/User';

export class PropertySeeder extends BaseSeeder {

  async run(): Promise<void> {
    // Verificar si ya existen propiedades
    if (await this.hasData(Property)) {
      this.log('Properties already exist, skipping...', 'info');
      return;
    }

    // Obtener repositorios
    const propertyRepo = AppDataSource.getRepository(Property);
    const propertyTypeRepo = AppDataSource.getRepository(PropertyType);
    const propertyStatusRepo = AppDataSource.getRepository(PropertyStatus);
    const transactionTypeRepo = AppDataSource.getRepository(TransactionType);
    const propertyConditionRepo = AppDataSource.getRepository(PropertyCondition);
    const propertyFeatureRepo = AppDataSource.getRepository(PropertyFeature);
    const propertyImageRepo = AppDataSource.getRepository(PropertyImage);
    const featureValueRepo = AppDataSource.getRepository(PropertyFeatureValue);
    const userRepo = AppDataSource.getRepository(User);

    // Obtener usuarios existentes para asignar propiedades
    const users = await userRepo.find({ take: 5 });
    if (users.length === 0) {
      this.log('No users found. Please run users seeder first.', 'warning');
      return;
    }

    // Obtener catálogos
    const catalogs = await this.getCatalogs({
      propertyTypeRepo,
      propertyStatusRepo,
      transactionTypeRepo,
      propertyConditionRepo,
      propertyFeatureRepo
    });

    // Datos de propiedades
    const propertiesData = [
      {
        title: 'Casa Moderna en Zona Residencial Exclusiva',
        description: 'Hermosa casa de dos plantas en excelente ubicación residencial. Cuenta con amplios espacios, jardín privado, piscina y garaje para dos vehículos. Perfecta para familias que buscan tranquilidad y comodidad. La propiedad cuenta con acabados de lujo y está lista para habitar.',
        userId: users[0]?.id || 1,
        propertyTypeId: catalogs.casa?.id || 1,
        propertyStatusId: catalogs.disponible?.id || 1,
        transactionTypeId: catalogs.venta?.id || 1,
        propertyConditionId: catalogs.excelente?.id || 1,
        address: 'Calle 123 #45-67, Urbanización Los Pinos',
        city: 'Cali',
        state: 'Valle del Cauca',
        country: 'Colombia',
        zipCode: '760001',
        latitude: 3.4516,
        longitude: -76.5320,
        price: 450000000,
        currency: 'COP',
        pricePerSqft: 1800000,
        totalArea: 250,
        builtArea: 180,
        bedrooms: 4,
        bathrooms: 3,
        parkingSpaces: 2,
        floors: 2,
        yearBuilt: 2020,
        contactName: 'Juan Pérez',
        contactPhone: '+57 300 123 4567',
        contactEmail: 'juan.perez@email.com',
        isActive: true,
        isFeatured: true,
        isPublished: true,
        publishedAt: new Date(),
        tags: ['casa', 'moderna', 'piscina', 'jardin', 'zona-norte'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
            alt: 'Fachada principal de la casa moderna',
            title: 'Fachada Principal',
            order: 1,
            isPrimary: true
          },
          {
            url: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800',
            alt: 'Sala principal con acabados modernos',
            title: 'Sala Principal',
            order: 2,
            isPrimary: false
          },
          {
            url: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=800',
            alt: 'Cocina integral moderna',
            title: 'Cocina Integral',
            order: 3,
            isPrimary: false
          },
          {
            url: 'https://images.unsplash.com/photo-1544984243-ec57ea16fe25?w=800',
            alt: 'Piscina y área social',
            title: 'Área de Piscina',
            order: 4,
            isPrimary: false
          }
        ],
        features: [
          { featureId: catalogs.piscina?.id, value: 'true' },
          { featureId: catalogs.garaje?.id, value: '2' },
          { featureId: catalogs.jardin?.id, value: 'true' },
          { featureId: catalogs.aireAcondicionado?.id, value: 'Central' },
          { featureId: catalogs.seguridad?.id, value: 'Conjunto cerrado' }
        ]
      },
      {
        title: 'Apartamento Ejecutivo Centro Empresarial',
        description: 'Moderno apartamento en el corazón del centro empresarial de la ciudad. Excelente conectividad y cerca de centros comerciales, universidades y hospitales. Ideal para profesionales y ejecutivos. Edificio con todas las comodidades modernas.',
        userId: users[1]?.id || users[0]?.id || 1,
        propertyTypeId: catalogs.apartamento?.id || 2,
        propertyStatusId: catalogs.disponible?.id || 1,
        transactionTypeId: catalogs.alquiler?.id || 2,
        propertyConditionId: catalogs.excelente?.id || 1,
        address: 'Carrera 5 #10-20, Piso 8, Torre Empresarial',
        city: 'Cali',
        state: 'Valle del Cauca',
        country: 'Colombia',
        zipCode: '760002',
        latitude: 3.4372,
        longitude: -76.5225,
        price: 2500000,
        currency: 'COP',
        pricePerSqft: 29412,
        totalArea: 85,
        builtArea: 85,
        bedrooms: 2,
        bathrooms: 2,
        parkingSpaces: 1,
        floors: 1,
        yearBuilt: 2019,
        contactName: 'María González',
        contactPhone: '+57 310 987 6543',
        contactEmail: 'maria.gonzalez@email.com',
        isActive: true,
        isFeatured: false,
        isPublished: true,
        publishedAt: new Date(),
        tags: ['apartamento', 'centro', 'ejecutivo', 'moderno'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
            alt: 'Vista panorámica del apartamento',
            title: 'Vista Principal',
            order: 1,
            isPrimary: true
          },
          {
            url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
            alt: 'Habitación principal con closet',
            title: 'Habitación Principal',
            order: 2,
            isPrimary: false
          },
          {
            url: 'https://images.unsplash.com/photo-1560448075-bb485b067938?w=800',
            alt: 'Balcón con vista a la ciudad',
            title: 'Balcón',
            order: 3,
            isPrimary: false
          }
        ],
        features: [
          { featureId: catalogs.garaje?.id, value: '1' },
          { featureId: catalogs.aireAcondicionado?.id, value: 'Splits' },
          { featureId: catalogs.balcon?.id, value: 'true' },
          { featureId: catalogs.ascensor?.id, value: 'true' }
        ]
      },
      {
        title: 'Finca de Recreo con Casa Campestre',
        description: 'Hermosa finca de recreo con casa campestre de 3 habitaciones. Ideal para descanso y esparcimiento familiar. Cuenta con amplias zonas verdes, cultivos de café y frutas, y una casa principal totalmente equipada.',
        userId: users[2]?.id || users[0]?.id || 1,
        propertyTypeId: catalogs.finca?.id || 3,
        propertyStatusId: catalogs.disponible?.id || 1,
        transactionTypeId: catalogs.venta?.id || 1,
        propertyConditionId: catalogs.muyBuena?.id || 2,
        address: 'Vereda El Paraíso, Km 5 vía a Jamundí',
        city: 'Jamundí',
        state: 'Valle del Cauca',
        country: 'Colombia',
        zipCode: '760050',
        latitude: 3.2644,
        longitude: -76.5436,
        price: 320000000,
        currency: 'COP',
        pricePerSqft: 400000,
        totalArea: 8000,
        builtArea: 200,
        bedrooms: 3,
        bathrooms: 2,
        parkingSpaces: 3,
        floors: 1,
        yearBuilt: 2015,
        contactName: 'Carlos Ramírez',
        contactPhone: '+57 320 456 7890',
        contactEmail: 'carlos.ramirez@email.com',
        isActive: true,
        isFeatured: true,
        isPublished: true,
        publishedAt: new Date(),
        tags: ['finca', 'recreo', 'campestre', 'cultivos', 'naturaleza'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
            alt: 'Vista panorámica de la finca',
            title: 'Vista General',
            order: 1,
            isPrimary: true
          },
          {
            url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800',
            alt: 'Casa principal campestre',
            title: 'Casa Principal',
            order: 2,
            isPrimary: false
          }
        ],
        features: [
          { featureId: catalogs.jardin?.id, value: 'true' },
          { featureId: catalogs.terraza?.id, value: 'true' }
        ]
      },
      {
        title: 'Local Comercial en Centro Histórico',
        description: 'Amplio local comercial en zona de alto tráfico peatonal. Ideal para restaurante, tienda o cualquier negocio que requiera excelente ubicación. El local cuenta con todos los servicios y está listo para uso comercial.',
        userId: users[3]?.id || users[0]?.id || 1,
        propertyTypeId: catalogs.localComercial?.id || 4,
        propertyStatusId: catalogs.disponible?.id || 1,
        transactionTypeId: catalogs.alquiler?.id || 2,
        propertyConditionId: catalogs.buena?.id || 3,
        address: 'Calle 12 #5-67, Centro Histórico',
        city: 'Cali',
        state: 'Valle del Cauca',
        country: 'Colombia',
        zipCode: '760001',
        latitude: 3.4372,
        longitude: -76.5225,
        price: 8000000,
        currency: 'COP',
        pricePerSqft: 61538,
        totalArea: 130,
        builtArea: 130,
        bedrooms: 0,
        bathrooms: 2,
        parkingSpaces: 0,
        floors: 1,
        yearBuilt: 1990,
        contactName: 'Ana López',
        contactPhone: '+57 315 234 5678',
        contactEmail: 'ana.lopez@email.com',
        isActive: true,
        isFeatured: false,
        isPublished: true,
        publishedAt: new Date(),
        tags: ['local', 'comercial', 'centro', 'negocio'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
            alt: 'Fachada del local comercial',
            title: 'Fachada',
            order: 1,
            isPrimary: true
          }
        ],
        features: []
      },
      {
        title: 'Penthouse de Lujo con Vista Panorámica',
        description: 'Exclusivo penthouse en el edificio más prestigioso de la ciudad. Cuenta con 4 habitaciones, terraza privada, jacuzzi y una vista panorámica espectacular. Acabados de lujo en mármol y maderas finas.',
        userId: users[4]?.id || users[0]?.id || 1,
        propertyTypeId: catalogs.apartamento?.id || 2,
        propertyStatusId: catalogs.enProceso?.id || 3,
        transactionTypeId: catalogs.venta?.id || 1,
        propertyConditionId: catalogs.excelente?.id || 1,
        address: 'Avenida Colombia #2-45, Piso 25',
        city: 'Cali',
        state: 'Valle del Cauca',
        country: 'Colombia',
        zipCode: '760043',
        latitude: 3.4516,
        longitude: -76.5320,
        price: 1200000000,
        currency: 'COP',
        pricePerSqft: 6000000,
        totalArea: 200,
        builtArea: 180,
        bedrooms: 4,
        bathrooms: 3,
        parkingSpaces: 2,
        floors: 1,
        yearBuilt: 2022,
        contactName: 'Roberto Silva',
        contactPhone: '+57 300 789 0123',
        contactEmail: 'roberto.silva@email.com',
        isActive: true,
        isFeatured: true,
        isPublished: true,
        publishedAt: new Date(),
        tags: ['penthouse', 'lujo', 'vista', 'panoramica', 'exclusivo'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
            alt: 'Vista panorámica desde el penthouse',
            title: 'Vista Panorámica',
            order: 1,
            isPrimary: true
          },
          {
            url: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800',
            alt: 'Terraza privada con jacuzzi',
            title: 'Terraza Privada',
            order: 2,
            isPrimary: false
          }
        ],
        features: [
          { featureId: catalogs.terraza?.id, value: 'true' },
          { featureId: catalogs.aireAcondicionado?.id, value: 'Central' },
          { featureId: catalogs.ascensor?.id, value: 'true' },
          { featureId: catalogs.seguridad?.id, value: '24/7' }
        ]
      }
    ];

    // Crear propiedades
    let createdCount = 0;
    for (const propertyData of propertiesData) {
      try {
        const { images, features, ...propertyInfo } = propertyData;
        
        // Generar slug único
        const slug = await this.generateUniqueSlug(propertyInfo.title);
        
        // Crear la propiedad con el slug generado
        const propertyWithSlug = {
          ...propertyInfo,
          slug: slug
        };

        // Crear la propiedad
        const property = propertyRepo.create(propertyWithSlug);
        const savedProperty = await propertyRepo.save(property);
        
        this.log(`Property created with slug: "${savedProperty.slug}"`, 'success');

        // Crear imágenes
        for (const imageData of images) {
          const image = propertyImageRepo.create({
            ...imageData,
            propertyId: savedProperty.id
          });
          await propertyImageRepo.save(image);
        }

        // Crear características
        for (const featureData of features) {
          if (featureData.featureId) {
            const featureValue = featureValueRepo.create({
              propertyId: savedProperty.id,
              featureId: featureData.featureId,
              value: featureData.value
            });
            await featureValueRepo.save(featureValue);
          }
        }

        createdCount++;
        this.log(`Property created: ${savedProperty.title} (ID: ${savedProperty.id})`, 'success');
        
      } catch (error) {
        this.log(`Error creating property "${propertyData.title}": ${error}`, 'error');
      }
    }

    // Verificación final
    const totalProperties = await propertyRepo.count();
    this.log(`Total properties created: ${createdCount}/${propertiesData.length}`, 'success');
    this.log(`Total properties in database: ${totalProperties}`, 'info');

    // Mostrar slugs generados
    const allProperties = await propertyRepo.find({ 
      select: ['id', 'title', 'slug'],
      order: { id: 'ASC' }
    });

    this.log('Generated slugs:', 'info');
    allProperties.forEach(prop => {
      console.log(`   ${prop.id}. "${prop.title}" → "${prop.slug}"`);
    });
  }

  private async getCatalogs(repos: any) {
    const { propertyTypeRepo, propertyStatusRepo, transactionTypeRepo, propertyConditionRepo, propertyFeatureRepo } = repos;

    return {
      // Property Types
      casa: await propertyTypeRepo.findOne({ where: { name: 'Casa' } }),
      apartamento: await propertyTypeRepo.findOne({ where: { name: 'Apartamento' } }),
      finca: await propertyTypeRepo.findOne({ where: { name: 'Finca' } }),
      localComercial: await propertyTypeRepo.findOne({ where: { name: 'Local Comercial' } }),
      
      // Property Status
      disponible: await propertyStatusRepo.findOne({ where: { name: 'Disponible' } }),
      vendida: await propertyStatusRepo.findOne({ where: { name: 'Vendida' } }),
      enProceso: await propertyStatusRepo.findOne({ where: { name: 'En Proceso' } }),
      
      // Transaction Types
      venta: await transactionTypeRepo.findOne({ where: { name: 'Venta' } }),
      alquiler: await transactionTypeRepo.findOne({ where: { name: 'Alquiler' } }),
      
      // Property Conditions
      excelente: await propertyConditionRepo.findOne({ where: { name: 'Excelente' } }),
      buena: await propertyConditionRepo.findOne({ where: { name: 'Bueno' } }),
      muyBuena: await propertyConditionRepo.findOne({ where: { name: 'Muy Bueno' } }),

      // Property Features
      piscina: await propertyFeatureRepo.findOne({ where: { name: 'Piscina' } }),
      garaje: await propertyFeatureRepo.findOne({ where: { name: 'Garaje Cubierto' } }),
      jardin: await propertyFeatureRepo.findOne({ where: { name: 'Jardín' } }),
      aireAcondicionado: await propertyFeatureRepo.findOne({ where: { name: 'Aire Acondicionado' } }),
      balcon: await propertyFeatureRepo.findOne({ where: { name: 'Terraza' } }),
      terraza: await propertyFeatureRepo.findOne({ where: { name: 'Terraza' } }),
      ascensor: await propertyFeatureRepo.findOne({ where: { name: 'Ascensor' } }),
      seguridad: await propertyFeatureRepo.findOne({ where: { name: 'Seguridad 24/7' } })
    };
  }

  private async generateUniqueSlug(title: string): Promise<string> {
    const propertyRepo = AppDataSource.getRepository(Property);
    
    // Función básica para generar slug desde el título
    let baseSlug = title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    let slug = baseSlug;
    let counter = 1;

    // Verificar si el slug ya existe
    while (await propertyRepo.findOne({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }
}