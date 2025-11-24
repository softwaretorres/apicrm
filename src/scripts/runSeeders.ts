// src/scripts/runSeeders.ts

import { AppDataSource } from '../config/database';
import { MainSeeder } from '../seeders/MainSeeder';
import { RolesPermissionsSeeder } from '../seeders/RolesPermissionsSeeder';
import { PropertyCatalogsSeeder } from '../seeders/PropertyCatalogsSeeder';
import { PropertyTypesSeeder } from '../seeders/PropertyTypesSeeder';
import { PropertyStatusSeeder } from '../seeders/PropertyStatusSeeder';
import { TransactionTypesSeeder } from '../seeders/TransactionTypesSeeder';
import { PropertyConditionsSeeder } from '../seeders/PropertyConditionsSeeder';
import { PropertyFeaturesSeeder } from '../seeders/PropertyFeaturesSeeder';
import { OAuthClientsSeeder } from '../seeders/OAuthClientsSeeder';
import { DemoDataSeeder } from '../seeders/DemoDataSeeder';

// Función para mostrar ayuda
function showHelp() {
  console.log(`
🌱 Seeder CLI - Real Estate System

Usage:
  npm run seed [command] [options]

Commands:
  all                 Run all seeders (essential + demo data)
  essential          Run only essential seeders (roles, catalogs, oauth)
  admin              Create initial super admin
  roles              Run only roles and permissions seeder
  catalogs           Run all property catalogs seeders
  property-types     Run only property types seeder
  property-status    Run only property status seeder
  transaction-types  Run only transaction types seeder
  property-conditions Run only property conditions seeder
  property-features  Run only property features seeder
  oauth              Run only OAuth clients seeder
  demo               Run only demo data seeder
  help               Show this help message

Examples:
  npm run seed all
  npm run seed essential
  npm run seed admin --email=admin@example.com --name="Super Admin" --password=secret123
  npm run seed roles
  npm run seed catalogs
  npm run seed property-types
  npm run seed demo

Options for 'admin' command:
  --email      Admin email address (required)
  --name       Admin full name (required)
  --password   Admin password (required)
  --firstName  Admin first name (optional)
  --lastName   Admin last name (optional)
`);
}

// Función para parsear argumentos
function parseArgs() {
  const args = process.argv.slice(2);
  const command = args[0];
  const options: Record<string, string> = {};
  
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      options[key] = value || '';
    }
  }
  
  return { command, options };
}

// Función principal
async function main() {
  const { command, options } = parseArgs();
  
  if (!command || command === 'help') {
    showHelp();
    return;
  }

  try {
    // Inicializar conexión a la base de datos
    if (!AppDataSource.isInitialized) {
      console.log('🔗 Connecting to database...');
      await AppDataSource.initialize();
      console.log(' Database connected successfully!');
    }

    console.log(`🌱 Running seeder command: ${command}\n`);

    switch (command) {
      case 'all':
        await MainSeeder.runAll();
        break;

      case 'essential':
        await MainSeeder.runEssential();
        break;

      case 'admin':
        await createSuperAdmin(options);
        break;

      case 'roles':
        const rolesSeeder = new RolesPermissionsSeeder();
        await rolesSeeder.execute();
        break;

      case 'catalogs':
        await runAllCatalogs();
        break;

      case 'property-types':
        const propertyTypesSeeder = new PropertyTypesSeeder();
        await propertyTypesSeeder.execute();
        break;

      case 'property-status':
        const propertyStatusSeeder = new PropertyStatusSeeder();
        await propertyStatusSeeder.execute();
        break;

      case 'transaction-types':
        const transactionTypesSeeder = new TransactionTypesSeeder();
        await transactionTypesSeeder.execute();
        break;

      case 'property-conditions':
        const propertyConditionsSeeder = new PropertyConditionsSeeder();
        await propertyConditionsSeeder.execute();
        break;

      case 'property-features':
        const propertyFeaturesSeeder = new PropertyFeaturesSeeder();
        await propertyFeaturesSeeder.execute();
        break;

      case 'oauth':
        const oauthSeeder = new OAuthClientsSeeder();
        await oauthSeeder.execute();
        break;

      case 'demo':
        const demoSeeder = new DemoDataSeeder();
        await demoSeeder.execute();
        break;

      // Comandos adicionales útiles
      case 'reset-catalogs':
        await resetCatalogs();
        break;

      case 'reset-demo':
        await resetDemoData();
        break;

      default:
        console.log(`❌ Unknown command: ${command}`);
        showHelp();
        process.exit(1);
    }

    console.log('\n🎉 Seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Seeding failed:');
    console.error(error);
    process.exit(1);
  }
}

