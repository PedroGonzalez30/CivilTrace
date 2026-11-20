/**
 * @archivo actividad.ts
 * @proyecto Civil Trace
 * @descripcion Tipos de actividades de obra y sus avances con evidencia fotográfica.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 20/11/2026
 * @version 1.0.0
 */

export type EstadoActividad = 'ACTIVA' | 'TERMINADA';

export type EstadoAvance = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';

export interface AvanceActividad {
  id: string;
  comentario: string;
  estado: EstadoAvance;
  fechaRegistro: string;
  registradoPor: string;
  tieneFoto: boolean;
}

export interface ActividadResumen {
  id: string;
  nombre: string;
  estado: EstadoActividad;
  fechaEntrega: string;
  fechaTerminada: string | null;
  responsable: string;
  supervisor: string;
}

export interface ActividadDetalle extends ActividadResumen {
  avances: AvanceActividad[];
}
