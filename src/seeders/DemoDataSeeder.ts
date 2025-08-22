// src/seeders/DemoDataSeeder.ts

import { BaseSeeder } from './BaseSeeder';
import { AppDataSource } from '../config/database';
import { Organization } from '../entities/Organization';
import { User } from '../entities/User';
import { Property } from '../entities/Property';
import { PropertyType } from '../entities/PropertyType';
import { PropertyStatus } from '../entities/PropertyStatus';
import { TransactionType } from '../entities/TransactionType';
import { PropertyCondition } from '../entities/PropertyCondition';
import { Role } from '../entities/Role';
import { UserRole } from '../entities/UserRole';

export class DemoDataSeeder extends BaseSeeder {
  
  async run(): Promise<void> {
    // Solo crear datos demo si no existen organizaciones
    const organizationRepository = AppDataSource.getRepository(Organization);
    const existingOrganizations = await organizationRepository.count();
    
    if (existingOrganizations > 0) {
      this.log('Demo data already exists, skipping...', 'info');
      return;
    }

    try {
      await this.createDemoOrganizations();
      await this.createDemoUsers();
      await this.createDemoProperties();
    } catch (error) {
      this.log(`Error during demo data creation: ${error}`, 'error');
      throw error;
    }
  }

  private async createDemoOrganizations(): Promise<void> {
    const organizations = [
      {
        name: 'Inmobiliaria Premium',
        slug: 'inmobiliaria-premium',
        description: 'Inmobiliaria especializada en propiedades de lujo',
        address: 'Av. Principal 123',
        city: 'Bogotá',
        state: 'Cundinamarca',
        zipCode: '110111',
        country: 'Colombia',
        phone: '+57 1 234-5678',
        email: 'info@inmobiliariapremium.com',
        website: 'https://inmobiliariapremium.com',
        licenseNumber: 'INM-2024-001',
        subscriptionPlan: 'premium',
        maxUsers: 25,
        maxProperties: 500,
        usersCount: 0,
        propertiesCount: 0,
        isActive: true,
        isVerified: true
      },
      {
        name: 'Casas & Apartamentos',
        slug: 'casas-apartamentos',
        description: 'Tu hogar ideal te está esperando',
        address: 'Calle 45 #67-89',
        city: 'Medellín',
        state: 'Antioquia',
        zipCode: '050001',
        country: 'Colombia',
        phone: '+57 4 987-6543',
        email: 'contacto@casasyapartamentos.com',
        website: 'https://casasyapartamentos.com',
        licenseNumber: 'INM-2024-002',
        subscriptionPlan: 'basic',
        maxUsers: 5,
        maxProperties: 100,
        usersCount: 0,
        propertiesCount: 0,
        isActive: true,
        isVerified: true
      },
      {
        name: 'Propiedades del Valle',
        slug: 'propiedades-del-valle',
        description: 'Especialistas en el Valle del Cauca',
        address: 'Carrera 15 #34-56',
        city: 'Cali',
        state: 'Valle del Cauca',
        zipCode: '760001',
        country: 'Colombia',
        phone: '+57 2 555-1234',
        email: 'ventas@propiedadesdelvalle.com',
        website: 'https://propiedadesdelvalle.com',
        licenseNumber: 'INM-2024-003',
        subscriptionPlan: 'enterprise',
        maxUsers: -1,
        maxProperties: -1,
        usersCount: 0,
        propertiesCount: 0,
        isActive: true,
        isVerified: true
      }
    ];

    this.log('Creating demo organizations...', 'info');
    await this.createIfNotExists(Organization, organizations, 'slug');
  }

