/**
 * @archivo clienteApi.ts
 * @proyecto Civil Trace
 * @descripcion Cliente HTTP genérico para hablar con la API de Civil Trace.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 16/11/2026
 * @version 1.0.0
 */

// 1. Importaciones
import { TIEMPO_ESPERA_API_MS, URL_API } from '@/conexion/configuracionApi';

// 2. Tipos e interfaces
interface OpcionesLlamada {
  metodo?: 'GET' | 'POST';
  cuerpo?: unknown;
  tokenAcceso?: string;
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

  constructor(mensaje: string, estado: number | null) {
    super(mensaje);
    this.name = 'ErrorApi';
    this.estado = estado;
  }
}

function leerJson(texto: string): unknown {
  try {
    return JSON.parse(texto);
  } catch {
    return null;
  }
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

  const { metodo = 'GET', cuerpo, tokenAcceso } = opciones;
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), TIEMPO_ESPERA_API_MS);

  try {
    const respuesta = await fetch(`${URL_API}${ruta}`, {
      method: metodo,
      headers: {
        Accept: 'application/json',
        ...(cuerpo === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(tokenAcceso ? { Authorization: `Bearer ${tokenAcceso}` } : {}),
      },
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
      signal: controlador.signal,
    });

    if (respuesta.status === CODIGO_SIN_CONTENIDO) {
      return undefined;
    }

    const datos = leerJson(await respuesta.text());
    if (!respuesta.ok) {
      throw new ErrorApi(leerMensaje(datos), respuesta.status);
    }
    return datos;
  } catch (error) {
    if (error instanceof ErrorApi) {
      throw error;
    }
    throw new ErrorApi(MENSAJE_SIN_CONEXION, null);
  } finally {
    clearTimeout(temporizador);
  }
}