/**
 * @archivo validacionObra.ts
 * @proyecto Civil Trace
 * @descripcion Reglas de validación del formulario para agregar una obra.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 16/11/2026
 * @version 1.0.0
 */

// 1. Importaciones
import type { DatosNuevaObra } from '@/tipos/obra';
import { convertirFechaLocalAIso } from '@/utilidades/formatearFecha';

// 2. Tipos e interfaces
export type ErroresObra = Partial<Record<keyof DatosNuevaObra, string>>;

// 3. Constantes del módulo
const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LONGITUD_MINIMA_NOMBRE_OBRA = 3;
const LONGITUD_MINIMA_DIRECCION = 5;
const MENSAJE_FECHA_INVALIDA = 'Usa el formato DD/MM/AAAA';
const LONGITUD_MINIMA_DESCRIPCION = 10;

// 4. Función principal
/**
 * Valida los campos del formulario de nueva obra (la API vuelve a validar todo).
 *
 * @param datos - Valores actuales del formulario.
 * @returns Mensaje de error por campo; un campo sin error no aparece.
 */
export function validarObra(datos: DatosNuevaObra): ErroresObra {
  const errores: ErroresObra = {};

  if (datos.nombre.trim().length < LONGITUD_MINIMA_NOMBRE_OBRA) {
    errores.nombre = `Mínimo ${LONGITUD_MINIMA_NOMBRE_OBRA} caracteres`;
  }
  if (!datos.cliente.trim()) {
    errores.cliente = 'El nombre del cliente es requerido';
  }
  if (datos.descripcion.trim().length < LONGITUD_MINIMA_DESCRIPCION) {
    errores.descripcion = `Mínimo ${LONGITUD_MINIMA_DESCRIPCION} caracteres`;
  }
  if (!REGEX_CORREO.test(datos.correoCliente.trim())) {
    errores.correoCliente = 'Correo inválido';
  }
  if (datos.direccion.trim().length < LONGITUD_MINIMA_DIRECCION) {
    errores.direccion = 'La dirección es demasiado corta';
  }

  const fechaInicio = convertirFechaLocalAIso(datos.fechaInicio);
  const fechaFin = convertirFechaLocalAIso(datos.fechaFin);
  if (!fechaInicio) {
    errores.fechaInicio = MENSAJE_FECHA_INVALIDA;
  }
  if (!fechaFin) {
    errores.fechaFin = MENSAJE_FECHA_INVALIDA;
  }
  if (fechaInicio && fechaFin && fechaFin < fechaInicio) {
    errores.fechaFin = 'No puede ser anterior a la fecha de inicio';
  }

  return errores;
}