  private async createDemoUsers(): Promise<void> {
    const organizationRepository = AppDataSource.getRepository(Organization);
    const roleRepository = AppDataSource.getRepository(Role);
    const userRoleRepository = AppDataSource.getRepository(UserRole);

    const organizations = await organizationRepository.find();
    const adminRole = await roleRepository.findOne({ where: { name: 'admin' } });
    const managerRole = await roleRepository.findOne({ where: { name: 'manager' } });
    const agentRole = await roleRepository.findOne({ where: { name: 'agent' } });

    if (!adminRole || !managerRole || !agentRole) {
      this.log('Required roles not found. Please run RolesPermissionsSeeder first.', 'error');
      return;
    }

    const users = [
      // Inmobiliaria Premium
      {
        name: 'María González',
        email: 'maria.gonzalez@inmobiliariapremium.com',
        password: 'password123', // En producción usar hash
        firstName: 'María',
        lastName: 'González',
        phone: '+57 300 123-4567',
        organizationId: organizations.find(o => o.slug === 'inmobiliaria-premium')?.id,
        active: true,
        emailVerifiedAt: new Date(),
        roleId: adminRole.id
      },
      {
        name: 'Carlos Rodríguez',
        email: 'carlos.rodriguez@inmobiliariapremium.com',
        password: 'password123',
        firstName: 'Carlos',
        lastName: 'Rodríguez',
        phone: '+57 300 234-5678',
        organizationId: organizations.find(o => o.slug === 'inmobiliaria-premium')?.id,
        active: true,
        emailVerifiedAt: new Date(),
        roleId: managerRole.id
      },
      {
        name: 'Ana Martínez',
        email: 'ana.martinez@inmobiliariapremium.com',
        password: 'password123',
        firstName: 'Ana',
        lastName: 'Martínez',
        phone: '+57 300 345-6789',
        organizationId: organizations.find(o => o.slug === 'inmobiliaria-premium')?.id,
        active: true,
        emailVerifiedAt: new Date(),
        roleId: agentRole.id
      },

      // Casas & Apartamentos
      {
        name: 'Luis Pérez',
        email: 'luis.perez@casasyapartamentos.com',
        password: 'password123',
        firstName: 'Luis',
        lastName: 'Pérez',
        phone: '+57 300 456-7890',
        organizationId: organizations.find(o => o.slug === 'casas-apartamentos')?.id,
        active: true,
        emailVerifiedAt: new Date(),
        roleId: adminRole.id
      },
      {
        name: 'Diana López',
        email: 'diana.lopez@casasyapartamentos.com',
        password: 'password123',
        firstName: 'Diana',
        lastName: 'López',
        phone: '+57 300 567-8901',
        organizationId: organizations.find(o => o.slug === 'casas-apartamentos')?.id,
        active: true,
        emailVerifiedAt: new Date(),
        roleId: agentRole.id
      },

      // Propiedades del Valle
      {
        name: 'Roberto Silva',
        email: 'roberto.silva@propiedadesdelvalle.com',
        password: 'password123',
        firstName: 'Roberto',
        lastName: 'Silva',
        phone: '+57 300 678-9012',
        organizationId: organizations.find(o => o.slug === 'propiedades-del-valle')?.id,
        active: true,
        emailVerifiedAt: new Date(),
        roleId: adminRole.id
      },
      {
        name: 'Patricia Herrera',
        email: 'patricia.herrera@propiedadesdelvalle.com',
        password: 'password123',
        firstName: 'Patricia',
        lastName: 'Herrera',
        phone: '+57 300 789-0123',
        organizationId: organizations.find(o => o.slug === 'propiedades-del-valle')?.id,
        active: true,
        emailVerifiedAt: new Date(),
        roleId: managerRole.id
      }
    ];

    this.log('Creating demo users...', 'info');
    
    for (const userData of users) {
      const { roleId, ...userDataWithoutRole } = userData;
      const createdUsers = await this.createIfNotExists(User, [userDataWithoutRole], 'email');
      
      if (createdUsers.length > 0) {
        const user = createdUsers[0];
        
        // Asignar rol al usuario
        const userRole = userRoleRepository.create({
          userId: user.id,
          roleId: roleId,
          organizationId: user.organizationId
        });
        
        await userRoleRepository.save(userRole);
        this.log(`Assigned role to user: ${user.email}`, 'success');
        
        // Actualizar contador de usuarios en la organización
        if (user.organizationId) {
          await organizationRepository.increment(
            { id: user.organizationId },
            'usersCount',
            1
          );
        }
      }
    }
  }

