/**
 * @archivo diasRestantes.ts
 * @proyecto Civil Trace
 * @descripcion Texto de días restantes para entregar una actividad ("6 días restantes", "Vence
 *   hoy", "Vencida hace 2 días"), como en las tarjetas del Figma.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 20/11/2026
 * @version 1.1.0
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Se mueve desde TarjetaActividad para usarla
 *   también en las pantallas del trabajador (feature 003)
 */

// 2. Tipos e interfaces
export interface TextoRestante {
  texto: string;
  esVencida: boolean;
}

// 3. Constantes del módulo
const MS_POR_DIA = 1000 * 60 * 60 * 24;

// 4. Función principal
/**
 * @param fechaEntregaLocal - Fecha de entrega en DD/MM/AAAA.
 * @param hoy - Fecha de referencia (por defecto, ahora).
 * @returns El texto a mostrar y si ya venció; texto vacío si la fecha no es válida.
 */
export function calcularTextoRestante(fechaEntregaLocal: string, hoy = new Date()): TextoRestante {
  const partes = fechaEntregaLocal.split('/');
  if (partes.length !== 3) {
    return { texto: '', esVencida: false };
  }
  const dia = Number(partes[0]);
  const mes = Number(partes[1]);
  const anio = Number(partes[2]);
  if (!dia || !mes || !anio) {
    return { texto: '', esVencida: false };
  }

  const inicioHoyUtc = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const entregaUtc = Date.UTC(anio, mes - 1, dia);
  const dias = Math.round((entregaUtc - inicioHoyUtc) / MS_POR_DIA);

  if (dias < 0) {
    const absDias = Math.abs(dias);
    return {
      texto: absDias === 1 ? 'Vencida hace 1 día' : `Vencida hace ${absDias} días`,
      esVencida: true,
    };
  }
  if (dias === 0) {
    return { texto: 'Vence hoy', esVencida: false };
  }
  if (dias === 1) {
    return { texto: '1 día restante', esVencida: false };
  }
  return { texto: `${dias} días restantes`, esVencida: false };
}
