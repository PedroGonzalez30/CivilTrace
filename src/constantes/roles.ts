/**
 * @archivo roles.ts
 * @proyecto Civil Trace
 * @descripcion Lista de roles que un usuario puede elegir al registrarse.
 * @autor POR_COMPLETAR
 * @fecha POR_COMPLETAR
 * @version 1.0.0
 */

import { RolUsuario } from '@/tipos/autenticacion';

export const ROLES_DISPONIBLES: readonly RolUsuario[] = [
  RolUsuario.DUENO,
  RolUsuario.SUPERVISOR,
  RolUsuario.TRABAJADOR,
];

export const ETIQUETA_ROL: Record<RolUsuario, string> = {
  [RolUsuario.DUENO]: 'Dueño',
  [RolUsuario.SUPERVISOR]: 'Supervisor',
  [RolUsuario.TRABAJADOR]: 'Trabajador',
};
