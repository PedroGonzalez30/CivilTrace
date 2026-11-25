/**
 * @archivo validacionAutenticacion.ts
 * @proyecto Civil Trace
 * @descripcion Reglas de validación de los formularios de inicio de sesión y registro.
 * @autor POR_COMPLETAR
 * @fecha POR_COMPLETAR
 * @version 1.1.0
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Oficio del perfil (D-18, feature 001)
 * @historial 25/11/2026 - Emilio Manuel Esquivel - Reglas de contraseña (D-12) y confirmación al
 *   registrarse (feature 006)
 */

import { RolUsuario } from '@/tipos/autenticacion';

export type CampoInicioSesion = 'correo' | 'contrasena';
export type CampoRegistro =
  'nombre' | 'correo' | 'contrasena' | 'confirmarContrasena' | 'rol' | 'empresa';

export const CAMPOS_INICIO_SESION: readonly CampoInicioSesion[] = ['correo', 'contrasena'];
export const CAMPOS_REGISTRO: readonly CampoRegistro[] = [
  'nombre',
  'correo',
  'contrasena',
  'confirmarContrasena',
  'rol',
  'empresa',
];
export type CampoUnirseEmpresa = 'correo' | 'contrasena' | 'codigo';

export const CAMPOS_UNIRSE_EMPRESA: readonly CampoUnirseEmpresa[] = [
  'correo',
  'contrasena',
  'codigo',
];

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LONGITUD_MINIMA_CONTRASENA = 8;
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

/** Reglas de una contraseña nueva (D-12), en el orden en que se muestran al registrarse. */
export const REGLAS_CONTRASENA: readonly { texto: string; cumple: (valor: string) => boolean }[] = [
  { texto: 'Mínimo 8 caracteres', cumple: (valor) => valor.length >= LONGITUD_MINIMA_CONTRASENA },
  { texto: 'Una letra mayúscula', cumple: (valor) => /[A-Z]/.test(valor) },
  { texto: 'Una letra minúscula', cumple: (valor) => /[a-z]/.test(valor) },
  { texto: 'Un número', cumple: (valor) => /[0-9]/.test(valor) },
];

