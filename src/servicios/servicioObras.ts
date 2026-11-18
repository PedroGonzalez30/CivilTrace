/**
 * @archivo servicioObras.ts
 * @proyecto Civil Trace
 * @descripcion Consulta y crea obras en la API.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 16/11/2026
 * @version 1.0.0
 * @requerimientos RF-44 Mostrar obras
 */

// 1. Importaciones
import { ErrorApi, llamarApi } from '@/conexion/clienteApi';
import type { DatosNuevaObra, Obra } from '@/tipos/obra';
import { convertirFechaLocalAIso, convertirIsoAFechaLocal } from '@/utilidades/formatearFecha';

// 3. Constantes del módulo
const MENSAJE_RESPUESTA_INVALIDA = 'El servidor envió una respuesta inesperada';
const MENSAJE_FECHA_INVALIDA = 'Revisa las fechas de la obra';
const SIN_DATO = '—';

// 4. Funciones privadas
function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null;
}

function textoOSinDato(valor: unknown): string {
  return typeof valor === 'string' && valor.trim() ? valor : SIN_DATO;
}

/**
 * Convierte una obra de la API en una Obra de la app, comprobando que traiga todo.
 */
function aObra(valor: unknown): Obra {
  if (!esObjeto(valor)) {
    throw new ErrorApi(MENSAJE_RESPUESTA_INVALIDA, null);
  }

  const { id, nombre, direccion, fechaInicio, fechaFinal } = valor;
  if (
    typeof id !== 'string' ||
    typeof nombre !== 'string' ||
    typeof direccion !== 'string' ||
    typeof fechaInicio !== 'string' ||
    typeof fechaFinal !== 'string'
  ) {
    throw new ErrorApi(MENSAJE_RESPUESTA_INVALIDA, null);
  }

  const inicio = convertirIsoAFechaLocal(fechaInicio);
  const fin = convertirIsoAFechaLocal(fechaFinal);
  if (!inicio || !fin) {
    throw new ErrorApi(MENSAJE_RESPUESTA_INVALIDA, null);
  }

  return {
    id,
    nombre,
    resumen: textoOSinDato(valor.resumen),
    descripcion: textoOSinDato(valor.descripcion),
    direccion,
    fechaInicio: inicio,
    fechaFinal: fin,
    supervisor: textoOSinDato(valor.supervisor),
    cliente: textoOSinDato(valor.cliente),
  };
}

// 5. Funciones públicas
/**
 * Pide las obras de la empresa del usuario.
 *
 * @param tokenAcceso - Token de acceso de la sesión.
 * @returns Las obras de la empresa; vacío si no tiene ninguna.
 * @throws ErrorApi si no hay conexión o la sesión expiró.
 */
export async function obtenerObras(tokenAcceso: string): Promise<Obra[]> {
  const respuesta = await llamarApi('/obras', { tokenAcceso });
  if (!esObjeto(respuesta) || !Array.isArray(respuesta.obras)) {
    throw new ErrorApi(MENSAJE_RESPUESTA_INVALIDA, null);
  }
  return respuesta.obras.map(aObra);
}

/**
 * Crea una obra. Solo el dueño tiene permiso.
 *
 * @param tokenAcceso - Token de acceso de la sesión.
 * @param datos - Datos del formulario (fechas como DD/MM/AAAA).
 * @returns La obra creada.
 * @throws ErrorApi con un mensaje en español si los datos no son válidos o no hay conexión.
 */
export async function crearObra(tokenAcceso: string, datos: DatosNuevaObra): Promise<Obra> {
  const fechaInicio = convertirFechaLocalAIso(datos.fechaInicio);
  const fechaFinal = convertirFechaLocalAIso(datos.fechaFin);
  if (!fechaInicio || !fechaFinal) {
    throw new ErrorApi(MENSAJE_FECHA_INVALIDA, null);
  }

  const respuesta = await llamarApi('/obras', {
    metodo: 'POST',
    tokenAcceso,
    cuerpo: {
      nombre: datos.nombre.trim(),
      descripcion: datos.descripcion.trim(),
      cliente: datos.cliente.trim(),
      correoCliente: datos.correoCliente.trim(),
      direccion: datos.direccion.trim(),
      fechaInicio,
      fechaFinal,
      // Si va vacío no se manda: la API deja la obra sin supervisor.
      supervisorId: datos.supervisorId || undefined,
      trabajadoresIds: datos.trabajadoresIds,
    },
  });
  if (!esObjeto(respuesta)) {
    throw new ErrorApi(MENSAJE_RESPUESTA_INVALIDA, null);
  }
  return aObra(respuesta.obra);
}