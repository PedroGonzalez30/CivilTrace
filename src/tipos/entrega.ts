/**
 * @archivo entrega.ts
 * @proyecto Civil Trace
 * @descripcion Tipos de las entregas al cliente y del enlace del portal (contrato
 *   CivilTrace-API/specs/004-portal-cliente/contracts/portal-api.md).
 * @autor Emilio Manuel Esquivel
 * @fecha 24/11/2026
 * @version 1.0.0
 * @requerimientos RF-13 Enviar entrega al cliente, RF-16 Generar acta de entrega-recepción,
 *   RF-65 Enviar enlace del portal al cliente
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Creación (feature 004)
 */

// 2. Tipos e interfaces
export type EstadoEntrega = 'ENVIADA' | 'ACEPTADA' | 'CON_OBSERVACIONES';

/** Resultado del correo con el enlace del portal. */
export type ResultadoEnlacePortal = 'ENVIADO' | 'FALLIDO' | 'SIN_CORREO';

export interface Entrega {
  id: string;
  estado: EstadoEntrega;
  /** DD/MM/AAAA. */
  fechaInicio: string;
  /** DD/MM/AAAA. */
  fechaFin: string;
  enviadaEn: string;
  enviadaPor: string | null;
  actividades: number;
  fotos: number;
  nombreCliente: string | null;
  observaciones: string | null;
  respondidaEn: string | null;
  tieneActa: boolean;
}

export interface EntregaEnviada {
  id: string;
  actividades: number;
  fotos: number;
  enlacePortal: ResultadoEnlacePortal;
}

export type DocumentoEntrega = 'reporte' | 'acta';
