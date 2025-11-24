// src/scripts/identifyLocalFiles.ts
import * as fs from 'fs';
import * as path from 'path';
import { AppDataSource } from '../config/database';
import { ShareToken } from '../entities/ShareToken';

async function identifyLocalFiles() {
  await AppDataSource.initialize();

  const shareTokenRepo = AppDataSource.getRepository(ShareToken);
  const uploadDir = path.join(__dirname, '../../uploads/shared');

  // Verificar si existe el directorio
  if (!fs.existsSync(uploadDir)) {
    console.log(' No existe el directorio /uploads/shared');
    return;
  }

  // Listar todos los archivos en el directorio
  const localFiles = fs.readdirSync(uploadDir);
  console.log(` Encontrados ${localFiles.length} archivos locales`);

  let updated = 0;

  for (const fileName of localFiles) {
    // El formato es: {fileId}-{nombreOriginal}
    // Ejemplo: 1cJenmycmWMbAjpBqhQM68x5ndMbKrYmY-documento.pdf
    
    const fileId = fileName.split('-')[0];
    
    // Buscar el token con ese fileId
    const tokens = await shareTokenRepo.find({
      where: { fileId }
    });

    if (tokens.length > 0) {
      for (const token of tokens) {
        // Extraer nombre original del archivo
        const originalName = fileName.replace(`${fileId}-`, '');
        
        await shareTokenRepo.update(
          { id: token.id },
          {
            isLocalFile: true,
            localFilePath: fileName,
            fileName: originalName
          }
        );

        updated++;
        console.log(` ${updated} - Token ${token.token.substring(0, 8)}... -> ${originalName}`);
      }
    } else {
      console.log(`  Archivo huérfano encontrado: ${fileName}`);
    }
  }

  console.log(`\n Migración completa: ${updated} tokens actualizados`);
  await AppDataSource.destroy();
}

identifyLocalFiles()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });