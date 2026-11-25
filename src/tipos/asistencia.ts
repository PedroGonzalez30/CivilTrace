/**
 * @archivo asistencia.ts
 * @proyecto Civil Trace
 * @descripcion Tipos de las respuestas de la API de asistencia y horario (contrato:
 *   CivilTrace-API/specs/001-asistencia-qr-horario/contracts/asistencia-api.md).
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos RF-19 Registrar asistencia propia, RF-27 Registrar asistencia por el
 *   supervisor, RF-56 Mostrar días con descuento, RF-58 Mostrar calendario de asistencia,
 *   RF-60 Registrar retardo o salida anticipada
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001)
 */

// 2. Tipos e interfaces
export type TipoJornada = 'COMPLETA' | 'RETARDO' | 'MEDIA_JORNADA' | 'SALIDA_TEMPRANA' | 'FALTA';
export type MotivoAsistencia =
  'CITA_MEDICA' | 'ENFERMEDAD' | 'PERMISO_PERSONAL' | 'ASUNTO_FAMILIAR' | 'OTRO';
export type EfectoPago = 'PAGO_COMPLETO' | 'MEDIO_DIA' | 'SIN_PAGO';
export type ColorDia = 'VERDE' | 'NARANJA' | 'ROJO';
export type TipoRegistro = 'ENTRADA' | 'SALIDA';
export type MotivoRechazo =
  | 'QR_INVALIDO'
  | 'NO_ASIGNADO'
  | 'NO_ES_SUPERVISOR'
  | 'ASISTENCIA_COMPLETA'
  | 'FECHA_FUERA_DE_RANGO';

export interface CredencialAsistencia {
  codigoQr: string;
  creadaEn: string;
}

export interface MarcaDia {
  estado: 'PENDIENTE' | 'REGISTRADA';
  hora: string | null;
}

export interface ObraDelDia {
  obraId: string;
  obraNombre: string;
  horaEntrada: string | null;
  horaSalida: string | null;
  esDiaLaborable: boolean;
  entrada: MarcaDia;
  salida: MarcaDia;
}

export interface MiDia {
  fecha: string;
  obras: ObraDelDia[];
}

export interface ObraSupervisada {
  id: string;
  nombre: string;
  descripcion: string;
  direccion: string;
  fechaInicio: string;
  fechaFinal: string;
}

export interface HorarioGeneral {
  horaEntrada: string;
  horaSalida: string;
  toleranciaMinutos: number;
  diasLaborales: number[];
  actualizadoEn: string;
  actualizadoPor?: string;
  fecha?: string;
}

export interface HorarioDelDia {
  fecha: string;
  horaEntrada: string;
  horaSalida: string;
  toleranciaMinutos: number;
  diasLaborales?: number[];
  esDiaLaborable: boolean;
  esExcepcion: boolean;
}

export interface HorarioObra {
  general: HorarioGeneral | null;
  hoy: HorarioDelDia | null;
  zonaHoraria: string;
}

export interface DatosGuardarHorario {
  horaEntrada: string;
  horaSalida: string;
  toleranciaMinutos: number;
  diasLaborales: number[];
  alcance: 'TODOS_LOS_DIAS' | 'SOLO_HOY';
}

export interface TrabajadorPaquete {
  id: string;
  nombre: string;
  oficio: string | null;
  fotoUrl: string | null;
  huellaCredencial: string | null;
  faltasMes: number;
}

export interface PaqueteSinConexion {
  generadoEn: string;
  zonaHoraria: string;
  horario: { general: HorarioGeneral | null; excepcionHoy: HorarioGeneral | null };
  trabajadores: TrabajadorPaquete[];
}

export interface TrabajadorVistaPrevia {
  id: string;
  nombre: string;
  oficio: string | null;
  fotoUrl: string | null;
  faltasMes: number;
}

export interface VistaPrevia {
  tipo: TipoRegistro;
  hora: string;
  trabajador: TrabajadorVistaPrevia;
}

export interface EscaneoParaEnviar {
  idLocal: string;
  obraId: string;
  codigoQr: string;
  capturadoEn: string;
  sinConexion: boolean;
  latitud: number | null;
  longitud: number | null;
}

export interface ResultadoEscaneo {
  idLocal: string;
  estado: 'GUARDADO' | 'DUPLICADO' | 'RECHAZADO';
  motivo: MotivoRechazo | null;
  mensaje: string | null;
  registro: {
    id: string;
    trabajadorId: string;
    fecha: string;
    tipo: TipoRegistro;
    hora: string;
    tipoJornada: TipoJornada;
  } | null;
}

export interface TrabajadorResumen {
  id: string;
  nombre: string;
  oficio: string | null;
  entrada: string | null;
  salida: string | null;
  tipoJornada: TipoJornada | null;
}

export interface ResumenDia {
  fecha: string;
  horario: HorarioDelDia | null;
  estadoEntrada: 'FINALIZADO' | 'PENDIENTE';
  estadoSalida: 'FINALIZADO' | 'PENDIENTE';
  trabajadores: TrabajadorResumen[];
}

export interface MarcaDetalle {
  hora: string;
  sinConexion: boolean;
  latitud: number | null;
  longitud: number | null;
  registradaPor: string | null;
}

export interface CambioAsistencia {
  campo: string;
  valorAnterior: string | null;
  valorNuevo: string | null;
  motivo: string | null;
  autor: string;
  fecha: string;
}

export interface DetalleDia {
  fecha: string;
  trabajador: { id: string; nombre: string; oficio: string | null };
  obra: { id: string; nombre: string };
  entrada: MarcaDetalle | null;
  salida: MarcaDetalle | null;
  tipoJornada: TipoJornada | null;
  esFaltaCalculada: boolean;
  motivo: MotivoAsistencia | null;
  efectoPago: EfectoPago;
  conDescuento: boolean;
  // Feature 006 (D-35): horas a descontar del pago; null si no hay.
  horasDescontadas: number | null;
  anotacion: string | null;
  registradoPor: string | null;
  registradoEn: string | null;
  cambios: CambioAsistencia[];
}

export interface CambiosDetalle {
  tipoJornada?: TipoJornada;
  motivo?: MotivoAsistencia | null;
  efectoPago?: EfectoPago;
  anotacion?: string | null;
  entradaEn?: string | null;
  salidaEn?: string | null;
  horasDescontadas?: number | null;
}

export interface DiaCalendario {
  fecha: string;
  obraId: string;
  color: ColorDia;
  tipoJornada: TipoJornada;
  esFaltaCalculada: boolean;
  conDescuento: boolean;
}

export interface CalendarioMes {
  mes: string;
  trabajador: { id: string; nombre: string; oficio: string | null };
  resumen: { faltas: number; mediasJornadas: number; retardos: number; salidasTempranas: number };
  dias: DiaCalendario[];
}