function validarContrasenaRegistro(valor: string): string | undefined {
  if (!valor) {
    return 'La contraseña es requerida';
  }
  const incumplida = REGLAS_CONTRASENA.find((regla) => !regla.cumple(valor));
  return incumplida ? `La contraseña necesita: ${incumplida.texto.toLowerCase()}` : undefined;
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
  errores.contrasena = validarContrasenaRegistro(valores.contrasena);
  if (!valores.confirmarContrasena) {
    errores.confirmarContrasena = 'Confirma tu contraseña';
  } else if (valores.confirmarContrasena !== valores.contrasena) {
    errores.confirmarContrasena = 'Las contraseñas no coinciden';
  }

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

/**
 * Valida los campos del formulario para unirse a una empresa.
 *
 * @param valores - Valores actuales de los campos.
 * @returns Mensaje de error por campo; un campo sin error queda en undefined.
 */
export function validarUnirseEmpresa(
  valores: Record<CampoUnirseEmpresa, string>,
): Partial<Record<CampoUnirseEmpresa, string>> {
  const errores: Partial<Record<CampoUnirseEmpresa, string>> = {};

  errores.correo = validarCorreo(valores.correo);
  errores.contrasena = validarContrasena(valores.contrasena);

  if (!valores.codigo.trim()) {
    errores.codigo = 'El código de la empresa es requerido';
  }

  return errores;
}

export type CampoCambioContrasena = 'contrasenaActual' | 'contrasenaNueva' | 'confirmacion';

export const CAMPOS_CAMBIO_CONTRASENA: readonly CampoCambioContrasena[] = [
  'contrasenaActual',
  'contrasenaNueva',
  'confirmacion',
];

function validarContrasenaNueva(valor: string, actual: string): string | undefined {
  if (!valor) {
    return 'La nueva contraseña es requerida';
  }
  if (valor.length < LONGITUD_MINIMA_CONTRASENA) {
    return `Mínimo ${LONGITUD_MINIMA_CONTRASENA} caracteres`;
  }
  if (!/[a-z]/.test(valor) || !/[A-Z]/.test(valor) || !/[0-9]/.test(valor)) {
    return 'Debe tener una mayúscula, una minúscula y un número';
  }
  if (valor === actual) {
    return 'Debe ser distinta a la contraseña actual';
  }
  return undefined;
}

/**
 * Valida los campos del formulario de cambio de contraseña.
 *
 * @param valores - Valores actuales de los campos.
 * @returns Mensaje de error por campo; un campo sin error queda en undefined.
 */
export function validarCambioContrasena(
  valores: Record<CampoCambioContrasena, string>,
): Partial<Record<CampoCambioContrasena, string>> {
  const errores: Partial<Record<CampoCambioContrasena, string>> = {};

  if (!valores.contrasenaActual) {
    errores.contrasenaActual = 'La contraseña actual es requerida';
  }
  errores.contrasenaNueva = validarContrasenaNueva(
    valores.contrasenaNueva,
    valores.contrasenaActual,
  );
  if (!valores.confirmacion) {
    errores.confirmacion = 'Confirma tu nueva contraseña';
  } else if (valores.confirmacion !== valores.contrasenaNueva) {
    errores.confirmacion = 'Las contraseñas no coinciden';
  }

  return errores;
}

export type CampoPerfil = 'nombre' | 'correo' | 'telefono' | 'oficio';

export const CAMPOS_PERFIL: readonly CampoPerfil[] = ['nombre', 'correo', 'telefono', 'oficio'];

const REGEX_TELEFONO = /^[0-9+\-()\s]*$/;
const LONGITUD_MAXIMA_TELEFONO = 20;
const LONGITUD_MAXIMA_OFICIO = 60;

/**
 * Valida los campos del formulario del perfil. El teléfono es opcional.
 *
 * @param valores - Valores actuales de los campos.
 * @returns Mensaje de error por campo; un campo sin error queda en undefined.
 */
export function validarPerfil(
  valores: Record<CampoPerfil, string>,
): Partial<Record<CampoPerfil, string>> {
  const errores: Partial<Record<CampoPerfil, string>> = {};
  const nombre = valores.nombre.trim();
  const telefono = valores.telefono.trim();

  if (!nombre) {
    errores.nombre = 'El nombre es requerido';
  } else if (nombre.length < LONGITUD_MINIMA_NOMBRE) {
    errores.nombre = `Mínimo ${LONGITUD_MINIMA_NOMBRE} caracteres`;
  }

  errores.correo = validarCorreo(valores.correo);

  if (telefono.length > LONGITUD_MAXIMA_TELEFONO || !REGEX_TELEFONO.test(telefono)) {
    errores.telefono = 'Teléfono inválido';
  }

  if (valores.oficio.trim().length > LONGITUD_MAXIMA_OFICIO) {
    errores.oficio = 'El oficio es demasiado largo';
  }

  return errores;
}

export type CampoDatosEmpresa = 'nombre' | 'correo' | 'descripcion' | 'direccion';

export const CAMPOS_DATOS_EMPRESA: readonly CampoDatosEmpresa[] = [
  'nombre',
  'correo',
  'descripcion',
  'direccion',
];

const LONGITUD_MAXIMA_NOMBRE_EMPRESA = 100;
const LONGITUD_MAXIMA_DESCRIPCION_EMPRESA = 500;
const LONGITUD_MAXIMA_DIRECCION_EMPRESA = 200;

/**
 * Valida los campos de los datos de la empresa. Solo el nombre es obligatorio.
 *
 * @param valores - Valores actuales de los campos.
 * @returns Mensaje de error por campo; un campo sin error queda en undefined.
 */
export function validarDatosEmpresa(
  valores: Record<CampoDatosEmpresa, string>,
): Partial<Record<CampoDatosEmpresa, string>> {
  const errores: Partial<Record<CampoDatosEmpresa, string>> = {};
  const nombre = valores.nombre.trim();
  const correo = valores.correo.trim();

  if (!nombre) {
    errores.nombre = 'El nombre de la empresa es requerido';
  } else if (nombre.length > LONGITUD_MAXIMA_NOMBRE_EMPRESA) {
    errores.nombre = 'El nombre es demasiado largo';
  }
  if (correo && !REGEX_CORREO.test(correo)) {
    errores.correo = 'Correo inválido';
  }
  if (valores.descripcion.trim().length > LONGITUD_MAXIMA_DESCRIPCION_EMPRESA) {
    errores.descripcion = 'La descripción es demasiado larga';
  }
  if (valores.direccion.trim().length > LONGITUD_MAXIMA_DIRECCION_EMPRESA) {
    errores.direccion = 'La dirección es demasiado larga';
  }

  return errores;
}
