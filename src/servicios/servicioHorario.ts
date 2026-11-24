/**
 * @archivo servicioHorario.ts
 * @proyecto Civil Trace
 * @descripcion Llamadas a la API del horario de la obra (consultar y guardar).
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos D-06, RF-60 Registrar retardo o salida anticipada
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001)
 */

// 1. Importaciones
import { llamarApi } from '@/conexion/clienteApi';
import type { DatosGuardarHorario, HorarioObra } from '@/tipos/asistencia';

// 4. Funciones
/** Horario general vigente y el que aplica hoy. */
export async function obtenerHorario(tokenAcceso: string, obraId: string): Promise<HorarioObra> {
  return (await llamarApi(`/obras/${obraId}/horario`, { tokenAcceso })) as HorarioObra;
}

/**
 * Guarda el horario para todos los días o solo para hoy.
 *
 * @throws ErrorApi 400 con el mensaje de validación; ErrorSinConexion sin red.
 */
export async function guardarHorario(
  tokenAcceso: string,
  obraId: string,
  datos: DatosGuardarHorario,
): Promise<HorarioObra> {
  return (await llamarApi(`/obras/${obraId}/horario`, {
    metodo: 'PUT',
    cuerpo: datos,
    tokenAcceso,
  })) as HorarioObra;
}
