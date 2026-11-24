/**
 * @archivo textosAsistencia.ts
 * @proyecto Civil Trace
 * @descripcion Etiquetas, mensajes y colores de las pantallas de asistencia, tomados del Figma
 *   (pantallas SUP_* y TRA-* de asistencia y propuestas 2295:*).
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos RF-56 Mostrar días con descuento, RF-58 Mostrar calendario de asistencia,
 *   RF-60 Registrar retardo o salida anticipada, D-07, D-08, D-13, D-16
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001)
 */

// 1. Importaciones
import type { ColorDia, EfectoPago, MotivoAsistencia, TipoJornada } from '@/tipos/asistencia';

// 3. Constantes del módulo
export const ETIQUETAS_TIPO_JORNADA: Record<TipoJornada, string> = {
  COMPLETA: 'Completa',
  RETARDO: 'Retardo',
  MEDIA_JORNADA: 'Media jornada',
  SALIDA_TEMPRANA: 'Salida temprana',
  FALTA: 'Falta',
};

export const ETIQUETAS_MOTIVO: Record<MotivoAsistencia, string> = {
  CITA_MEDICA: 'Cita médica',
  ENFERMEDAD: 'Enfermedad',
  PERMISO_PERSONAL: 'Permiso personal',
  ASUNTO_FAMILIAR: 'Asunto familiar',
  OTRO: 'Otro',
};

export const ETIQUETAS_EFECTO_PAGO: Record<EfectoPago, string> = {
  PAGO_COMPLETO: 'Pago completo',
  MEDIO_DIA: 'Medio día',
  SIN_PAGO: 'Sin pago',
};

/** Texto largo del efecto en el detalle del día (SUP_CalendarioTrabajador_DetalleDia). */
export const ETIQUETAS_EFECTO_PAGO_DETALLE: Record<EfectoPago, string> = {
  PAGO_COMPLETO: 'Pago completo',
  MEDIO_DIA: 'Medio día de pago',
  SIN_PAGO: 'Sin pago',
};

export const TOLERANCIAS_MINUTOS = [10, 15, 20] as const;
export const TOLERANCIA_POR_DEFECTO = 15;
export const HORARIO_POR_DEFECTO = {
  horaEntrada: '08:00',
  horaSalida: '16:00',
  toleranciaMinutos: TOLERANCIA_POR_DEFECTO,
  diasLaborales: [1, 2, 3, 4, 5, 6],
};

/** Días en el orden del Figma (L M M J V S D) con su número de Date.getDay(). */
export const DIAS_SEMANA = [
  { numero: 1, letra: 'L' },
  { numero: 2, letra: 'M' },
  { numero: 3, letra: 'M' },
  { numero: 4, letra: 'J' },
  { numero: 5, letra: 'V' },
  { numero: 6, letra: 'S' },
  { numero: 0, letra: 'D' },
] as const;

export const NOMBRES_MES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
] as const;

export const MENSAJES_ASISTENCIA = {
  sinConexionGuardar: 'Necesitas conexión para guardar los cambios.',
  sinConexionHorario: 'Necesitas conexión para guardar el horario.',
  sinConexionCalendario: 'Necesitas conexión para ver el calendario.',
  estadosDesactualizados: 'Sin conexión: los estados pueden no estar actualizados.',
  sinObraAsignada: 'Todavía no tienes una obra asignada.',
  observacionObligatoria: 'La observación es obligatoria',
  salidaAntesEntrada: 'La hora de salida debe ser posterior a la de entrada',
  sinDiasLaborales: 'Elige al menos un día laboral',
  noEncontradoEnPaquete:
    'No se encontró al trabajador en los datos guardados; conéctate para actualizarlos.',
  asistenciaCompleta: 'La asistencia de hoy ya está completa',
  qrInvalido: 'El código no es de Civil Trace o ya no es válido',
  recordatorioFaltas: 'Recuerda que 3 faltas injustificadas pueden ser motivo de despido.',
  oficioLargo: 'El oficio es demasiado largo',
} as const;

/** Colores de las pantallas de asistencia leídos del Figma (no están en constantes/colores). */
export const COLORES_ASISTENCIA = {
  azul: '#1e7cf2',
  azulSuave: '#e8f1fe',
  azulChip: 'rgba(30,124,242,0.12)',
  azulBoton: '#eff6ff',
  verdeTexto: '#15803d',
  naranjaTexto: '#b45309',
  chipPendienteFondo: '#fef3c7',
  chipPendienteTexto: '#92400e',
  rojoTexto: '#b91c1c',
  alertaFondo: '#fee2e2',
  alertaBorde: '#fca5a5',
  alertaTitulo: '#991b1b',
  alertaTexto: '#7f1d1d',
  avisoFondo: '#fff4db',
  avisoBorde: '#fcd34d',
  avisoTexto: '#92400e',
  diaInactivo: '#f1f5f9',
  bordeChip: '#e2e8f0',
  insignia: '#111827',
  fondoOscuro: 'rgba(2,6,24,0.45)',
} as const;

export const COLORES_DIA: Record<ColorDia, string> = {
  VERDE: '#25ea1e',
  NARANJA: '#e2ab33',
  ROJO: '#dc2626',
};
