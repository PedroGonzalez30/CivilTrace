/**
 * @archivo servicioDetallesAsistencia.ts
 * @proyecto Civil Trace
 * @descripcion Llamadas a la API de "Detalles de asistencia": consultar y editar el día de un
 *   trabajador en una obra.
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos RF-60 Registrar retardo o salida anticipada, D-07
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001)
 */

// 1. Importaciones
import { llamarApi } from '@/conexion/clienteApi';
import type { CambiosDetalle, DetalleDia } from '@/tipos/asistencia';

// 3. Constantes del módulo
const ruta = (obraId: string, trabajadorId: string, fecha: string) =>
  `/obras/${obraId}/asistencia/trabajadores/${trabajadorId}/dias/${fecha}`;

// 4. Funciones
/** Detalle del día con su historial de cambios. */
export async function obtenerDetalleDia(
  tokenAcceso: string,
  obraId: string,
  trabajadorId: string,
  fecha: string,
): Promise<DetalleDia> {
  return (await llamarApi(ruta(obraId, trabajadorId, fecha), { tokenAcceso })) as DetalleDia;
}

/**
 * Guarda los campos que cambiaron (solo el supervisor de la obra).
 *
 * @throws ErrorApi 400 si falta la observación u otra validación; ErrorSinConexion sin red.
 */
export async function editarDetalleDia(
  tokenAcceso: string,
  obraId: string,
  trabajadorId: string,
  fecha: string,
  cambios: CambiosDetalle,
): Promise<DetalleDia> {
  return (await llamarApi(ruta(obraId, trabajadorId, fecha), {
    metodo: 'PATCH',
    cuerpo: cambios,
    tokenAcceso,
  })) as DetalleDia;
}