  private async createDemoProperties(): Promise<void> {
    const organizationRepository = AppDataSource.getRepository(Organization);
    const userRepository = AppDataSource.getRepository(User);
    const propertyTypeRepository = AppDataSource.getRepository(PropertyType);
    const propertyStatusRepository = AppDataSource.getRepository(PropertyStatus);
    const transactionTypeRepository = AppDataSource.getRepository(TransactionType);
    const propertyConditionRepository = AppDataSource.getRepository(PropertyCondition);

    // Obtener todas las entidades relacionadas
    const organizations = await organizationRepository.find();
    const users = await userRepository.find();
    const propertyTypes = await propertyTypeRepository.find();
    const propertyStatuses = await propertyStatusRepository.find();
    const transactionTypes = await transactionTypeRepository.find();
    const propertyConditions = await propertyConditionRepository.find();

    // Verificar que tenemos datos necesarios
    if (propertyTypes.length === 0) {
      this.log('No property types found. Please run property types seeder first.', 'error');
      return;
    }

    if (propertyStatuses.length === 0) {
      this.log('No property statuses found. Please run property status seeder first.', 'error');
      return;
    }

    if (transactionTypes.length === 0) {
      this.log('No transaction types found. Please run transaction types seeder first.', 'error');
      return;
    }

    if (propertyConditions.length === 0) {
      this.log('No property conditions found. Please run property conditions seeder first.', 'error');
      return;
    }

    // Funciones helper para buscar entidades de forma segura
    const findPropertyType = (name: string) => {
      const found = propertyTypes.find(pt => pt.name === name);
      if (!found) {
        this.log(`Property type '${name}' not found, using first available`, 'warning');
        return propertyTypes[0];
      }
      return found;
    };

    const findPropertyStatus = (name: string) => {
      const found = propertyStatuses.find(ps => ps.name === name);
      if (!found) {
        this.log(`Property status '${name}' not found, using first available`, 'warning');
        return propertyStatuses[0];
      }
      return found;
    };

    const findTransactionType = (name: string) => {
      const found = transactionTypes.find(tt => tt.name === name);
      if (!found) {
        this.log(`Transaction type '${name}' not found, using first available`, 'warning');
        return transactionTypes[0];
      }
      return found;
    };

    const findPropertyCondition = (name: string) => {
      const found = propertyConditions.find(pc => pc.name === name);
      if (!found) {
        this.log(`Property condition '${name}' not found, using first available`, 'warning');
        return propertyConditions[0];
      }
      return found;
    };

    const findUser = (email: string) => {
      const found = users.find(u => u.email === email);
      if (!found) {
        this.log(`User '${email}' not found, using first available`, 'warning');
        return users[0];
      }
      return found;
    };

    const properties = [
      {
        title: 'Apartamento de Lujo en Zona Rosa',
        description: 'Hermoso apartamento de 3 habitaciones y 2 baños en el corazón de la Zona Rosa. Completamente amoblado con acabados de primera calidad.',
        userId: findUser('ana.martinez@inmobiliariapremium.com')?.id || users[0]?.id,
        propertyTypeId: findPropertyType('Apartamento').id,
        propertyStatusId: findPropertyStatus('Disponible').id,
        transactionTypeId: findTransactionType('Venta').id,
        propertyConditionId: findPropertyCondition('Excelente').id,
        address: 'Carrera 11 #85-32',
        city: 'Bogotá',
        state: 'Cundinamarca',
        zipCode: '110221',
        country: 'Colombia',
        latitude: 4.6753,
        longitude: -74.0478,
        price: 850000000,
        currency: 'COP',
        totalArea: 120,
        builtArea: 105,
        bedrooms: 3,
        bathrooms: 2,
        parkingSpaces: 1,
        floors: 1,
        yearBuilt: 2020,
        contactName: 'Ana Martínez',
        contactPhone: '+57 300 345-6789',
        contactEmail: 'ana.martinez@inmobiliariapremium.com',
        isActive: true,
        isFeatured: true,
        isPublished: true,
        publishedAt: new Date()
      },
      {
        title: 'Casa Familiar en Conjunto Cerrado',
        description: 'Amplia casa de 4 habitaciones en conjunto cerrado con piscina, gym y zonas verdes. Perfecta para familia.',
        userId: findUser('carlos.rodriguez@inmobiliariapremium.com')?.id || users[0]?.id,
        propertyTypeId: findPropertyType('Casa').id,
        propertyStatusId: findPropertyStatus('Disponible').id,
        transactionTypeId: findTransactionType('Venta').id,
        propertyConditionId: findPropertyCondition('Muy Buena').id, // ✅ Corregido: 'Muy Bueno' → 'Muy Buena'
        address: 'Calle 127 #15-45',
        city: 'Bogotá',
        state: 'Cundinamarca',
        zipCode: '110111',
        country: 'Colombia',
        latitude: 4.7110,
        longitude: -74.0721,
        price: 1200000000,
        currency: 'COP',
        totalArea: 200,
        builtArea: 180,
        bedrooms: 4,
        bathrooms: 3,
        parkingSpaces: 2,
        floors: 2,
        yearBuilt: 2018,
        contactName: 'Carlos Rodríguez',
        contactPhone: '+57 300 234-5678',
        contactEmail: 'carlos.rodriguez@inmobiliariapremium.com',
        isActive: true,
        isFeatured: false,
        isPublished: true,
        publishedAt: new Date()
      },
      {
        title: 'Apartamento Económico en Laureles',
        description: 'Cómodo apartamento de 2 habitaciones en el tradicional barrio Laureles. Excelente ubicación.',
        userId: findUser('diana.lopez@casasyapartamentos.com')?.id || users[0]?.id,
        propertyTypeId: findPropertyType('Apartamento').id,
        propertyStatusId: findPropertyStatus('Disponible').id,
        transactionTypeId: findTransactionType('Alquiler').id,
        propertyConditionId: findPropertyCondition('Buena').id, // ✅ Corregido: 'Bueno' → 'Buena'
        address: 'Carrera 70 #45-123',
        city: 'Medellín',
        state: 'Antioquia',
        zipCode: '050034',
        country: 'Colombia',
        latitude: 6.2518,
        longitude: -75.5636,
        price: 2500000,
        currency: 'COP',
        totalArea: 85,
        builtArea: 75,
        bedrooms: 2,
        bathrooms: 2,
        parkingSpaces: 1,
        floors: 1,
        yearBuilt: 2015,
        contactName: 'Diana López',
        contactPhone: '+57 300 567-8901',
        contactEmail: 'diana.lopez@casasyapartamentos.com',
        isActive: true,
        isFeatured: false,
        isPublished: true,
        publishedAt: new Date()
      },
      {
        title: 'Penthouse con Vista Panorámica',
        description: 'Exclusivo penthouse de 5 habitaciones con terraza y vista panorámica a la ciudad. Acabados de lujo.',
        userId: findUser('patricia.herrera@propiedadesdelvalle.com')?.id || users[0]?.id,
        propertyTypeId: findPropertyType('Penthouse').id,
        propertyStatusId: findPropertyStatus('Disponible').id,
        transactionTypeId: findTransactionType('Venta').id,
        propertyConditionId: findPropertyCondition('Nuevo').id, // ✅ Corregido para usar 'Nuevo' que existe en PropertyConditionsSeeder
        address: 'Avenida Colombia #2-45',
        city: 'Cali',
        state: 'Valle del Cauca',
        zipCode: '760043',
        country: 'Colombia',
        latitude: 3.4516,
        longitude: -76.5320,
        price: 2800000000,
        currency: 'COP',
        totalArea: 350,
        builtArea: 280,
        bedrooms: 5,
        bathrooms: 4,
        parkingSpaces: 3,
        floors: 2,
        yearBuilt: 2023,
        contactName: 'Patricia Herrera',
        contactPhone: '+57 300 789-0123',
        contactEmail: 'patricia.herrera@propiedadesdelvalle.com',
        isActive: true,
        isFeatured: true,
        isPublished: true,
        publishedAt: new Date()
      },
      {
        title: 'Local Comercial en Centro Histórico',
        description: 'Amplio local comercial en zona de alto tráfico peatonal. Ideal para restaurante o tienda.',
        userId: findUser('roberto.silva@propiedadesdelvalle.com')?.id || users[0]?.id,
        propertyTypeId: findPropertyType('Local Comercial').id,
        propertyStatusId: findPropertyStatus('Disponible').id,
        transactionTypeId: findTransactionType('Alquiler').id,
        propertyConditionId: findPropertyCondition('Regular').id,
        address: 'Calle 12 #5-67',
        city: 'Cali',
        state: 'Valle del Cauca',
        zipCode: '760001',
        country: 'Colombia',
        latitude: 3.4372,
        longitude: -76.5225,
        price: 8000000,
        currency: 'COP',
        totalArea: 150,
        builtArea: 130,
        bedrooms: 0,
        bathrooms: 2,
        parkingSpaces: 0,
        floors: 1,
        yearBuilt: 1980,
        contactName: 'Roberto Silva',
        contactPhone: '+57 300 678-9012',
        contactEmail: 'roberto.silva@propiedadesdelvalle.com',
        isActive: true,
        isFeatured: false,
        isPublished: true,
        publishedAt: new Date()
      }
    ];

    // Validar que todos los IDs están presentes antes de crear
    const invalidProperties = properties.filter(p => 
      !p.userId || !p.propertyTypeId || !p.propertyStatusId || 
      !p.transactionTypeId || !p.propertyConditionId
    );

    if (invalidProperties.length > 0) {
      this.log(`Found ${invalidProperties.length} properties with missing required IDs`, 'error');
      for (const prop of invalidProperties) {
        this.log(`Property "${prop.title}" has missing IDs:`, 'error');
        if (!prop.userId) this.log('  - userId is missing', 'error');
        if (!prop.propertyTypeId) this.log('  - propertyTypeId is missing', 'error');
        if (!prop.propertyStatusId) this.log('  - propertyStatusId is missing', 'error');
        if (!prop.transactionTypeId) this.log('  - transactionTypeId is missing', 'error');
        if (!prop.propertyConditionId) this.log('  - propertyConditionId is missing', 'error');
      }
      return;
    }

    this.log('Creating demo properties...', 'info');
    const createdProperties = await this.createIfNotExists(Property, properties, 'title');
    
    // Actualizar contadores de propiedades en organizaciones
    for (const org of organizations) {
      const propertyCount = createdProperties.filter(p => {
        const user = users.find(u => u.id === p.userId);
        return user?.organizationId === org.id;
      }).length;
      
      if (propertyCount > 0) {
        await organizationRepository.update(org.id, {
          propertiesCount: propertyCount
        });
      }
    }

    this.log(`Successfully created ${createdProperties.length} properties`, 'success');
  }
}