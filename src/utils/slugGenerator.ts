// =====================================================
// src/utils/slugGenerator.ts
// =====================================================

/**
 * Genera un slug limpio a partir de un título
 * @param title - El título a convertir en slug
 * @returns string - El slug generado
 */
export function generateBaseSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD') // Normalizar caracteres Unicode
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos y diacríticos
    .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
    .replace(/\s+/g, '-') // Reemplazar espacios con guiones
    .replace(/-+/g, '-') // Reemplazar múltiples guiones con uno solo
    .replace(/^-+|-+$/g, '') // Remover guiones al inicio y final
    .trim();
}

/**
 * Genera un slug único verificando contra la base de datos
 * @param title - El título a convertir en slug
 * @param checkSlugExists - Función que verifica si el slug ya existe
 * @returns Promise<string> - El slug único generado
 */
export async function generateUniqueSlug(
  title: string, 
  checkSlugExists: (slug: string) => Promise<boolean>
): Promise<string> {
  const baseSlug = generateBaseSlug(title);
  
  if (!baseSlug) {
    // Si no se puede generar un slug válido, usar un fallback
    const timestamp = Date.now();
    return `property-${timestamp}`;
  }
  
  let slug = baseSlug;
  let counter = 1;
  
  // Verificar si el slug ya existe y generar uno único
  while (await checkSlugExists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}

/**
 * Actualiza el slug de una propiedad si el título ha cambiado
 * @param newTitle - El nuevo título
 * @param currentSlug - El slug actual
 * @param currentTitle - El título actual
 * @param checkSlugExists - Función que verifica si el slug ya existe
 * @returns Promise<string> - El slug actualizado o el actual si no cambió
 */
export async function updateSlugIfNeeded(
  newTitle: string,
  currentSlug: string,
  currentTitle: string,
  checkSlugExists: (slug: string) => Promise<boolean>
): Promise<string> {
  // Si el título no cambió, mantener el slug actual
  if (newTitle === currentTitle) {
    return currentSlug;
  }
  
  // Generar nuevo slug
  return await generateUniqueSlug(newTitle, checkSlugExists);
}

// =====================================================
// Función de utilidad para test manual
// =====================================================
export function testSlugGeneration() {
  const testCases = [
    'Casa Moderna en Zona Residencial',
    'Apartamento con Piscina y Jardín',
    'Finca La María - Estilo Colonial',
    'Local #123 - Zona Rosa (Premium)',
    'Casa    muy    espaciosa---moderna',
    'Apartamento Ejecutivo ñoño & más'
  ];

  console.log('🧪 Testing slug generation:');
  testCases.forEach(title => {
    const slug = generateBaseSlug(title);
    console.log(`"${title}" → "${slug}"`);
  });
}

// Para usar en desarrollo
if (require.main === module) {
  testSlugGeneration();
}