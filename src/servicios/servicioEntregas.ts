/**
 * @archivo servicioEntregas.ts
 * @proyecto Civil Trace
 * @descripcion Llamadas a la API para enviar entregas al cliente, listarlas, descargar su reporte o
 *   su acta en PDF y reenviar el enlace del portal de la obra.
 * @autor Emilio Manuel Esquivel
 * @fecha 24/11/2026
 * @version 1.0.0
 * @requerimientos RF-13 Enviar entrega al cliente, RF-16 Generar acta de entrega-recepción,
 *   RF-65 Enviar enlace del portal al cliente
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Creación (feature 004)
 */

// 1. Importaciones
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { ErrorApi, ErrorSinConexion, llamarApi } from '@/conexion/clienteApi';
import { URL_API } from '@/conexion/configuracionApi';
import type {
  DocumentoEntrega,
  Entrega,
  EntregaEnviada,
  EstadoEntrega,
  ResultadoEnlacePortal,
} from '@/tipos/entrega';
import { convertirFechaLocalAIso, convertirIsoAFechaLocal } from '@/utilidades/formatearFecha';

// 3. Constantes del módulo
const MENSAJE_RESPUESTA_INVALIDA = 'El servidor envió una respuesta inesperada';
const MENSAJE_FECHA_INVALIDA = 'Revisa las fechas del filtro';
const MENSAJE_DESCARGA = 'No se pudo descargar el documento. Inténtalo de nuevo.';
const ESTADOS: readonly EstadoEntrega[] = ['ENVIADA', 'ACEPTADA', 'CON_OBSERVACIONES'];
const RESULTADOS_ENLACE: readonly ResultadoEnlacePortal[] = ['ENVIADO', 'FALLIDO', 'SIN_CORREO'];
const NOMBRES_DOCUMENTO: Record<DocumentoEntrega, string> = {
  reporte: 'Reporte',
  acta: 'Acta',
};

// 4. Funciones privadas
function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null;
}

function textoONulo(valor: unknown): string | null {
  return typeof valor === 'string' ? valor : null;
}

function numero(valor: unknown): number {
  return typeof valor === 'number' ? valor : 0;
}

function fechaLocal(valor: unknown): string {
  const fecha = typeof valor === 'string' ? convertirIsoAFechaLocal(valor) : null;
  if (!fecha) {
    throw new ErrorApi(MENSAJE_RESPUESTA_INVALIDA, null);
  }
  return fecha;
}

function aEntrega(valor: unknown): Entrega {
  if (!esObjeto(valor) || typeof valor.id !== 'string') {
    throw new ErrorApi(MENSAJE_RESPUESTA_INVALIDA, null);
  }
  const estado = ESTADOS.find((opcion) => opcion === valor.estado);
  if (!estado) {
    throw new ErrorApi(MENSAJE_RESPUESTA_INVALIDA, null);
  }
  return {
    id: valor.id,
    estado,
    fechaInicio: fechaLocal(valor.fechaInicio),
    fechaFin: fechaLocal(valor.fechaFin),
    enviadaEn: textoONulo(valor.enviadaEn) ?? '',
    enviadaPor: textoONulo(valor.enviadaPor),
    actividades: numero(valor.actividades),
    fotos: numero(valor.fotos),
    nombreCliente: textoONulo(valor.nombreCliente),
    observaciones: textoONulo(valor.observaciones),
    respondidaEn: textoONulo(valor.respondidaEn),
    tieneActa: valor.tieneActa === true,
  };
}

function aResultadoEnlace(valor: unknown): ResultadoEnlacePortal {
  return RESULTADOS_ENLACE.find((opcion) => opcion === valor) ?? 'FALLIDO';
}

