// src/seeders/MainSeeder.ts

import { BaseSeeder } from './BaseSeeder';
import { RolesPermissionsSeeder } from './RolesPermissionsSeeder';
import { PropertyTypesSeeder } from './PropertyTypesSeeder';
import { PropertyStatusSeeder } from './PropertyStatusSeeder';
import { TransactionTypesSeeder } from './TransactionTypesSeeder';
import { PropertyConditionsSeeder } from './PropertyConditionsSeeder';
import { PropertyFeaturesSeeder } from './PropertyFeaturesSeeder';
import { OAuthClientsSeeder } from './OAuthClientsSeeder';
import { DemoDataSeeder } from './DemoDataSeeder';
import { UserService } from '../services/UserService';
import { RoleService } from '../services/RoleService';

export class MainSeeder extends BaseSeeder {
  
  async run(): Promise<void> {
    // Este método no se usa directamente, usar los métodos estáticos
    this.log('Use MainSeeder.runAll() or MainSeeder.runEssential() instead', 'warning');
  }

  /**
   * Ejecutar todos los seeders (esenciales + demo)
   */
  static async runAll(): Promise<void> {
    console.log('🌱 Running ALL seeders...\n');
    
    await this.runEssential();
    
    // Datos demo
    console.log('\n📦 Seeding demo data...');
    const demoSeeder = new DemoDataSeeder();
    await demoSeeder.execute();
    
    console.log('\n✅ All seeders completed!');
  }

  /**
   * Ejecutar solo seeders esenciales (sin datos demo)
   */
  static async runEssential(): Promise<void> {
    console.log('🔧 Running ESSENTIAL seeders...\n');
    
    const essentialSeeders = [
      { name: 'Roles & Permissions', seeder: new RolesPermissionsSeeder() },
      { name: 'Property Types', seeder: new PropertyTypesSeeder() },
      { name: 'Property Status', seeder: new PropertyStatusSeeder() },
      { name: 'Transaction Types', seeder: new TransactionTypesSeeder() },
      { name: 'Property Conditions', seeder: new PropertyConditionsSeeder() },
      { name: 'Property Features', seeder: new PropertyFeaturesSeeder() }
    ];

    // Ejecutar seeders esenciales
    for (const { name, seeder } of essentialSeeders) {
      console.log(`\n📚 Seeding ${name}...`);
      await seeder.execute();
    }

    // OAuth clients si existe
    try {
      console.log('\n🔐 Seeding OAuth clients...');
      const oauthSeeder = new OAuthClientsSeeder();
      await oauthSeeder.execute();
    } catch (error) {
      console.log('ℹ️  OAuth seeder not available, skipping...');
    }

    console.log('\n✅ Essential seeders completed!');
  }

  /**
   * Crear super administrador inicial
   */
/**
 * Crear super administrador inicial
 */
static async createSuperAdmin(adminData: {
  email: string;
  name: string;
  password: string;
  firstName?: string;
  lastName?: string;
}): Promise<void> {
  console.log('👑 Creating super admin...\n');

  try {
    const userService = new UserService();
    const roleService = new RoleService();

    // Verificar si ya existe el usuario
    const existingUser = await userService.findByEmail(adminData.email);
    if (existingUser) {
      console.log(`⚠️  User with email ${adminData.email} already exists`);
      return;
    }

    // Buscar rol de super admin
    const superAdminRole = await roleService.findByName('super_admin');
    if (!superAdminRole) {
      console.log('❌ Super admin role not found. Please run roles seeder first.');
      console.log('Run: npm run seed roles');
      return;
    }

    // Crear usuario
    const userData = {
      ...adminData,
      active: true,
      emailVerifiedAt: new Date()
    };

    const user = await userService.createUser(userData);

    // Asignar rol de super admin con el formato correcto
    await roleService.assignRoleToUser({
      userId: user.id,
      roleId: superAdminRole.id,
      organizationId: user.organizationId
    });

    console.log(`✅ Super admin created successfully!`);
    console.log(`📧 Email: ${adminData.email}`);
    console.log(`👤 Name: ${adminData.name}`);
    console.log(`🔑 Password: ${adminData.password}`);
    console.log(`\n⚠️  Please change the password after first login!`);

  } catch (error) {
    console.error('❌ Failed to create super admin:', error);
    throw error;
  }
}
  /**
   * Ejecutar seeders de catálogos solamente
   */
  static async runCatalogs(): Promise<void> {
    console.log('📚 Running catalog seeders...\n');
    
    const catalogSeeders = [
      { name: 'Property Types', seeder: new PropertyTypesSeeder() },
      { name: 'Property Status', seeder: new PropertyStatusSeeder() },
      { name: 'Transaction Types', seeder: new TransactionTypesSeeder() },
      { name: 'Property Conditions', seeder: new PropertyConditionsSeeder() },
      { name: 'Property Features', seeder: new PropertyFeaturesSeeder() }
    ];

    for (const { name, seeder } of catalogSeeders) {
      console.log(`\n📖 Seeding ${name}...`);
      await seeder.execute();
    }

    console.log('\n✅ Catalog seeders completed!');
  }

  /**
   * Verificar qué seeders necesitan ejecutarse
   */
  static async checkStatus(): Promise<void> {
    console.log('📊 Checking seeders status...\n');
    
    // Aquí puedes agregar lógica para verificar qué datos ya existen
    // y qué seeders necesitan ejecutarse
    
    console.log('ℹ️  Status check not implemented yet');
  }
}