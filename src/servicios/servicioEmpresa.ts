/**
 * @archivo servicioEmpresa.ts
 * @proyecto Civil Trace
 * @descripcion Consulta a la API los datos de la empresa del usuario.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 16/11/2026
 * @version 1.0.0
 */

// 1. Importaciones
import { ErrorApi, llamarApi } from '@/conexion/clienteApi';
import type { PersonalEmpresa, PersonaEmpresa } from '@/tipos/personal';
import { descargarFotoPerfil, subirFotoPerfil } from '@/servicios/servicioPerfil';
// 2. Tipos e interfaces
export interface CodigosEmpresa {
  trabajadores: string;
  supervisores: string;
}

// 3. Constantes del módulo
const MENSAJE_RESPUESTA_INVALIDA = 'El servidor envió una respuesta inesperada';

// 4. Funciones privadas
function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null;
}

// 5. Funciones públicas
/**
 * Pide los códigos de acceso de la empresa. Solo el dueño tiene permiso.
 *
 * @param tokenAcceso - Token de acceso de la sesión.
 * @returns Los códigos para unir trabajadores y supervisores.
 * @throws ErrorApi si no hay conexión, la sesión expiró o el rol no tiene permiso.
 */
export type TipoCodigoEmpresa = 'trabajadores' | 'supervisores';

function aCodigosEmpresa(respuesta: unknown): CodigosEmpresa {
  if (!esObjeto(respuesta) || !esObjeto(respuesta.codigos)) {
    throw new ErrorApi(MENSAJE_RESPUESTA_INVALIDA, null);
  }

  const { trabajadores, supervisores } = respuesta.codigos;
  if (typeof trabajadores !== 'string' || typeof supervisores !== 'string') {
    throw new ErrorApi(MENSAJE_RESPUESTA_INVALIDA, null);
  }

  return { trabajadores, supervisores };
}

export async function obtenerCodigosEmpresa(tokenAcceso: string): Promise<CodigosEmpresa> {
  return aCodigosEmpresa(await llamarApi('/empresa/codigos', { tokenAcceso }));
}

/**
 * Pide a la API un código nuevo. Solo el dueño tiene permiso; el otro código no cambia.
 *
 * @param tokenAcceso - Token de acceso de la sesión.
 * @param tipo - Código a regenerar.
 * @returns Los dos códigos ya actualizados.
 * @throws ErrorApi si no hay conexión, la sesión expiró o el rol no tiene permiso.
 */
export async function regenerarCodigoEmpresa(
  tokenAcceso: string,
  tipo: TipoCodigoEmpresa,
): Promise<CodigosEmpresa> {
  const respuesta = await llamarApi(`/empresa/codigos/${tipo}/regenerar`, {
    metodo: 'POST',
    tokenAcceso,
  });
  return aCodigosEmpresa(respuesta);
}

function aPersonas(valor: unknown): PersonaEmpresa[] {
  if (!Array.isArray(valor)) {
    throw new ErrorApi(MENSAJE_RESPUESTA_INVALIDA, null);
  }
  return valor.map((elemento: unknown) => {
    if (
      !esObjeto(elemento) ||
      typeof elemento.id !== 'string' ||
      typeof elemento.nombre !== 'string'
    ) {
      throw new ErrorApi(MENSAJE_RESPUESTA_INVALIDA, null);
    }
    return { id: elemento.id, nombre: elemento.nombre };
  });
}

/**
 * Pide los supervisores y trabajadores de la empresa. Solo el dueño tiene permiso.
 *
 * @param tokenAcceso - Token de acceso de la sesión.
 * @returns Las personas que se pueden asignar a una obra.
 * @throws ErrorApi si no hay conexión, la sesión expiró o el rol no tiene permiso.
 */
export async function obtenerPersonalEmpresa(tokenAcceso: string): Promise<PersonalEmpresa> {
  const respuesta = await llamarApi('/empresa/personal', { tokenAcceso });

  if (!esObjeto(respuesta) || !esObjeto(respuesta.personal)) {
    throw new ErrorApi(MENSAJE_RESPUESTA_INVALIDA, null);
  }
  return {
    supervisores: aPersonas(respuesta.personal.supervisores),
    trabajadores: aPersonas(respuesta.personal.trabajadores),
  };
}

/**
 * Elimina a un supervisor o trabajador de la empresa. Solo el dueño tiene permiso.
 *
 * @param tokenAcceso - Token de acceso de la sesión.
 * @param idPersona - Id de la persona a eliminar.
 * @throws ErrorApi si no hay conexión, la sesión expiró o la persona ya no existe.
 */
export async function eliminarPersonal(tokenAcceso: string, idPersona: string): Promise<void> {
  await llamarApi(`/empresa/personal/${encodeURIComponent(idPersona)}`, {
    metodo: 'DELETE',
    tokenAcceso,
  });
}
export interface DatosEmpresa {
  nombre: string;
  correo: string;
  descripcion: string;
  direccion: string;
  tieneLogo: boolean;
}

export type CambiosDatosEmpresa = Omit<DatosEmpresa, 'tieneLogo'>;

const RUTA_DATOS = '/empresa/datos';
const RUTA_LOGO = '/empresa/logo';

function aTexto(valor: unknown): string {
  return typeof valor === 'string' ? valor : '';
}

function aDatosEmpresa(respuesta: unknown): DatosEmpresa {
  const datos = esObjeto(respuesta) ? respuesta.datos : null;
  if (
    !esObjeto(datos) ||
    typeof datos.nombre !== 'string' ||
    typeof datos.tieneLogo !== 'boolean'
  ) {
    throw new ErrorApi(MENSAJE_RESPUESTA_INVALIDA, null);
  }
  return {
    nombre: datos.nombre,
    correo: aTexto(datos.correo),
    descripcion: aTexto(datos.descripcion),
    direccion: aTexto(datos.direccion),
    tieneLogo: datos.tieneLogo,
  };
}

/**
 * @param tokenAcceso - Token de acceso de la sesión.
 * @returns Los datos de la empresa. Solo el dueño tiene permiso.
 * @throws ErrorApi si falla la red o la respuesta no es válida.
 */
export async function obtenerDatosEmpresa(tokenAcceso: string): Promise<DatosEmpresa> {
  return aDatosEmpresa(await llamarApi(RUTA_DATOS, { tokenAcceso }));
}

/**
 * @param tokenAcceso - Token de acceso de la sesión.
 * @param cambios - Nombre, correo, descripción y dirección nuevos.
 * @returns Los datos ya actualizados.
 * @throws ErrorApi si los datos no son válidos o no hay conexión.
 */
export async function actualizarDatosEmpresa(
  tokenAcceso: string,
  cambios: CambiosDatosEmpresa,
): Promise<DatosEmpresa> {
  return aDatosEmpresa(
    await llamarApi(RUTA_DATOS, { metodo: 'PUT', tokenAcceso, cuerpo: cambios }),
  );
}

export function subirLogoEmpresa(tokenAcceso: string, uriLogo: string, tipo: string) {
  return subirFotoPerfil(tokenAcceso, uriLogo, tipo, RUTA_LOGO);
}

export function descargarLogoEmpresa(tokenAcceso: string) {
  return descargarFotoPerfil(tokenAcceso, RUTA_LOGO);
}