// Función para ejecutar todos los catálogos
async function runAllCatalogs() {
  console.log('📚 Running all property catalogs seeders...\n');
  
  const catalogSeeders = [
    new PropertyTypesSeeder(),
    new PropertyStatusSeeder(),
    new TransactionTypesSeeder(),
    new PropertyConditionsSeeder(),
    new PropertyFeaturesSeeder()
  ];

  for (const seeder of catalogSeeders) {
    await seeder.execute();
  }
  
  // Si existe PropertyCatalogsSeeder, también ejecutarlo
  try {
    const legacyCatalogSeeder = new PropertyCatalogsSeeder();
    await legacyCatalogSeeder.execute();
  } catch (error) {
    // PropertyCatalogsSeeder podría no existir, ignorar error
    console.log('ℹ️  PropertyCatalogsSeeder not found, skipping...');
  }
}

// Función para resetear catálogos (útil para desarrollo)
async function resetCatalogs() {
  console.log('🔄 Resetting property catalogs...\n');
  
  // Aquí podrías agregar lógica para limpiar/resetear los catálogos
  // Por ejemplo, eliminar registros existentes y volver a crearlos
  
  console.log('⚠️  Reset catalogs functionality not implemented yet');
  console.log('💡 You can manually delete catalog data and run: npm run seed catalogs');
}

// Función para resetear datos demo
async function resetDemoData() {
  console.log('🔄 Resetting demo data...\n');
  
  // Aquí podrías agregar lógica para limpiar datos demo
  console.log('⚠️  Reset demo data functionality not implemented yet');
  console.log('💡 You can manually delete demo data and run: npm run seed demo');
}

// Función para crear super admin
async function createSuperAdmin(options: Record<string, string>) {
  const { email, name, password, firstName, lastName } = options;

  if (!email || !name || !password) {
    console.log('❌ Missing required options for admin creation');
    console.log('Required: --email, --name, --password');
    console.log('Example: npm run seed admin --email=admin@example.com --name="Super Admin" --password=secret123');
    process.exit(1);
  }

  await MainSeeder.createSuperAdmin({
    email,
    name,
    password,
    firstName,
    lastName
  });
}

// Función de utilidad para ejecutar seeders específicos
export async function runSpecificSeeders(seederNames: string[]) {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const seederMap: Record<string, any> = {
      'roles': RolesPermissionsSeeder,
      'property-types': PropertyTypesSeeder,
      'property-status': PropertyStatusSeeder,
      'transaction-types': TransactionTypesSeeder,
      'property-conditions': PropertyConditionsSeeder,
      'property-features': PropertyFeaturesSeeder,
      'oauth': OAuthClientsSeeder,
      'demo': DemoDataSeeder
    };

    for (const seederName of seederNames) {
      const SeederClass = seederMap[seederName];
      if (SeederClass) {
        const seeder = new SeederClass();
        await seeder.execute();
      } else {
        console.log(`⚠️  Unknown seeder: ${seederName}`);
      }
    }

  } catch (error) {
    console.error('❌ Error running specific seeders:', error);
    throw error;
  }
}

// Función para verificar estado de seeders
export async function checkSeedersStatus() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    console.log('📊 Checking seeders status...\n');

    const seeders = [
      { name: 'Roles & Permissions', class: RolesPermissionsSeeder },
      { name: 'Property Types', class: PropertyTypesSeeder },
      { name: 'Property Status', class: PropertyStatusSeeder },
      { name: 'Transaction Types', class: TransactionTypesSeeder },
      { name: 'Property Conditions', class: PropertyConditionsSeeder },
      { name: 'Property Features', class: PropertyFeaturesSeeder },
      { name: 'Demo Data', class: DemoDataSeeder }
    ];

    for (const { name, class: SeederClass } of seeders) {
      try {
        const seeder = new SeederClass();
        // Aquí podrías agregar lógica para verificar si el seeder ya se ejecutó
        console.log(`✅ ${name}: Available`);
      } catch (error) {
        console.log(`❌ ${name}: Error - ${error}`);
      }
    }

  } catch (error) {
    console.error('❌ Error checking seeders status:', error);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { main as runSeeders };