/**
 * @archivo clienteApi.ts
 * @proyecto Civil Trace
 * @descripcion Cliente HTTP genérico para hablar con la API de Civil Trace.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 16/11/2026
 * @version 1.2.0
 * @historial 23/11/2026 - Emilio Manuel Esquivel - ErrorSinConexion, motivo y PATCH (feature 001)
 *   25/11/2026 - Emilio Manuel Esquivel - Subidas binarias con expo/fetch (D-33)
 *   24/11/2026 - Emilio Manuel Esquivel - Encabezados extra (tipo y comentario de evidencia, feature 003)
 */

// 1. Importaciones
import { fetch as fetchExpo } from 'expo/fetch';

import { TIEMPO_ESPERA_API_MS, URL_API } from '@/conexion/configuracionApi';

// 2. Tipos e interfaces
interface OpcionesLlamada {
  metodo?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  cuerpo?: unknown;
  // Para subir un archivo tal cual (por ejemplo una foto); no se combina con "cuerpo".
  cuerpoBinario?: { datos: Blob; tipo: string };
  tokenAcceso?: string;
  tiempoEsperaMs?: number;
  // Encabezados propios de una ruta, por ejemplo el tipo de evidencia (feature 003).
  encabezados?: Record<string, string>;
}

// 3. Constantes del módulo
const CODIGO_SIN_CONTENIDO = 204;
const MENSAJE_SIN_CONEXION = 'No se pudo conectar con el servidor. Revisa tu conexión.';
const MENSAJE_SIN_CONFIGURAR = 'La aplicación no tiene configurada la dirección del servidor.';
const MENSAJE_INESPERADO = 'Ocurrió un error inesperado';

/**
 * Error de una llamada a la API. "estado" es el código HTTP, o null si ni siquiera hubo
 * respuesta (sin internet, servidor apagado, tiempo agotado).
 */
export class ErrorApi extends Error {
  readonly estado: number | null;
  // Clave estable que manda la API en algunos errores (por ejemplo "NO_ASIGNADO").
  readonly motivo: string | null;

  constructor(mensaje: string, estado: number | null, motivo: string | null = null) {
    super(mensaje);
    this.name = 'ErrorApi';
    this.estado = estado;
    this.motivo = motivo;
  }
}

/**
 * No hubo respuesta del servidor (sin internet, servidor apagado o tiempo agotado). Se distingue
 * para que asistencia pueda trabajar sin conexión (RNF-07).
 */
export class ErrorSinConexion extends ErrorApi {
  constructor() {
    super(MENSAJE_SIN_CONEXION, null);
    this.name = 'ErrorSinConexion';
  }
}

function leerJson(texto: string): unknown {
  try {
    return JSON.parse(texto);
  } catch {
    return null;
  }
}

function leerMotivo(datos: unknown): string | null {
  if (typeof datos === 'object' && datos !== null && 'motivo' in datos) {
    return typeof datos.motivo === 'string' ? datos.motivo : null;
  }
  return null;
}

function leerMensaje(datos: unknown): string {
  if (typeof datos === 'object' && datos !== null && 'mensaje' in datos) {
    return typeof datos.mensaje === 'string' ? datos.mensaje : MENSAJE_INESPERADO;
  }
  return MENSAJE_INESPERADO;
}

// 4. Función principal
/**
 * Llama a la API y devuelve el JSON de la respuesta tal cual (sin validar: quien llama debe
 * comprobar su forma antes de usarlo).
 *
 * @param ruta - Ruta de la API, por ejemplo "/auth/login".
 * @param opciones - Método, cuerpo y token de acceso opcionales.
 * @returns El JSON recibido, o undefined si la API respondió sin contenido.
 * @throws ErrorApi con un mensaje en español listo para mostrarse al usuario.
 */
export async function llamarApi(ruta: string, opciones: OpcionesLlamada = {}): Promise<unknown> {
  if (!URL_API) {
    throw new ErrorApi(MENSAJE_SIN_CONFIGURAR, null);
  }

  const {
    metodo = 'GET',
    cuerpo,
    cuerpoBinario,
    tokenAcceso,
    tiempoEsperaMs,
    encabezados,
  } = opciones;
  const controlador = new AbortController();
  const temporizador = setTimeout(
    () => controlador.abort(),
    tiempoEsperaMs ?? TIEMPO_ESPERA_API_MS,
  );

  // D-33: un File de expo-file-system como cuerpo solo lo envía bien el fetch de expo/fetch (así lo
  // documenta Expo SDK 58); con el fetch global llegaba algo que no era la foto.
  const enviar = cuerpoBinario ? fetchExpo : fetch;

  try {
    const respuesta = await enviar(`${URL_API}${ruta}`, {
      method: metodo,
      headers: {
        Accept: 'application/json',
        ...(cuerpo === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(cuerpoBinario ? { 'Content-Type': cuerpoBinario.tipo } : {}),
        ...(tokenAcceso ? { Authorization: `Bearer ${tokenAcceso}` } : {}),
        ...encabezados,
      },
      body: cuerpoBinario
        ? cuerpoBinario.datos
        : cuerpo === undefined
          ? undefined
          : JSON.stringify(cuerpo),
      signal: controlador.signal,
    });

    if (respuesta.status === CODIGO_SIN_CONTENIDO) {
      return undefined;
    }

    const datos = leerJson(await respuesta.text());
    if (!respuesta.ok) {
      throw new ErrorApi(leerMensaje(datos), respuesta.status, leerMotivo(datos));
    }
    return datos;
  } catch (error) {
    if (error instanceof ErrorApi) {
      throw error;
    }
    throw new ErrorSinConexion();
  } finally {
    clearTimeout(temporizador);
  }
}
