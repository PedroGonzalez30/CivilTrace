/**
 * @archivo servicioActividades.ts
 * @proyecto Civil Trace
 * @descripcion Consulta, crea y revisa actividades y avances de una obra desde la API, y sube
 *              evidencias fotográficas.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 20/11/2026
 * @version 2.1.0
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Crear actividad, subir evidencia, revisar
 *   avance y mis actividades; campos nuevos de la API (feature 003)
 * @historial 25/11/2026 - Emilio Manuel Esquivel - La foto se sube como File de expo-file-system
 *   (D-33): fetch(uri) en Android subía el texto "File not found"
 * @historial 25/11/2026 - Emilio Manuel Esquivel - Ubicación de cada evidencia: se manda al subir
 *   y se lee en cada avance (feature 007, RF-08)
 */

// 1. Importaciones
import { ErrorApi, llamarApi } from '@/conexion/clienteApi';
import { URL_API } from '@/conexion/configuracionApi';
import type {
  ActividadDetalle,
  ActividadResumen,
  AvanceActividad,
  DatosNuevaActividad,
  DecisionRevision,
  EstadoActividad,
  EstadoAvance,
  EvidenciaNueva,
  MiActividad,
  ResultadoRevision,
} from '@/tipos/actividad';
import { convertirFechaLocalAIso, convertirIsoAFechaLocal } from '@/utilidades/formatearFecha';
import { abrirFotoLocal } from '@/utilidades/archivoLocal';
import { leerUbicacionRespuesta } from '@/utilidades/ubicacionEvidencia';

// 3. Constantes del módulo
const MENSAJE_RESPUESTA_INVALIDA = 'El servidor envió una respuesta inesperada';
const SIN_DATO = '—';
const LONGITUD_FECHA_ISO = 10;
const TIEMPO_ESPERA_SUBIDA_MS = 60000;

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
    tipo: valor.tipo === 'TERMINADO' ? 'TERMINADO' : 'DIARIO',
    observacion: typeof valor.observacion === 'string' ? valor.observacion : null,
    revisadoPor: typeof valor.revisadoPor === 'string' ? valor.revisadoPor : null,
    ...leerUbicacionRespuesta(valor),
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
    descripcion: typeof valor.descripcion === 'string' ? valor.descripcion : '',
    fechaInicio:
      typeof valor.fechaInicio === 'string'
        ? (convertirIsoAFechaLocal(valor.fechaInicio) ?? valor.fechaInicio)
        : null,
    responsableId: typeof valor.responsableId === 'string' ? valor.responsableId : null,
    enRevision: valor.enRevision === true,
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
    bloqueada: valor.bloqueada === true,
  };
}

