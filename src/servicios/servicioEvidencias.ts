/**
 * @archivo servicioEvidencias.ts
 * @proyecto Civil Trace
 * @descripcion Sube fotos a la API. Por ahora solo la ruta temporal de prueba del almacenamiento.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 18/11/2026
 * @version 1.0.0
 */

// 1. Importaciones
import { ErrorApi, llamarApi } from '@/conexion/clienteApi';

// 3. Constantes del módulo
const RUTA_FOTO_PRUEBA = '/almacenamiento-prueba/foto';
const TIEMPO_ESPERA_SUBIDA_MS = 60000;
const MENSAJE_FOTO_ILEGIBLE = 'No se pudo leer la foto seleccionada';
const MENSAJE_RESPUESTA_INVALIDA = 'El servidor envió una respuesta inesperada';

// 4. Funciones privadas
function leerNombreBlob(respuesta: unknown): string {
  if (typeof respuesta === 'object' && respuesta !== null && 'archivo' in respuesta) {
    const { archivo } = respuesta;
    if (typeof archivo === 'object' && archivo !== null && 'nombreBlob' in archivo) {
      if (typeof archivo.nombreBlob === 'string') {
        return archivo.nombreBlob;
      }
    }
  }
  throw new ErrorApi(MENSAJE_RESPUESTA_INVALIDA, null);
}

// 5. Funciones públicas
/**
 * Sube una foto a la ruta de prueba del almacenamiento. Solo el supervisor tiene permiso.
 *
 * @param tokenAcceso - Token de acceso de la sesión.
 * @param uriFoto - Ubicación local de la foto elegida.
 * @param tipo - Tipo de la imagen: "image/jpeg" o "image/png".
 * @returns El nombre con el que quedó guardada en Blob Storage.
 * @throws ErrorApi con un mensaje en español si falla la lectura, la red o la validación.
 */
export async function subirFotoPrueba(
  tokenAcceso: string,
  uriFoto: string,
  tipo: string,
): Promise<string> {
  let datos: Blob;
  try {
    datos = await (await fetch(uriFoto)).blob();
  } catch {
    throw new ErrorApi(MENSAJE_FOTO_ILEGIBLE, null);
  }

  const respuesta = await llamarApi(RUTA_FOTO_PRUEBA, {
    metodo: 'POST',
    tokenAcceso,
    cuerpoBinario: { datos, tipo },
    tiempoEsperaMs: TIEMPO_ESPERA_SUBIDA_MS,
  });
  return leerNombreBlob(respuesta);
}
