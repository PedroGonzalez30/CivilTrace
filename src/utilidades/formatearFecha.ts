/**
 * @archivo formatearFecha.ts
 * @proyecto Civil Trace
 * @descripcion Convierte fechas entre el formato ISO de la API (AAAA-MM-DD) y el de la app.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 16/11/2026
 * @version 1.0.0
 */

// 3. Constantes del módulo
const REGEX_FECHA_ISO = /^(\d{4})-(\d{2})-(\d{2})$/;
const REGEX_FECHA_LOCAL = /^(\d{2})\/(\d{2})\/(\d{4})$/;

// 4. Funciones
/**
 * Convierte "2024-04-02" en "02/04/2024".
 *
 * @param fechaIso - Fecha en formato ISO recibida de la API.
 * @returns La fecha como DD/MM/AAAA, o null si no tiene formato ISO.
 */
export function convertirIsoAFechaLocal(fechaIso: string): string | null {
  const coincidencia = REGEX_FECHA_ISO.exec(fechaIso);
  if (!coincidencia) {
    return null;
  }
  const [, anio, mes, dia] = coincidencia;
  return `${dia}/${mes}/${anio}`;
}

/**
 * Convierte "02/04/2024" en "2024-04-02", comprobando que la fecha exista en el calendario.
 *
 * @param fechaLocal - Fecha escrita por el usuario como DD/MM/AAAA.
 * @returns La fecha en formato ISO, o null si no es una fecha válida.
 */
export function convertirFechaLocalAIso(fechaLocal: string): string | null {
  const coincidencia = REGEX_FECHA_LOCAL.exec(fechaLocal.trim());
  if (!coincidencia) {
    return null;
  }
  const [, textoDia, textoMes, textoAnio] = coincidencia;
  const dia = Number(textoDia);
  const mes = Number(textoMes);
  const anio = Number(textoAnio);

  // Date corrige fechas imposibles (31/02 pasa a marzo); si cambió, la fecha no existe.
  const fecha = new Date(Date.UTC(anio, mes - 1, dia));
  const esFechaReal =
    fecha.getUTCFullYear() === anio && fecha.getUTCMonth() === mes - 1 && fecha.getUTCDate() === dia;

  return esFechaReal ? `${textoAnio}-${textoMes}-${textoDia}` : null;
}