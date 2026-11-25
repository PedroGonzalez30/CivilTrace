/**
 * @archivo archivoLocal.ts
 * @proyecto Civil Trace
 * @descripcion Abre una foto local (cámara o galería) para subirla como cuerpo de la petición. Usa
 *   File de expo-file-system en lugar de fetch(uri): en Android, fetch de un file:// respondía el
 *   texto "File not found" y la app subía ese texto como si fuera la foto (D-33).
 * @autor Emilio Manuel Esquivel
 * @fecha 25/11/2026
 * @version 1.0.0
 * @requerimientos RF-08 Capturar evidencia fotográfica, RF-57 Editar perfil de usuario
 * @historial 25/11/2026 - Emilio Manuel Esquivel - Creación (D-33)
 *   25/11/2026 - Emilio Manuel Esquivel - Guardar en la caché antes de compartir (P-18)
 */

// 1. Importaciones
import { File, Paths } from 'expo-file-system';

import { ErrorApi } from '@/conexion/clienteApi';

// 3. Constantes del módulo
const MENSAJE_FOTO_ILEGIBLE = 'No se pudo leer la foto seleccionada';

// 4. Funciones
/**
 * @param uri - Dirección local de la foto (file:// o content://).
 * @returns El archivo, que se puede mandar directo como cuerpo (File implementa Blob).
 * @throws ErrorApi si el archivo no existe o está vacío.
 */
export function abrirFotoLocal(uri: string): File {
  try {
    const archivo = new File(uri);
    if (!archivo.exists || archivo.size === 0) {
      throw new Error('Archivo vacío o inexistente');
    }
    return archivo;
  } catch {
    throw new ErrorApi(MENSAJE_FOTO_ILEGIBLE, null);
  }
}

/**
 * Escribe un archivo en la caché de la app a partir de su contenido en base64, para compartirlo.
 * En Android (Expo Go) no se puede leer ni copiar el PDF donde lo deja expo-print ("Not allowed to
 * read file" / "Missing 'READ' permission", P-18); por eso se pide su contenido y se escribe aquí.
 *
 * @param base64 - Contenido del archivo en base64, sin prefijo data:.
 * @param nombre - Nombre del archivo, con extensión.
 * @returns La dirección del archivo en la caché.
 */
export async function guardarEnCacheParaCompartir(base64: string, nombre: string): Promise<string> {
  const nombreSeguro = nombre.replace(/[^\p{L}\p{N}._ -]/gu, '_');
  const destino = new File(Paths.cache, nombreSeguro);
  if (!destino.exists) {
    destino.create();
  }
  await destino.write(base64, { encoding: 'base64' });
  return destino.uri;
}
