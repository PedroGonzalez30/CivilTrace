/**
 * @archivo servicioDesempeno.ts
 * @proyecto Civil Trace
 * @descripcion Pide a la API las métricas de desempeño de un trabajador por periodo.
 * @autor Emilio Manuel Esquivel
 * @fecha 25/11/2026
 * @version 1.0.0
 * @requerimientos RF-64 Mostrar métricas de desempeño (SRS V4.0; D-30)
 * @historial 25/11/2026 - Emilio Manuel Esquivel - Creación (feature 005)
 */

// 1. Importaciones
import { ErrorApi, llamarApi } from '@/conexion/clienteApi';
import type { Desempeno, PeriodoDesempeno } from '@/tipos/desempeno';

// 3. Constantes del módulo
const MENSAJE_RESPUESTA_INVALIDA = 'El servidor envió una respuesta inesperada';

// 4. Funciones
function esDesempeno(valor: unknown): valor is Desempeno {
  if (typeof valor !== 'object' || valor === null) {
    return false;
  }
  const datos = valor as Record<string, unknown>;
  return [
    'trabajador',
    'asistencia',
    'evidencias',
    'actividadesEntregadas',
    'actividadesAprobadas',
  ].every((clave) => typeof datos[clave] === 'object' && datos[clave] !== null);
}

/**
 * @param tokenAcceso - Token del dueño o del supervisor.
 * @param trabajadorId - Trabajador consultado.
 * @param periodo - SEMANA, MES o TODO.
 * @returns Las métricas de las cuatro tarjetas.
 * @throws ErrorApi sin conexión, sin permiso o con una respuesta inesperada.
 */
export async function obtenerDesempeno(
  tokenAcceso: string,
  trabajadorId: string,
  periodo: PeriodoDesempeno,
): Promise<Desempeno> {
  const respuesta = await llamarApi(
    `/asistencia/trabajadores/${encodeURIComponent(trabajadorId)}/desempeno?periodo=${periodo}`,
    { tokenAcceso },
  );
  if (!esDesempeno(respuesta)) {
    throw new ErrorApi(MENSAJE_RESPUESTA_INVALIDA, null);
  }
  return respuesta;
}
