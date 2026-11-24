/**
 * @archivo servicioPerfil.ts
 * @proyecto Civil Trace
 * @descripcion Consulta y actualiza el perfil del usuario y sube su foto a la API.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 20/11/2026
 * @version 1.0.0
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Oficio del perfil (D-18, feature 001)
 */

// 1. Importaciones
import { ErrorApi, llamarApi } from '@/conexion/clienteApi';
import { URL_API } from '@/conexion/configuracionApi';

// 2. Tipos e interfaces
export interface DatosPerfil {
  nombre: string;
  correo: string;
  telefono: string;
  // Opcional al guardar: si no se envía, la API conserva el actual (D-18).
  oficio?: string;
}

export interface PerfilUsuario extends DatosPerfil {
  oficio: string;
  tieneFoto: boolean;
}

export interface OrigenFoto {
  uri: string;
  headers?: Record<string, string>;
}

// 3. Constantes del módulo
const RUTA_PERFIL = '/perfil';
const RUTA_FOTO = '/perfil/foto';
const TIEMPO_ESPERA_SUBIDA_MS = 60000;
const MENSAJE_RESPUESTA_INVALIDA = 'El servidor envió una respuesta inesperada';
const MENSAJE_FOTO_ILEGIBLE = 'No se pudo leer la foto seleccionada';
const MENSAJE_FOTO_NO_DISPONIBLE = 'No se pudo cargar tu foto de perfil';
const MENSAJE_SIN_CONEXION = 'No se pudo conectar con el servidor. Revisa tu conexión.';

// 4. Funciones privadas
function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null;
}

function aPerfil(respuesta: unknown): PerfilUsuario {
  const perfil = esObjeto(respuesta) ? respuesta.perfil : null;
  if (
    !esObjeto(perfil) ||
    typeof perfil.nombre !== 'string' ||
    typeof perfil.correo !== 'string' ||
    typeof perfil.tieneFoto !== 'boolean' ||
    (perfil.telefono !== null && typeof perfil.telefono !== 'string') ||
    (perfil.oficio !== undefined && perfil.oficio !== null && typeof perfil.oficio !== 'string')
  ) {
    throw new ErrorApi(MENSAJE_RESPUESTA_INVALIDA, null);
  }
  return {
    nombre: perfil.nombre,
    correo: perfil.correo,
    telefono: typeof perfil.telefono === 'string' ? perfil.telefono : '',
    oficio: typeof perfil.oficio === 'string' ? perfil.oficio : '',
    tieneFoto: perfil.tieneFoto,
  };
}

function leerComoUrlDatos(datos: Blob): Promise<string> {
  return new Promise((resolver, rechazar) => {
    const lector = new FileReader();
    lector.onloadend = () => {
      if (typeof lector.result === 'string') {
        resolver(lector.result);
      } else {
        rechazar(new ErrorApi(MENSAJE_FOTO_NO_DISPONIBLE, null));
      }
    };
    lector.onerror = () => rechazar(new ErrorApi(MENSAJE_FOTO_NO_DISPONIBLE, null));
    lector.readAsDataURL(datos);
  });
}

// 5. Funciones públicas
/**
 * @param tokenAcceso - Token de acceso de la sesión.
 * @returns El perfil del usuario que inició sesión.
 * @throws ErrorApi si falla la red o la respuesta no es válida.
 */
export async function obtenerPerfil(tokenAcceso: string): Promise<PerfilUsuario> {
  return aPerfil(await llamarApi(RUTA_PERFIL, { tokenAcceso }));
}

/**
 * @param tokenAcceso - Token de acceso de la sesión.
 * @param datos - Nombre, correo y teléfono nuevos.
 * @returns El perfil ya actualizado.
 * @throws ErrorApi si el correo ya existe, los datos no son válidos o no hay conexión.
 */
export async function actualizarPerfil(
  tokenAcceso: string,
  datos: DatosPerfil,
): Promise<PerfilUsuario> {
  return aPerfil(await llamarApi(RUTA_PERFIL, { metodo: 'PUT', tokenAcceso, cuerpo: datos }));
}

/**
 * Sube la foto de perfil (cualquier formato de imagen).
 *
 * @param tokenAcceso - Token de acceso de la sesión.
 * @param uriFoto - Ubicación local de la foto elegida.
 * @param tipo - Tipo de la imagen, por ejemplo "image/jpeg".
 * @throws ErrorApi si no se puede leer la foto, falla la red o es demasiado grande.
 */
export async function subirFotoPerfil(
  tokenAcceso: string,
  uriFoto: string,
  tipo: string,
  ruta: string = RUTA_FOTO,
): Promise<void> {
  let datos: Blob;
  try {
    datos = await (await fetch(uriFoto)).blob();
  } catch {
    throw new ErrorApi(MENSAJE_FOTO_ILEGIBLE, null);
  }
  await llamarApi(ruta, {
    metodo: 'POST',
    tokenAcceso,
    cuerpoBinario: { datos, tipo },
    tiempoEsperaMs: TIEMPO_ESPERA_SUBIDA_MS,
  });
}

/**
 * Arma el origen para mostrar la foto guardada (el contenedor es privado, va con la sesión).
 *
 * @param tokenAcceso - Token de acceso de la sesión.
 * @param version - Cambia cuando se sube una foto nueva, para no ver la anterior en caché.
 */
export function crearOrigenFotoPerfil(tokenAcceso: string, version: number): OrigenFoto {
  return {
    uri: `${URL_API}${RUTA_FOTO}?v=${version}`,
    headers: { Authorization: `Bearer ${tokenAcceso}` },
  };
}

/**
 * Descarga la foto guardada con la sesión y la devuelve lista para mostrarse (url de datos).
 * Se descarga desde JavaScript, y no con el encabezado de la imagen, para poder ver el motivo
 * exacto cuando falla (sesión vencida, sin foto, almacenamiento caído).
 *
 * @param tokenAcceso - Token de acceso de la sesión.
 * @returns La imagen como url de datos.
 * @throws ErrorApi con el código HTTP en el mensaje si la API no la entrega.
 */
export async function descargarFotoPerfil(
  tokenAcceso: string,
  ruta: string = RUTA_FOTO,
): Promise<string> {
  let respuesta: Response;
  try {
    respuesta = await fetch(`${URL_API}${ruta}`, {
      headers: { Authorization: `Bearer ${tokenAcceso}` },
    });
  } catch {
    throw new ErrorApi(MENSAJE_SIN_CONEXION, null);
  }
  if (!respuesta.ok) {
    throw new ErrorApi(
      `${MENSAJE_FOTO_NO_DISPONIBLE} (error ${respuesta.status})`,
      respuesta.status,
    );
  }
  return leerComoUrlDatos(await respuesta.blob());
}
