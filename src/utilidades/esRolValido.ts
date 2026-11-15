/**
 * @archivo esRolValido.ts
 * @proyecto Civil Trace
 * @descripcion Comprueba que un texto corresponda a uno de los roles de la aplicación.
 * @autor POR_COMPLETAR
 * @fecha POR_COMPLETAR
 * @version 1.0.0
 */

import { ROLES_DISPONIBLES } from '@/constantes/roles';
import type { RolUsuario } from '@/tipos/autenticacion';

/**
 * Indica si un texto es un rol válido de la aplicación.
 *
 * @param valor - Texto a comprobar.
 * @returns Verdadero si el texto es un rol válido.
 */
export function esRolValido(valor: string): valor is RolUsuario {
  return ROLES_DISPONIBLES.some((rol) => rol === valor);
}
