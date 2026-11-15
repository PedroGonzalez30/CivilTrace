/**
 * @archivo autenticacion.ts
 * @proyecto Civil Trace
 * @descripcion Tipos de usuario, sesión y registro usados en el inicio de sesión.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 15/11/2026
 * @version 1.0.0
 */

export enum RolUsuario {
  DUENO = 'Dueño de empresa',
  SUPERVISOR = 'Supervisor',
  TRABAJADOR = 'Trabajador',
}

export interface UsuarioAutenticado {
  id: string;
  nombre: string;
  correo: string;
  rol: RolUsuario;
  empresa?: string;
}

export interface SesionAutenticacion {
  token: string;
  venceEn: number;
  usuario: UsuarioAutenticado;
}

export interface DatosRegistro {
  nombre: string;
  correo: string;
  contrasena: string;
  rol: RolUsuario;
  empresa: string;
}
