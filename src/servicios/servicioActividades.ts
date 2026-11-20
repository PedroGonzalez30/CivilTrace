/**
 * @archivo servicioActividades.ts
 * @proyecto Civil Trace
 * @descripcion Consulta actividades y avances de una obra desde la API.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 20/11/2026
 * @version 1.0.0
 */

// 1. Importaciones
import { ErrorApi, llamarApi } from '@/conexion/clienteApi';
import { URL_API } from '@/conexion/configuracionApi';
import type {
  ActividadDetalle,
  ActividadResumen,
  AvanceActividad,
  EstadoActividad,
  EstadoAvance,
} from '@/tipos/actividad';
import { convertirIsoAFechaLocal } from '@/utilidades/formatearFecha';

// 3. Constantes del módulo
const MENSAJE_RESPUESTA_INVALIDA = 'El servidor envió una respuesta inesperada';
const SIN_DATO = '—';
const LONGITUD_FECHA_ISO = 10;

// 4. Funciones privadas
function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null;
}

function textoOSinDato(valor: unknown): string {
  return typeof valor === 'string' && valor.trim() ? valor.trim() : SIN_DATO;
}

function normalizarEstadoActividad(valor: unknown): EstadoActividad {
  return valor === 'TERMINADA' ? 'TERMINADA' : 'ACTIVA';
}

function normalizarEstadoAvance(valor: unknown): EstadoAvance {
  if (valor === 'PENDIENTE' || valor === 'RECHAZADO') {
    return valor;
  }
  return 'APROBADO';
}

function formatearFechaAvance(fechaIso: string): string {
  const prefijoIso = fechaIso.slice(0, LONGITUD_FECHA_ISO);
  const fechaLocal = convertirIsoAFechaLocal(prefijoIso);
  if (fechaLocal) {
    return fechaLocal;
  }
  const fecha = new Date(fechaIso);
  if (Number.isNaN(fecha.getTime())) {
    return SIN_DATO;
  }
  const dia = String(fecha.getUTCDate()).padStart(2, '0');
  const mes = String(fecha.getUTCMonth() + 1).padStart(2, '0');
  const anio = String(fecha.getUTCFullYear());
  return `${dia}/${mes}/${anio}`;
}

function aAvance(valor: unknown): AvanceActividad {
  if (!esObjeto(valor) || typeof valor.id !== 'string' || typeof valor.fechaRegistro !== 'string') {
    throw new ErrorApi(MENSAJE_RESPUESTA_INVALIDA, null);
  }
  return {
    id: valor.id,
    comentario: typeof valor.comentario === 'string' ? valor.comentario : '',
    estado: normalizarEstadoAvance(valor.estado),
    fechaRegistro: formatearFechaAvance(valor.fechaRegistro),
    registradoPor: textoOSinDato(valor.registradoPor),
    tieneFoto: valor.tieneFoto === true,
  };
}

function aActividadResumen(valor: unknown): ActividadResumen {
  if (
    !esObjeto(valor) ||
    typeof valor.id !== 'string' ||
    typeof valor.nombre !== 'string' ||
    typeof valor.fechaEntrega !== 'string'
  ) {
    throw new ErrorApi(MENSAJE_RESPUESTA_INVALIDA, null);
  }

  const fechaEntregaLocal = convertirIsoAFechaLocal(valor.fechaEntrega) ?? valor.fechaEntrega;
  const fechaTerminadaLocal =
    typeof valor.fechaTerminada === 'string'
      ? (convertirIsoAFechaLocal(valor.fechaTerminada) ?? valor.fechaTerminada)
      : null;

  return {
    id: valor.id,
    nombre: valor.nombre,
    estado: normalizarEstadoActividad(valor.estado),
    fechaEntrega: fechaEntregaLocal,
    fechaTerminada: fechaTerminadaLocal,
    responsable: textoOSinDato(valor.responsable),
    supervisor: textoOSinDato(valor.supervisor),
  };
}

function aActividadDetalle(valor: unknown): ActividadDetalle {
  const resumen = aActividadResumen(valor);
  if (!esObjeto(valor) || !Array.isArray(valor.avances)) {
    throw new ErrorApi(MENSAJE_RESPUESTA_INVALIDA, null);
  }
  return {
    ...resumen,
    avances: valor.avances.map(aAvance),
  };
}

// 5. Funciones públicas
/**
 * Obtiene todas las actividades de una obra.
 *
 * @param tokenAcceso - Token JWT de la sesión.
 * @param idObra - Identificador de la obra.
 * @returns Lista de actividades de la obra.
 * @throws ErrorApi si falla la conexión o la respuesta no es válida.
 */
export async function obtenerActividadesObra(
  tokenAcceso: string,
  idObra: string,
): Promise<ActividadResumen[]> {
  const respuesta = await llamarApi(`/obras/${encodeURIComponent(idObra)}/actividades`, {
    tokenAcceso,
  });
  if (!esObjeto(respuesta) || !Array.isArray(respuesta.actividades)) {
    throw new ErrorApi(MENSAJE_RESPUESTA_INVALIDA, null);
  }
  return respuesta.actividades.map(aActividadResumen);
}

/**
 * Obtiene el detalle de una actividad junto con su historial de avances.
 *
 * @param tokenAcceso - Token JWT de la sesión.
 * @param idObra - Identificador de la obra.
 * @param idActividad - Identificador de la actividad.
 * @returns Detalle completo de la actividad.
 * @throws ErrorApi si falla la conexión o la respuesta no es válida.
 */
export async function obtenerDetalleActividad(
  tokenAcceso: string,
  idObra: string,
  idActividad: string,
): Promise<ActividadDetalle> {
  const ruta = `/obras/${encodeURIComponent(idObra)}/actividades/${encodeURIComponent(idActividad)}`;
  const respuesta = await llamarApi(ruta, { tokenAcceso });
  if (!esObjeto(respuesta) || !esObjeto(respuesta.actividad)) {
    throw new ErrorApi(MENSAJE_RESPUESTA_INVALIDA, null);
  }
  return aActividadDetalle(respuesta.actividad);
}

/**
 * Construye la URL autenticada para consultar la foto de evidencia de un avance.
 *
 * @param idObra - Identificador de la obra.
 * @param idActividad - Identificador de la actividad.
 * @param idAvance - Identificador del avance.
 * @returns URL completa del endpoint de imagen.
 */
export function construirUrlFotoAvance(
  idObra: string,
  idActividad: string,
  idAvance: string,
): string {
  return (
    `${URL_API}/obras/${encodeURIComponent(idObra)}/actividades/` +
    `${encodeURIComponent(idActividad)}/avances/${encodeURIComponent(idAvance)}/foto`
  );
}
