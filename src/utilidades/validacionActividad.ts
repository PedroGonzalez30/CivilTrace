/**
 * @archivo validacionActividad.ts
 * @proyecto Civil Trace
 * @descripcion Valida el formulario "Agregar actividad" del supervisor antes de enviarlo (la API
 *   vuelve a validar todo).
 * @autor Emilio Manuel Esquivel
 * @fecha 24/11/2026
 * @version 1.0.0
 * @requerimientos CP10 Registrar y modificar actividad (spec 003, R8)
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Creación (feature 003)
 */

// 1. Importaciones
import type { DatosNuevaActividad } from '@/tipos/actividad';
import { convertirFechaLocalAIso } from '@/utilidades/formatearFecha';

// 2. Tipos e interfaces
export type ErroresActividad = Partial<Record<keyof DatosNuevaActividad, string>>;

// 3. Constantes del módulo
const LONGITUD_MINIMA_NOMBRE = 2;
const LONGITUD_MAXIMA_DESCRIPCION = 1000;
const MENSAJE_FECHA_INVALIDA = 'Usa el formato DD/MM/AAAA';

// 4. Función principal
/**
 * @param datos - Valores del formulario.
 * @returns Mensaje de error por campo; un campo sin error no aparece.
 */
export function validarActividad(datos: DatosNuevaActividad): ErroresActividad {
  const errores: ErroresActividad = {};

  if (datos.nombre.trim().length < LONGITUD_MINIMA_NOMBRE) {
    errores.nombre = `Mínimo ${LONGITUD_MINIMA_NOMBRE} caracteres`;
  }
  if (!datos.responsableId) {
    errores.responsableId = 'Selecciona al responsable';
  }
  if (datos.descripcion.trim().length > LONGITUD_MAXIMA_DESCRIPCION) {
    errores.descripcion = 'La descripción es demasiado larga';
  }

  const inicio = datos.fechaInicio.trim() ? convertirFechaLocalAIso(datos.fechaInicio) : null;
  const entrega = convertirFechaLocalAIso(datos.fechaEntrega);
  if (datos.fechaInicio.trim() && !inicio) {
    errores.fechaInicio = MENSAJE_FECHA_INVALIDA;
  }
  if (!entrega) {
    errores.fechaEntrega = MENSAJE_FECHA_INVALIDA;
  }
  if (inicio && entrega && inicio > entrega) {
    errores.fechaInicio = 'No puede ser posterior a la fecha de fin';
  }

  return errores;
}
