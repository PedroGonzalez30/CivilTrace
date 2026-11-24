/**
 * @archivo traduccionRol.ts
 * @proyecto Civil Trace
 * @descripcion Traduce los roles entre la app ('Dueño de empresa') y la API (DUENO).
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 16/11/2026
 * @version 1.0.0
 */

// 1. Importaciones
import { RolUsuario } from '@/tipos/autenticacion';

// 2. Tipos e interfaces
export type RolApi = 'DUENO' | 'SUPERVISOR' | 'TRABAJADOR';

// 4. Funciones
/**
 * Convierte el rol que manda la API al rol de la app.
 *
 * @param valor - Rol recibido de la API.
 * @returns El rol de la app, o null si no es uno conocido.
 */
export function rolDeApi(valor: string): RolUsuario | null {
  switch (valor) {
    case 'DUENO':
      return RolUsuario.DUENO;
    case 'SUPERVISOR':
      return RolUsuario.SUPERVISOR;
    case 'TRABAJADOR':
      return RolUsuario.TRABAJADOR;
    default:
      return null;
  }
}

/**
 * Convierte el rol de la app al rol que espera la API.
 *
 * @param rol - Rol de la app.
 * @returns El rol en el formato de la API.
 */
export function rolParaApi(rol: RolUsuario): RolApi {
  switch (rol) {
    case RolUsuario.DUENO:
      return 'DUENO';
    case RolUsuario.SUPERVISOR:
      return 'SUPERVISOR';
    case RolUsuario.TRABAJADOR:
      return 'TRABAJADOR';
  }
}
