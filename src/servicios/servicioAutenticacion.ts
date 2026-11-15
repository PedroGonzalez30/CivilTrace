/**
 * @archivo servicioAutenticacion.ts
 * @proyecto Civil Trace
 * @descripcion Inicio de sesión y registro de usuarios (por ahora contra una cuenta simulada).
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 15/11/2026
 * @version 1.0.0
 */

import { CUENTA_SIMULADA } from '@/simulados/autenticacion';
import { type DatosRegistro, RolUsuario, type SesionAutenticacion } from '@/tipos/autenticacion';
const DURACION_SESION_MS = 1000 * 60 * 60 * 8;
const RETARDO_SIMULADO_MS = 1200;

const esperar = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// TODO(Equipo): reemplazar por la llamada real a la API.
/**
 * Inicia sesión con correo y contraseña.
 *
 * @param correo - Correo electrónico del usuario.
 * @param contrasena - Contraseña del usuario.
 * @returns Sesión creada para el usuario.
 * @throws Error si el correo o la contraseña son incorrectos.
 */
export async function iniciarSesion(
  correo: string,
  contrasena: string,
): Promise<SesionAutenticacion> {
  await esperar(RETARDO_SIMULADO_MS);

  if (
    correo.trim().toLowerCase() !== CUENTA_SIMULADA.correo ||
    contrasena !== CUENTA_SIMULADA.contrasena
  ) {
    throw new Error('Correo o contraseña incorrectos');
  }

  return {
    token: CUENTA_SIMULADA.token,
    venceEn: Date.now() + DURACION_SESION_MS,
    usuario: CUENTA_SIMULADA.usuario,
  };
}

// TODO(Equipo): reemplazar por la llamada real a la API (recibirá también datos.empresa).
/**
 * Registra a un usuario nuevo y abre su sesión.
 *
 * @param datos - Datos capturados en el formulario de registro.
 * @returns Sesión creada para el usuario nuevo.
 * @throws Error si el correo ya está registrado.
 */
export async function registrar(datos: DatosRegistro): Promise<SesionAutenticacion> {
  await esperar(RETARDO_SIMULADO_MS);

  if (datos.correo.toLowerCase() === CUENTA_SIMULADA.correo) {
    throw new Error('Este correo ya está registrado');
  }

  return {
    token: CUENTA_SIMULADA.token,
    venceEn: Date.now() + DURACION_SESION_MS,
    usuario: {
      id: '2',
      nombre: datos.nombre,
      correo: datos.correo,
      rol: datos.rol,
      empresa: datos.rol === RolUsuario.DUENO ? datos.empresa : undefined,
    },
  };
}
