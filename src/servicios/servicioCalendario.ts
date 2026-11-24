/**
 * @archivo servicioCalendario.ts
 * @proyecto Civil Trace
 * @descripcion Llamada a la API del calendario mensual de asistencia de un trabajador.
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos RF-56 Mostrar días con descuento, RF-58 Mostrar calendario de asistencia
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001)
 */

// 1. Importaciones
import { llamarApi } from '@/conexion/clienteApi';
import type { CalendarioMes } from '@/tipos/asistencia';

// 4. Funciones
/**
 * @param mes - YYYY-MM.
 * @param obraId - Opcional: solo esa obra.
 * @throws ErrorApi 403 si no puede ver ese calendario; ErrorSinConexion sin red.
 */
export async function obtenerCalendario(
  tokenAcceso: string,
  trabajadorId: string,
  mes: string,
  obraId?: string,
): Promise<CalendarioMes> {
  const obra = obraId ? `&obraId=${obraId}` : '';
  return (await llamarApi(`/asistencia/trabajadores/${trabajadorId}/calendario?mes=${mes}${obra}`, {
    tokenAcceso,
  })) as CalendarioMes;
}