// RF-08: coordenadas del teléfono o, sin GPS, la referencia escrita (la API exige una de las dos).
function cabecerasUbicacion(evidencia: EvidenciaNueva): Record<string, string> {
  if (evidencia.ubicacion) {
    const { latitud, longitud, precisionMetros } = evidencia.ubicacion;
    return {
      'x-latitud': String(latitud),
      'x-longitud': String(longitud),
      ...(precisionMetros === null ? {} : { 'x-precision-ubicacion': String(precisionMetros) }),
    };
  }
  return { 'x-referencia-ubicacion': encodeURIComponent(evidencia.referenciaUbicacion.trim()) };
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

function rutaActividades(idObra: string): string {
  return `/obras/${encodeURIComponent(idObra)}/actividades`;
}

function rutaActividad(idObra: string, idActividad: string): string {
  return `${rutaActividades(idObra)}/${encodeURIComponent(idActividad)}`;
}

/**
 * Crea una actividad en la obra (supervisor de la obra o dueño).
 *
 * @param tokenAcceso - Token JWT de la sesión.
 * @param idObra - Obra donde se agrega.
 * @param datos - Datos capturados; las fechas en DD/MM/AAAA.
 * @returns La actividad creada.
 * @throws ErrorApi si los datos no son válidos, no hay permiso o falla la red.
 */
export async function crearActividad(
  tokenAcceso: string,
  idObra: string,
  datos: DatosNuevaActividad,
): Promise<ActividadDetalle> {
  const fechaInicio = convertirFechaLocalAIso(datos.fechaInicio);
  const respuesta = await llamarApi(rutaActividades(idObra), {
    metodo: 'POST',
    tokenAcceso,
    cuerpo: {
      nombre: datos.nombre.trim(),
      descripcion: datos.descripcion.trim(),
      responsableId: datos.responsableId,
      fechaEntrega: convertirFechaLocalAIso(datos.fechaEntrega),
      ...(fechaInicio ? { fechaInicio } : {}),
    },
  });
  if (!esObjeto(respuesta) || !esObjeto(respuesta.actividad)) {
    throw new ErrorApi(MENSAJE_RESPUESTA_INVALIDA, null);
  }
  return aActividadDetalle(respuesta.actividad);
}

/**
 * Sube una foto de evidencia. La del trabajador queda pendiente de revisión; la del supervisor,
 * aprobada (D-10).
 *
 * @param tokenAcceso - Token JWT de la sesión.
 * @param idObra - Obra de la actividad.
 * @param idActividad - Actividad.
 * @param evidencia - Foto local, tipo de avance y comentario opcional.
 * @returns El avance registrado.
 * @throws ErrorApi si no se puede leer la foto, no hay permiso o la actividad ya terminó.
 */
export async function subirEvidencia(
  tokenAcceso: string,
  idObra: string,
  idActividad: string,
  evidencia: EvidenciaNueva,
): Promise<AvanceActividad> {
  // D-33: se manda el archivo tal cual; fetch(uri) en Android subía el texto "File not found".
  const datos = abrirFotoLocal(evidencia.uri);
  const respuesta = await llamarApi(`${rutaActividad(idObra, idActividad)}/avances`, {
    metodo: 'POST',
    tokenAcceso,
    cuerpoBinario: { datos, tipo: evidencia.tipoImagen },
    encabezados: {
      'x-tipo-avance': evidencia.tipo,
      'x-comentario-avance': encodeURIComponent(evidencia.comentario.trim()),
      ...cabecerasUbicacion(evidencia),
    },
    tiempoEsperaMs: TIEMPO_ESPERA_SUBIDA_MS,
  });
  if (!esObjeto(respuesta)) {
    throw new ErrorApi(MENSAJE_RESPUESTA_INVALIDA, null);
  }
  return aAvance(respuesta.avance);
}

/**
 * Aprueba o rechaza un avance pendiente. Al rechazar, la observación es obligatoria.
 *
 * @returns El avance revisado y la actividad actualizada.
 * @throws ErrorApi si falta la observación, ya se revisó o no hay permiso.
 */
export async function revisarAvance(
  tokenAcceso: string,
  idObra: string,
  idActividad: string,
  idAvance: string,
  decision: DecisionRevision,
  observacion: string,
): Promise<ResultadoRevision> {
  const texto = observacion.trim();
  const respuesta = await llamarApi(
    `${rutaActividad(idObra, idActividad)}/avances/${encodeURIComponent(idAvance)}/revision`,
    {
      metodo: 'PATCH',
      tokenAcceso,
      cuerpo: { decision, ...(texto ? { observacion: texto } : {}) },
    },
  );
  if (!esObjeto(respuesta)) {
    throw new ErrorApi(MENSAJE_RESPUESTA_INVALIDA, null);
  }
  return { avance: aAvance(respuesta.avance), actividad: aActividadDetalle(respuesta.actividad) };
}

/**
 * @param tokenAcceso - Token JWT del trabajador.
 * @returns Sus actividades activas en todas sus obras.
 * @throws ErrorApi si falla la red o la respuesta no es válida.
 */
export async function obtenerMisActividades(tokenAcceso: string): Promise<MiActividad[]> {
  const respuesta = await llamarApi('/actividades/mias', { tokenAcceso });
  if (!esObjeto(respuesta) || !Array.isArray(respuesta.actividades)) {
    throw new ErrorApi(MENSAJE_RESPUESTA_INVALIDA, null);
  }
  return respuesta.actividades.map((valor: unknown) => {
    if (!esObjeto(valor) || typeof valor.obraId !== 'string') {
      throw new ErrorApi(MENSAJE_RESPUESTA_INVALIDA, null);
    }
    return {
      ...aActividadResumen(valor),
      obraId: valor.obraId,
      obraNombre: textoOSinDato(valor.obraNombre),
    };
  });
}