// 5. Funciones públicas
/**
 * Envía al cliente las fotos aprobadas del rango (D-29).
 *
 * @param tokenAcceso - Token de la sesión (supervisor de la obra o dueño).
 * @param idObra - Obra.
 * @param fechaInicio - DD/MM/AAAA.
 * @param fechaFin - DD/MM/AAAA.
 * @returns Resumen de la entrega y si el correo salió.
 * @throws ErrorApi con `motivo` `SIN_CORREO_CLIENTE` o `SIN_FOTOS_APROBADAS`, o sin conexión.
 */
export async function enviarEntrega(
  tokenAcceso: string,
  idObra: string,
  fechaInicio: string,
  fechaFin: string,
): Promise<EntregaEnviada> {
  const inicio = convertirFechaLocalAIso(fechaInicio);
  const fin = convertirFechaLocalAIso(fechaFin);
  if (!inicio || !fin) {
    throw new ErrorApi(MENSAJE_FECHA_INVALIDA, null);
  }
  const respuesta = await llamarApi(`/obras/${idObra}/entregas`, {
    metodo: 'POST',
    tokenAcceso,
    cuerpo: { fechaInicio: inicio, fechaFin: fin },
  });
  if (!esObjeto(respuesta) || typeof respuesta.id !== 'string') {
    throw new ErrorApi(MENSAJE_RESPUESTA_INVALIDA, null);
  }
  return {
    id: respuesta.id,
    actividades: numero(respuesta.actividades),
    fotos: numero(respuesta.fotos),
    enlacePortal: aResultadoEnlace(respuesta.enlacePortal),
  };
}

/**
 * @param tokenAcceso - Token de la sesión.
 * @param idObra - Obra.
 * @returns Las entregas de la obra, la más reciente primero.
 */
export async function listarEntregas(tokenAcceso: string, idObra: string): Promise<Entrega[]> {
  const respuesta = await llamarApi(`/obras/${idObra}/entregas`, { tokenAcceso });
  if (!Array.isArray(respuesta)) {
    throw new ErrorApi(MENSAJE_RESPUESTA_INVALIDA, null);
  }
  return respuesta.map(aEntrega);
}

/**
 * Descarga el reporte o el acta de una entrega y abre el menú para compartirla. El acta se genera
 * la primera vez que se pide (RF-16); es el mismo archivo que descarga el cliente (RF-71).
 *
 * @param tokenAcceso - Token de la sesión.
 * @param idObra - Obra.
 * @param idEntrega - Entrega.
 * @param documento - `reporte` o `acta`.
 * @returns La dirección local del PDF.
 * @throws ErrorApi si la descarga falla.
 */
export async function descargarDocumentoEntrega(
  tokenAcceso: string,
  idObra: string,
  idEntrega: string,
  documento: DocumentoEntrega,
): Promise<string> {
  const nombre = `${NOMBRES_DOCUMENTO[documento]}_${idEntrega}.pdf`;
  let archivo: File;
  try {
    archivo = await File.downloadFileAsync(
      `${URL_API}/obras/${idObra}/entregas/${idEntrega}/${documento}.pdf`,
      new File(Paths.cache, nombre),
      { headers: { Authorization: `Bearer ${tokenAcceso}` }, idempotent: true },
    );
  } catch (error) {
    if (error instanceof Error && /Network|conexi/i.test(error.message)) {
      throw new ErrorSinConexion();
    }
    throw new ErrorApi(MENSAJE_DESCARGA, null);
  }
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(archivo.uri, {
      mimeType: 'application/pdf',
      dialogTitle: nombre,
      UTI: 'com.adobe.pdf',
    });
  }
  return archivo.uri;
}

/**
 * Vuelve a mandar al cliente el enlace permanente del portal de la obra (solo el dueño).
 *
 * @param tokenAcceso - Token del dueño.
 * @param idObra - Obra.
 * @throws ErrorApi con `motivo` `SIN_CORREO_CLIENTE`, o si el correo no salió.
 */
export async function reenviarEnlacePortal(tokenAcceso: string, idObra: string): Promise<void> {
  await llamarApi(`/obras/${idObra}/enlace-portal/reenviar`, { metodo: 'POST', tokenAcceso });
}
