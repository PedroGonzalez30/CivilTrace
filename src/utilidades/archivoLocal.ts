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
 */

// 1. Importaciones
import { File } from 'expo-file-system';

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
