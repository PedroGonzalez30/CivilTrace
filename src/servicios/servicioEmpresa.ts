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
export async function obtenerCodigosEmpresa(tokenAcceso: string): Promise<CodigosEmpresa> {
  const respuesta = await llamarApi('/empresa/codigos', { tokenAcceso });

  if (!esObjeto(respuesta) || !esObjeto(respuesta.codigos)) {
    throw new ErrorApi(MENSAJE_RESPUESTA_INVALIDA, null);
  }

  const { trabajadores, supervisores } = respuesta.codigos;
  if (typeof trabajadores !== 'string' || typeof supervisores !== 'string') {
    throw new ErrorApi(MENSAJE_RESPUESTA_INVALIDA, null);
  }

  return { trabajadores, supervisores };
}

function aPersonas(valor: unknown): PersonaEmpresa[] {
  if (!Array.isArray(valor)) {
    throw new ErrorApi(MENSAJE_RESPUESTA_INVALIDA, null);
  }
  return valor.map((elemento: unknown) => {
    if (!esObjeto(elemento) || typeof elemento.id !== 'string' || typeof elemento.nombre !== 'string') {
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
