/**
 * @archivo autenticacion.ts
 * @proyecto Civil Trace
 * @descripcion Tipos de usuario, sesión y registro usados en el inicio de sesión.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 16/11/2026
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
  empresaId: string;
  empresa?: string;
}

export interface SesionAutenticacion {
  // Token de acceso (vida corta). Se manda en la cabecera Authorization de cada petición.
  token: string;
  // Token de refresco (vida larga). Solo sirve para pedir un token de acceso nuevo.
  tokenRefresco: string;
  // Momento (ms) en que vence el token de acceso.
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