// =====================================================
// src/seeders/PropertySeeder.ts
// =====================================================
import { DataSource, Not, IsNull } from 'typeorm';
import { Property } from '../entities/Property';
import { PropertyType } from '../entities/PropertyType';
import { PropertyStatus } from '../entities/PropertyStatus';
import { TransactionType } from '../entities/TransactionType';
import { PropertyCondition } from '../entities/PropertyCondition';
import { PropertyFeature } from '../entities/PropertyFeature';
import { PropertyFeatureValue } from '../entities/PropertyFeatureValue';
import { PropertyImage } from '../entities/PropertyImage';
import { generateUniqueSlug } from '../utils/slugGenerator';

export class PropertySeeder {
  constructor(private dataSource: DataSource) {}

  async run() {
    console.log('🌱 Iniciando seeder de propiedades...');

    try {
      // Obtener repositorios
      const propertyRepo = this.dataSource.getRepository(Property);
      const propertyTypeRepo = this.dataSource.getRepository(PropertyType);
      const propertyStatusRepo = this.dataSource.getRepository(PropertyStatus);
      const transactionTypeRepo = this.dataSource.getRepository(TransactionType);
      const propertyConditionRepo = this.dataSource.getRepository(PropertyCondition);
      const propertyFeatureRepo = this.dataSource.getRepository(PropertyFeature);
      const propertyImageRepo = this.dataSource.getRepository(PropertyImage);
      const featureValueRepo = this.dataSource.getRepository(PropertyFeatureValue);

      // Verificar si ya existen propiedades
      const existingPropertiesCount = await propertyRepo.count();
      if (existingPropertiesCount > 0) {
        console.log('⚠️  Ya existen propiedades en la base de datos. Saltando seeder.');
        return;
      }

      // Obtener los IDs de los catálogos
      const casa = await propertyTypeRepo.findOne({ where: { name: 'Casa' } });
      const apartamento = await propertyTypeRepo.findOne({ where: { name: 'Apartamento' } });
      const finca = await propertyTypeRepo.findOne({ where: { name: 'Finca' } });
      const localComercial = await propertyTypeRepo.findOne({ where: { name: 'Local Comercial' } });
      
      const disponible = await propertyStatusRepo.findOne({ where: { name: 'Disponible' } });
      const vendida = await propertyStatusRepo.findOne({ where: { name: 'Vendida' } });
      const enProceso = await propertyStatusRepo.findOne({ where: { name: 'En Proceso' } });
      
      const venta = await transactionTypeRepo.findOne({ where: { name: 'Venta' } });
      const alquiler = await transactionTypeRepo.findOne({ where: { name: 'Alquiler' } });
      
      const excelente = await propertyConditionRepo.findOne({ where: { name: 'Excelente' } });
      const buena = await propertyConditionRepo.findOne({ where: { name: 'Buena' } });
      const muyBuena = await propertyConditionRepo.findOne({ where: { name: 'Muy Buena' } });

      // Obtener algunas características
      const piscina = await propertyFeatureRepo.findOne({ where: { name: 'Piscina' } });
      const garaje = await propertyFeatureRepo.findOne({ where: { name: 'Garaje' } });
      const jardin = await propertyFeatureRepo.findOne({ where: { name: 'Jardín' } });
      const aireAcondicionado = await propertyFeatureRepo.findOne({ where: { name: 'Aire Acondicionado' } });
      const balcon = await propertyFeatureRepo.findOne({ where: { name: 'Balcón' } });
      const terraza = await propertyFeatureRepo.findOne({ where: { name: 'Terraza' } });
      const ascensor = await propertyFeatureRepo.findOne({ where: { name: 'Ascensor' } });
      const seguridad = await propertyFeatureRepo.findOne({ where: { name: 'Seguridad' } });

      // Datos de ejemplo para propiedades
      const propertiesData = [
        {
          title: 'Casa Moderna en Zona Residencial Exclusiva',
          description: 'Hermosa casa de dos plantas en excelente ubicación residencial. Cuenta con amplios espacios, jardín privado, piscina y garaje para dos vehículos. Perfecta para familias que buscan tranquilidad y comodidad. La propiedad cuenta con acabados de lujo y está lista para habitar.',
          userId: 1,
          propertyTypeId: casa?.id || 1,
          propertyStatusId: disponible?.id || 1,
          transactionTypeId: venta?.id || 1,
          propertyConditionId: excelente?.id || 1,
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
              displayOrder: 1, // ✅ CAMBIADO: order → displayOrder
              isPrimary: true
            },
            {
              url: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800',
              alt: 'Sala principal con acabados modernos',
              title: 'Sala Principal',
              displayOrder: 2, // ✅ CAMBIADO: order → displayOrder
              isPrimary: false
            },
            {
              url: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=800',
              alt: 'Cocina integral moderna',
              title: 'Cocina Integral',
              displayOrder: 3, // ✅ CAMBIADO: order → displayOrder
              isPrimary: false
            },
            {
              url: 'https://images.unsplash.com/photo-1544984243-ec57ea16fe25?w=800',
              alt: 'Piscina y área social',
              title: 'Área de Piscina',
              displayOrder: 4, // ✅ CAMBIADO: order → displayOrder
              isPrimary: false
            }
          ],
          features: [
            { featureId: piscina?.id, value: 'true' },
            { featureId: garaje?.id, value: '2' },
            { featureId: jardin?.id, value: 'true' },
            { featureId: aireAcondicionado?.id, value: 'Central' },
            { featureId: seguridad?.id, value: 'Conjunto cerrado' }
          ]
        },
        {
          title: 'Apartamento Ejecutivo Centro Empresarial',
          description: 'Moderno apartamento en el corazón del centro empresarial de la ciudad. Excelente conectividad y cerca de centros comerciales, universidades y hospitales. Ideal para profesionales y ejecutivos. Edificio con todas las comodidades modernas.',
          userId: 1,
          propertyTypeId: apartamento?.id || 2,
          propertyStatusId: disponible?.id || 1,
          transactionTypeId: alquiler?.id || 2,
          propertyConditionId: excelente?.id || 1,
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
              displayOrder: 1, // ✅ CAMBIADO: order → displayOrder
              isPrimary: true
            },
            {
              url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
              alt: 'Habitación principal con closet',
              title: 'Habitación Principal',
              displayOrder: 2, // ✅ CAMBIADO: order → displayOrder
              isPrimary: false
            },
            {
              url: 'https://images.unsplash.com/photo-1560448075-bb485b067938?w=800',
              alt: 'Balcón con vista a la ciudad',
              title: 'Balcón',
              displayOrder: 3, // ✅ CAMBIADO: order → displayOrder
              isPrimary: false
            }
          ],
          features: [
            { featureId: garaje?.id, value: '1' },
            { featureId: aireAcondicionado?.id, value: 'Splits' },
            { featureId: balcon?.id, value: 'true' },
            { featureId: ascensor?.id, value: 'true' }
          ]
        },
        {
          title: 'Finca Recreativa Las Palmas - Paraíso Natural',
          description: 'Hermosa finca ubicada en las afueras de la ciudad, perfecta para descanso y recreación familiar. Cuenta con amplios espacios verdes, vista panorámica a las montañas, casa principal completamente equipada y múltiples zonas de recreación. Ideal para eventos familiares y retiros.',
          userId: 1,
          propertyTypeId: finca?.id || 4,
          propertyStatusId: disponible?.id || 1,
          transactionTypeId: venta?.id || 1,
          propertyConditionId: buena?.id || 3,
          address: 'Vereda Las Palmas, Km 15 Vía al Mar',
          city: 'Jamundí',
          state: 'Valle del Cauca',
          country: 'Colombia',
          zipCode: '763050',
          latitude: 3.2647,
          longitude: -76.5447,
          price: 280000000,
          currency: 'COP',
          pricePerSqft: 56000,
          totalArea: 5000,
          builtArea: 120,
          bedrooms: 3,
          bathrooms: 2,
          parkingSpaces: 4,
          floors: 1,
          yearBuilt: 2015,
          contactName: 'Carlos Rodríguez',
          contactPhone: '+57 320 555 7890',
          contactEmail: 'carlos.rodriguez@email.com',
          isActive: true,
          isFeatured: true,
          isPublished: true,
          publishedAt: new Date(),
          tags: ['finca', 'recreativa', 'naturaleza', 'familiar', 'montanas'],
          images: [
            {
              url: 'https://images.unsplash.com/photo-1464822759844-d150baec4e5c?w=800',
              alt: 'Vista panorámica de la finca',
              title: 'Vista Panorámica',
              displayOrder: 1, // ✅ CAMBIADO: order → displayOrder
              isPrimary: true
            },
            {
              url: 'https://images.unsplash.com/photo-1500076656116-558758c991c1?w=800',
              alt: 'Casa principal de la finca',
              title: 'Casa Principal',
              displayOrder: 2, // ✅ CAMBIADO: order → displayOrder
              isPrimary: false
            },
            {
              url: 'https://images.unsplash.com/photo-1521401830884-6c03c1c87ebb?w=800',
              alt: 'Zona verde y jardines',
              title: 'Zona Verde',
              displayOrder: 3, // ✅ CAMBIADO: order → displayOrder
              isPrimary: false
            },
            {
              url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
              alt: 'Área de recreación',
              title: 'Área de Recreación',
              displayOrder: 4, // ✅ CAMBIADO: order → displayOrder
              isPrimary: false
            }
          ],
          features: [
            { featureId: piscina?.id, value: 'true' },
            { featureId: jardin?.id, value: 'true' },
            { featureId: garaje?.id, value: '4' },
            { featureId: terraza?.id, value: 'true' }
          ]
        },
        {
          title: 'Local Comercial Zona Rosa - Excelente Ubicación',
          description: 'Amplio local comercial en la zona rosa de la ciudad, ideal para cualquier tipo de negocio. Excelente flujo peatonal, fácil acceso vehicular y transporte público. Perfecto para restaurantes, oficinas, consultorios o retail. Listo para adecuar según las necesidades del cliente.',
          userId: 1,
          propertyTypeId: localComercial?.id || 5,
          propertyStatusId: disponible?.id || 1,
          transactionTypeId: alquiler?.id || 2,
          propertyConditionId: muyBuena?.id || 2,
          address: 'Avenida 6N #15-25, Zona Rosa',
          city: 'Cali',
          state: 'Valle del Cauca',
          country: 'Colombia',
          zipCode: '760010',
          latitude: 3.4481,
          longitude: -76.5317,
          price: 8500000,
          currency: 'COP',
          pricePerSqft: 56667,
          totalArea: 150,
          builtArea: 150,
          bedrooms: 0,
          bathrooms: 2,
          parkingSpaces: 0,
          floors: 1,
          yearBuilt: 2018,
          contactName: 'Ana López',
          contactPhone: '+57 315 444 5678',
          contactEmail: 'ana.lopez@email.com',
          isActive: true,
          isFeatured: false,
          isPublished: true,
          publishedAt: new Date(),
          tags: ['local-comercial', 'zona-rosa', 'negocio', 'comercial'],
          images: [
            {
              url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
              alt: 'Fachada del local comercial',
              title: 'Fachada del Local',
              displayOrder: 1, // ✅ CAMBIADO: order → displayOrder
              isPrimary: true
            },
            {
              url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
              alt: 'Interior amplio del local',
              title: 'Interior del Local',
              displayOrder: 2, // ✅ CAMBIADO: order → displayOrder
              isPrimary: false
            }
          ],
          features: [
            { featureId: aireAcondicionado?.id, value: 'Central' },
            { featureId: seguridad?.id, value: 'Cámaras' }
          ]
        },
        {
          title: 'Apartamento Familiar Norte de Cali',
          description: 'Cómodo apartamento familiar en conjunto residencial cerrado al norte de la ciudad. Excelente para familias, con zonas verdes, parque infantil y vigilancia 24 horas. Cerca de colegios y centros comerciales.',
          userId: 1,
          propertyTypeId: apartamento?.id || 2,
          propertyStatusId: enProceso?.id || 4,
          transactionTypeId: venta?.id || 1,
          propertyConditionId: muyBuena?.id || 2,
          address: 'Carrera 100 #15-45, Conjunto Los Arrayanes',
          city: 'Cali',
          state: 'Valle del Cauca',
          country: 'Colombia',
          zipCode: '760031',
          latitude: 3.4833,
          longitude: -76.5319,
          price: 320000000,
          currency: 'COP',
          pricePerSqft: 2666667,
          totalArea: 120,
          builtArea: 120,
          bedrooms: 3,
          bathrooms: 2,
          parkingSpaces: 1,
          floors: 1,
          yearBuilt: 2017,
          contactName: 'Pedro Martínez',
          contactPhone: '+57 318 777 8899',
          contactEmail: 'pedro.martinez@email.com',
          isActive: true,
          isFeatured: false,
          isPublished: true,
          publishedAt: new Date(),
          tags: ['apartamento', 'familiar', 'conjunto-cerrado', 'norte'],
          images: [
            {
              url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
              alt: 'Vista del apartamento familiar',
              title: 'Apartamento Familiar',
              displayOrder: 1, // ✅ CAMBIADO: order → displayOrder
              isPrimary: true
            },
            {
              url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
              alt: 'Zona de estar',
              title: 'Zona de Estar',
              displayOrder: 2, // ✅ CAMBIADO: order → displayOrder
              isPrimary: false
            }
          ],
          features: [
            { featureId: garaje?.id, value: '1' },
            { featureId: aireAcondicionado?.id, value: 'Splits' },
            { featureId: seguridad?.id, value: 'Conjunto cerrado' },
            { featureId: balcon?.id, value: 'true' }
          ]
        },
        {
          title: 'Casa Campestre La María - Estilo Colonial',
          description: 'Preciosa casa de estilo colonial en La María, perfecta para quienes buscan tranquilidad sin alejarse de la ciudad. Amplios corredores, jardines tradicionales y arquitectura que conserva el encanto de antaño con las comodidades modernas.',
          userId: 1,
          propertyTypeId: casa?.id || 1,
          propertyStatusId: vendida?.id || 2,
          transactionTypeId: venta?.id || 1,
          propertyConditionId: buena?.id || 3,
          address: 'Carrera 25 #8-15, Barrio La María',
          city: 'Cali',
          state: 'Valle del Cauca',
          country: 'Colombia',
          zipCode: '760042',
          latitude: 3.4214,
          longitude: -76.5205,
          price: 380000000,
          currency: 'COP',
          pricePerSqft: 1727273,
          totalArea: 220,
          builtArea: 160,
          bedrooms: 4,
          bathrooms: 3,
          parkingSpaces: 1,
          floors: 1,
          yearBuilt: 1995,
          contactName: 'Elena Vargas',
          contactPhone: '+57 312 666 1234',
          contactEmail: 'elena.vargas@email.com',
          isActive: true,
          isFeatured: false,
          isPublished: true,
          publishedAt: new Date(),
          tags: ['casa', 'colonial', 'tradicional', 'la-maria'],
          images: [
            {
              url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800',
              alt: 'Casa estilo colonial',
              title: 'Casa Colonial',
              displayOrder: 1, // ✅ CAMBIADO: order → displayOrder
              isPrimary: true
            }
          ],
          features: [
            { featureId: garaje?.id, value: '1' },
            { featureId: jardin?.id, value: 'true' },
            { featureId: terraza?.id, value: 'true' }
          ]
        }
      ];

      // Crear propiedades
      for (const propertyData of propertiesData) {
        const { images, features, ...propertyInfo } = propertyData;
        
        // 🔥 GENERAR SLUG ÚNICO para cada propiedad
        console.log(`🏷️  Generando slug para: "${propertyInfo.title}"`);
        
        const slug = await generateUniqueSlug(
          propertyInfo.title,
          async (slugToCheck) => {
            const existing = await propertyRepo.findOne({ where: { slug: slugToCheck } });
            return !!existing;
          }
        );
        
        console.log(`✅ Slug generado: "${slug}"`);
        
        // Crear la propiedad con el slug generado
        const propertyWithSlug = {
          ...propertyInfo,
          slug: slug
        };

        // Crear la propiedad
        const property = propertyRepo.create(propertyWithSlug);
        const savedProperty = await propertyRepo.save(property);
        
        // Verificar que se guardó con slug
        if (!savedProperty.slug) {
          console.error(`❌ ERROR: Propiedad ${savedProperty.id} se guardó sin slug!`);
        } else {
          console.log(`✅ Propiedad guardada con slug: "${savedProperty.slug}"`);
        }

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

        console.log(`✅ Propiedad creada: ${savedProperty.title} (ID: ${savedProperty.id}, Slug: ${savedProperty.slug})`);
      }

      // 🔍 VERIFICACIÓN FINAL: Contar propiedades con slugs
      const totalProperties = await propertyRepo.count();
      const propertiesWithSlugs = await propertyRepo.count({ where: { slug: Not(IsNull()) } });
      const propertiesWithoutSlugs = totalProperties - propertiesWithSlugs;

      console.log('🎉 Seeder de propiedades completado exitosamente');
      console.log(`📊 Total de propiedades creadas: ${propertiesData.length}`);
      console.log(`✅ Propiedades con slugs: ${propertiesWithSlugs}/${totalProperties}`);
      
      if (propertiesWithoutSlugs > 0) {
        console.log(`❌ Propiedades SIN slugs: ${propertiesWithoutSlugs}`);
      } else {
        console.log(`🎯 ¡Todas las propiedades tienen slugs generados!`);
      }

      // 🔍 MOSTRAR TODOS LOS SLUGS GENERADOS
      const allProperties = await propertyRepo.find({ 
        select: ['id', 'title', 'slug'],
        order: { id: 'ASC' }
      });

      console.log('\n📋 SLUGS GENERADOS:');
      allProperties.forEach(prop => {
        console.log(`   ${prop.id}. "${prop.title}" → "${prop.slug}"`);
      });

    } catch (error) {
      console.error('❌ Error en el seeder de propiedades:', error);
      throw error;
    }
  }
}

// Función para ejecutar el seeder
export const runPropertySeeder = async (dataSource: DataSource) => {
  const seeder = new PropertySeeder(dataSource);
  await seeder.run();
};

// Función para ejecutar solo el seeder (para testing)
export const runSeederStandalone = async () => {
  const { AppDataSource } = await import('../config/database');
  
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    
    await runPropertySeeder(AppDataSource);
    
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  } catch (error) {
    console.error('❌ Error ejecutando seeder standalone:', error);
    process.exit(1);
  }
};

// Si se ejecuta directamente
if (require.main === module) {
  runSeederStandalone();
}