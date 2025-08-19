// setup-oauth-client.ts
import 'reflect-metadata';
import { AppDataSource } from './src/config/database';
import { OAuthClient } from './src/entities/OAuthClient';

async function createDefaultOAuthClient(): Promise<void> {
  try {
    // Inicializar conexión a la base de datos
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    const clientRepository = AppDataSource.getRepository(OAuthClient);
    
    // Verificar si ya existe un cliente por defecto
    const existingClient = await clientRepository.findOne({
      where: { personalAccessClient: true }
    });
    
    if (existingClient) {
      console.log('✅ Default OAuth client already exists with ID:', existingClient.id);
      return;
    }
    
    // Crear cliente por defecto
    const defaultClient = clientRepository.create({
      name: 'Personal Access Client',
      secret: undefined, // Personal access clients no necesitan secret
      redirect: 'http://localhost',
      personalAccessClient: true,
      passwordClient: false,
      revoked: false
    });
    
    const savedClient = await clientRepository.save(defaultClient);
    console.log('✅ Default OAuth client created successfully!');
    console.log('📝 Client ID:', savedClient.id);
    console.log('📝 Client Name:', savedClient.name);
    
  } catch (error) {
    console.error('❌ Error creating OAuth client:', error);
    throw error;
  } finally {
    // Cerrar conexión
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Ejecutar script
createDefaultOAuthClient()
  .then(() => {
    console.log('🎉 Setup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  });