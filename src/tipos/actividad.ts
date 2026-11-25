/**
 * @archivo actividad.ts
 * @proyecto Civil Trace
 * @descripcion Tipos de actividades de obra y sus avances con evidencia fotográfica.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 20/11/2026
 * @version 1.1.0
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Tipo de avance, revisión, descripción, mis
 *   actividades y datos para crear actividades y subir evidencias (feature 003)
 */

export type EstadoActividad = 'ACTIVA' | 'TERMINADA';

export type EstadoAvance = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';

// Feature 003: avance del día o entrega final de la actividad.
export type TipoAvance = 'DIARIO' | 'TERMINADO';

export type DecisionRevision = 'APROBAR' | 'RECHAZAR';

export interface AvanceActividad {
  id: string;
  comentario: string;
  estado: EstadoAvance;
  fechaRegistro: string;
  registradoPor: string;
  tieneFoto: boolean;
  tipo: TipoAvance;
  // Motivo del rechazo u observación del supervisor (D-10).
  observacion: string | null;
  revisadoPor: string | null;
}

export interface ActividadResumen {
  id: string;
  nombre: string;
  estado: EstadoActividad;
  fechaEntrega: string;
  fechaTerminada: string | null;
  responsable: string;
  supervisor: string;
  // Feature 003: instrucción, inicio y si hay una entrega esperando la revisión.
  descripcion: string;
  fechaInicio: string | null;
  responsableId: string | null;
  enRevision: boolean;
}

export interface ActividadDetalle extends ActividadResumen {
  avances: AvanceActividad[];
  // Feature 004 (RF-17, D-31): terminada y aceptada por el cliente; ya no se modifica.
  bloqueada: boolean;
}

// Actividad del trabajador en cualquiera de sus obras (GET /actividades/mias).
export interface MiActividad extends ActividadResumen {
  obraId: string;
  obraNombre: string;
}

export interface DatosNuevaActividad {
  nombre: string;
  responsableId: string;
  descripcion: string;
  // Fechas en DD/MM/AAAA, como se capturan.
  fechaInicio: string;
  fechaEntrega: string;
}

export interface EvidenciaNueva {
  uri: string;
  tipoImagen: string;
  tipo: TipoAvance;
  comentario: string;
}

export interface ResultadoRevision {
  avance: AvanceActividad;
  actividad: ActividadDetalle;
}
