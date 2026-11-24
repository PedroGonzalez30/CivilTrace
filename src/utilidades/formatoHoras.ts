/**
 * @archivo formatoHoras.ts
 * @proyecto Civil Trace
 * @descripcion Formato de horas y fechas de asistencia: horas "HH:MM" a 12 horas como en el
 *   Figma ("8:00 am") e instantes de la API en la zona horaria de la empresa.
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos RF-58 Mostrar calendario de asistencia, D-06, D-15
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001, research R-12)
 */

// 1. Importaciones
import { NOMBRES_MES } from '@/constantes/textosAsistencia';

// 3. Constantes del módulo
const MINUTOS_POR_HORA = 60;
const HORAS_POR_MEDIO_DIA = 12;
const MINUTOS_POR_DIA = 24 * MINUTOS_POR_HORA;
const NOMBRES_DIA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const formateadores = new Map<string, Intl.DateTimeFormat>();

// 4. Funciones
// Se arma el texto a mano en lugar de usar el formato de 12 horas del idioma, porque cada motor
// (Node, Hermes) escribe "a. m." de forma distinta y el Figma usa "am".
function aTexto12(horas: number, minutos: number): string {
  const sufijo = horas < HORAS_POR_MEDIO_DIA ? 'am' : 'pm';
  const hora12 =
    horas % HORAS_POR_MEDIO_DIA === 0 ? HORAS_POR_MEDIO_DIA : horas % HORAS_POR_MEDIO_DIA;
  return `${hora12}:${String(minutos).padStart(2, '0')} ${sufijo}`;
}

function obtenerFormateador(zona: string): Intl.DateTimeFormat {
  let formateador = formateadores.get(zona);
  if (!formateador) {
    formateador = new Intl.DateTimeFormat('en-CA', {
      timeZone: zona,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    });
    formateadores.set(zona, formateador);
  }
  return formateador;
}

function obtenerPartes(instante: Date, zona: string): Record<string, string> {
  return Object.fromEntries(
    obtenerFormateador(zona)
      .formatToParts(instante)
      .map((parte) => [parte.type, parte.value]),
  );
}

/**
 * "08:00" → "8:00 am".
 *
 * @param hora - Hora en formato HH:MM (24 horas).
 * @returns La hora en formato de 12 horas.
 */
export function formatearHora12(hora: string): string {
  const [horas = 0, minutos = 0] = hora.split(':').map(Number);
  return aTexto12(horas, minutos);
}

/**
 * Suma minutos a una hora "HH:MM" (para mostrar el límite de retardo).
 *
 * @returns La nueva hora en formato HH:MM.
 */
export function sumarMinutosAHora(hora: string, minutosASumar: number): string {
  const [horas = 0, minutos = 0] = hora.split(':').map(Number);
  const total = (horas * MINUTOS_POR_HORA + minutos + minutosASumar) % MINUTOS_POR_DIA;
  const nuevasHoras = Math.floor(total / MINUTOS_POR_HORA);
  return `${String(nuevasHoras).padStart(2, '0')}:${String(total % MINUTOS_POR_HORA).padStart(2, '0')}`;
}

/**
 * Hora de un instante de la API en la zona de la empresa, en formato de 12 horas.
 *
 * @param instante - Fecha ISO 8601 o Date.
 * @param zona - Zona IANA de la empresa.
 * @returns Por ejemplo "8:02 am".
 */
export function formatearInstante(instante: string | Date, zona: string): string {
  const partes = obtenerPartes(new Date(instante), zona);
  return aTexto12(Number(partes['hour']), Number(partes['minute']));
}

/**
 * Fecha local YYYY-MM-DD de un instante en la zona indicada.
 */
export function obtenerFechaLocal(instante: Date, zona: string): string {
  const partes = obtenerPartes(instante, zona);
  return `${partes['year']}-${partes['month']}-${partes['day']}`;
}

/**
 * "2026-05-19" → "Martes 19 de mayo" (encabezado del detalle del día).
 */
export function formatearFechaLarga(fecha: string): string {
  const [anio = 0, mes = 1, dia = 1] = fecha.split('-').map(Number);
  const diaSemana = new Date(Date.UTC(anio, mes - 1, dia)).getUTCDay();
  return `${NOMBRES_DIA[diaSemana]} ${dia} de ${(NOMBRES_MES[mes - 1] ?? '').toLowerCase()}`;
}

/**
 * "2026-05" → "Mayo 2026" (encabezado del calendario).
 */
export function formatearMes(mes: string): string {
  const [anio = '', numero = '1'] = mes.split('-');
  return `${NOMBRES_MES[Number(numero) - 1] ?? ''} ${anio}`;
}

/**
 * Mes anterior o siguiente de "YYYY-MM".
 */
export function moverMes(mes: string, desplazamiento: number): string {
  const [anio = 0, numero = 1] = mes.split('-').map(Number);
  const fecha = new Date(Date.UTC(anio, numero - 1 + desplazamiento, 1));
  return `${fecha.getUTCFullYear()}-${String(fecha.getUTCMonth() + 1).padStart(2, '0')}`;
}

/**
 * "08:00" → "08:00 am", como se ve en los campos de hora del Figma (SUP_HorarioObra).
 */
export function formatearHoraCampo(hora: string): string {
  const texto = formatearHora12(hora);
  return texto.length === '8:00 am'.length ? `0${texto}` : texto;
}
