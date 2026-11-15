/**
 * @archivo validacionAutenticacion.ts
 * @proyecto Civil Trace
 * @descripcion Reglas de validación de los formularios de inicio de sesión y registro.
 * @autor POR_COMPLETAR
 * @fecha POR_COMPLETAR
 * @version 1.0.0
 */

import { RolUsuario } from '@/tipos/autenticacion';

export type CampoInicioSesion = 'correo' | 'contrasena';
export type CampoRegistro = 'nombre' | 'correo' | 'contrasena' | 'rol' | 'empresa';

export const CAMPOS_INICIO_SESION: readonly CampoInicioSesion[] = ['correo', 'contrasena'];
export const CAMPOS_REGISTRO: readonly CampoRegistro[] = [
  'nombre',
  'correo',
  'contrasena',
  'rol',
  'empresa',
];

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LONGITUD_MINIMA_CONTRASENA = 6;
const LONGITUD_MINIMA_NOMBRE = 3;

function validarCorreo(valor: string): string | undefined {
  const correo = valor.trim();

  if (!correo) {
    return 'El correo es requerido';
  }
  if (!REGEX_CORREO.test(correo)) {
    return 'Correo inválido';
  }
  return undefined;
}

function validarContrasena(valor: string): string | undefined {
  if (!valor) {
    return 'La contraseña es requerida';
  }
  if (valor.length < LONGITUD_MINIMA_CONTRASENA) {
    return `Mínimo ${LONGITUD_MINIMA_CONTRASENA} caracteres`;
  }
  return undefined;
}

/**
 * Valida los campos del formulario de inicio de sesión.
 *
 * @param valores - Valores actuales de los campos.
 * @returns Mensaje de error por campo; un campo sin error queda en undefined.
 */
export function validarInicioSesion(
  valores: Record<CampoInicioSesion, string>,
): Partial<Record<CampoInicioSesion, string>> {
  const errores: Partial<Record<CampoInicioSesion, string>> = {};

  errores.correo = validarCorreo(valores.correo);
  errores.contrasena = validarContrasena(valores.contrasena);

  return errores;
}

/**
 * Valida los campos del formulario de registro.
 *
 * @param valores - Valores actuales de los campos.
 * @returns Mensaje de error por campo; un campo sin error queda en undefined.
 */
export function validarRegistro(
  valores: Record<CampoRegistro, string>,
): Partial<Record<CampoRegistro, string>> {
  const errores: Partial<Record<CampoRegistro, string>> = {};
  const nombre = valores.nombre.trim();

  if (!nombre) {
    errores.nombre = 'El nombre es requerido';
  } else if (nombre.length < LONGITUD_MINIMA_NOMBRE) {
    errores.nombre = `Mínimo ${LONGITUD_MINIMA_NOMBRE} caracteres`;
  }

  errores.correo = validarCorreo(valores.correo);
  errores.contrasena = validarContrasena(valores.contrasena);

  if (!valores.rol) {
    errores.rol = 'Selecciona tu rol';
  }

  if (!valores.empresa.trim()) {
    errores.empresa =
      valores.rol === RolUsuario.DUENO
        ? 'El nombre de la empresa es requerido'
        : 'El código de la empresa es requerido';
  }

  return errores;
}
