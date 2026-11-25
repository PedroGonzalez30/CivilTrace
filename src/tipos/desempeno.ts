/**
 * @archivo desempeno.ts
 * @proyecto Civil Trace
 * @descripcion Tipos de las métricas de desempeño de un trabajador (contrato en
 *   CivilTrace-API/specs/005-metricas-desempeno/spec.md).
 * @autor Emilio Manuel Esquivel
 * @fecha 25/11/2026
 * @version 1.0.0
 * @requerimientos RF-64 Mostrar métricas de desempeño (SRS V4.0; D-30)
 * @historial 25/11/2026 - Emilio Manuel Esquivel - Creación (feature 005)
 */

// 2. Tipos e interfaces
export type PeriodoDesempeno = 'SEMANA' | 'MES' | 'TODO';

export interface Desempeno {
  trabajador: { id: string; nombre: string; oficio: string | null };
  periodo: { tipo: PeriodoDesempeno; desde: string; hasta: string };
  asistencia: {
    porcentaje: number | null;
    completos: number;
    total: number;
    retardos: number;
    mediasJornadas: number;
    salidasTempranas: number;
    faltas: number;
  };
  evidencias: {
    porcentaje: number | null;
    aprobadas: number;
    rechazadas: number;
    pendientes: number;
  };
  actividadesEntregadas: { total: number; antes: number; mismoDia: number; conRetraso: number };
  actividadesAprobadas: { porcentaje: number | null; aprobadas: number; rechazadas: number };
}
