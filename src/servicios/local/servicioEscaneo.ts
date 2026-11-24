/**
 * @archivo servicioEscaneo.ts
 * @proyecto Civil Trace
 * @descripcion Prepara la confirmación de un QR escaneado (con conexión pide la vista previa al
 *   servidor; sin conexión usa el paquete guardado) y acepta el escaneo guardándolo en la cola
 *   local antes de enviarlo.
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos RF-27 Registrar asistencia por el supervisor, RNF-07 Captura sin conexión
 *   (D-14)
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001, research R-06 y R-10)
 */

// 1. Importaciones
import * as Crypto from 'expo-crypto';

import { ErrorApi, ErrorSinConexion } from '@/conexion/clienteApi';
import { URL_API } from '@/conexion/configuracionApi';
import { MENSAJES_ASISTENCIA } from '@/constantes/textosAsistencia';
import { obtenerRepositorioLocal } from '@/servicios/local/repositorioLocal';
import { buscarPorQr, PREFIJO_QR } from '@/servicios/local/servicioPaqueteObra';
import { sincronizar } from '@/servicios/local/servicioSincronizacionAsistencia';
import type { Ubicacion } from '@/servicios/local/servicioUbicacion';
import { pedirVistaPrevia } from '@/servicios/servicioAsistencia';
import type { SesionAutenticacion } from '@/tipos/autenticacion';
import type { TipoRegistro } from '@/tipos/asistencia';
import { obtenerFechaLocal } from '@/utilidades/formatoHoras';

// 2. Tipos e interfaces
export interface FotoTrabajador {
  uri: string;
  headers?: Record<string, string>;
}

export interface EscaneoPreparado {
  ok: true;
  obraId: string;
  codigoQr: string;
  tipo: TipoRegistro;
  hora: string;
  sinConexion: boolean;
  zonaHoraria: string;
  trabajador: {
    id: string;
    nombre: string;
    oficio: string | null;
    foto: FotoTrabajador | null;
    faltasMes: number;
  };
}

export type ResultadoPreparacion = EscaneoPreparado | { ok: false; mensaje: string };

// 3. Constantes del módulo
const ZONA_POR_DEFECTO = 'America/Tijuana';
const BYTES_UUID = 16;
const VERSION_UUID = 0x40;
const VARIANTE_UUID = 0x80;

// 4. Funciones privadas
// UUID v4 para el idLocal (research R-06). Se usa randomUUID si el SDK lo trae.
function crearIdLocal(): string {
  const conRandomUuid = Crypto as unknown as { randomUUID?: () => string };
  if (typeof conRandomUuid.randomUUID === 'function') {
    return conRandomUuid.randomUUID();
  }
  const bytes = Crypto.getRandomBytes(BYTES_UUID);
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | VERSION_UUID;
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | VARIANTE_UUID;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

async function prepararSinConexion(
  obraId: string,
  codigoQr: string,
): Promise<ResultadoPreparacion> {
  if (!codigoQr.startsWith(PREFIJO_QR)) {
    return { ok: false, mensaje: MENSAJES_ASISTENCIA.qrInvalido };
  }
  const repositorio = await obtenerRepositorioLocal();
  const paquete = await repositorio.obtenerPaquete(obraId);
  const trabajador = paquete ? await buscarPorQr(obraId, codigoQr) : null;
  if (!paquete || !trabajador) {
    return { ok: false, mensaje: MENSAJES_ASISTENCIA.noEncontradoEnPaquete };
  }

  // Misma regla que el servidor: sin entrada → entrada; con entrada → salida; con ambas → completa.
  const ahora = new Date();
  const fecha = obtenerFechaLocal(ahora, paquete.zonaHoraria);
  const registro = await repositorio.obtenerRegistroDia(obraId, trabajador.trabajadorId, fecha);
  if (registro?.tieneEntrada && registro.tieneSalida) {
    return { ok: false, mensaje: MENSAJES_ASISTENCIA.asistenciaCompleta };
  }
  return {
    ok: true,
    obraId,
    codigoQr,
    tipo: registro?.tieneEntrada ? 'SALIDA' : 'ENTRADA',
    hora: ahora.toISOString(),
    sinConexion: true,
    zonaHoraria: paquete.zonaHoraria,
    trabajador: {
      id: trabajador.trabajadorId,
      nombre: trabajador.nombre,
      oficio: trabajador.oficio,
      foto: trabajador.fotoLocal ? { uri: trabajador.fotoLocal } : null,
      faltasMes: trabajador.faltasMes,
    },
  };
}

// 5. Funciones públicas
/**
 * Datos para la confirmación del QR escaneado. Con conexión manda el servidor; si no hay red se
 * usa lo guardado en el teléfono.
 */
export async function prepararEscaneo(
  sesion: SesionAutenticacion,
  obraId: string,
  codigoQr: string,
): Promise<ResultadoPreparacion> {
  try {
    const vista = await pedirVistaPrevia(sesion.token, obraId, codigoQr);
    const paquete = await (await obtenerRepositorioLocal()).obtenerPaquete(obraId);
    return {
      ok: true,
      obraId,
      codigoQr,
      tipo: vista.tipo,
      hora: vista.hora,
      sinConexion: false,
      zonaHoraria: paquete?.zonaHoraria ?? ZONA_POR_DEFECTO,
      trabajador: {
        id: vista.trabajador.id,
        nombre: vista.trabajador.nombre,
        oficio: vista.trabajador.oficio,
        foto: vista.trabajador.fotoUrl
          ? {
              uri: `${URL_API}${vista.trabajador.fotoUrl}`,
              headers: { Authorization: `Bearer ${sesion.token}` },
            }
          : null,
        faltasMes: vista.trabajador.faltasMes,
      },
    };
  } catch (error) {
    if (error instanceof ErrorSinConexion) {
      return prepararSinConexion(obraId, codigoQr);
    }
    if (error instanceof ErrorApi) {
      return { ok: false, mensaje: error.message };
    }
    throw error;
  }
}

/**
 * Guarda el escaneo aceptado en la cola local (antes de enviarlo, para no perderlo nunca),
 * actualiza lo que el teléfono sabe del día e intenta enviarlo.
 */
export async function aceptarEscaneo(
  sesion: SesionAutenticacion,
  escaneo: EscaneoPreparado,
  ubicacion: Ubicacion | null,
): Promise<void> {
  const repositorio = await obtenerRepositorioLocal();
  await repositorio.guardarEscaneo({
    idLocal: crearIdLocal(),
    usuarioId: sesion.usuario.id,
    obraId: escaneo.obraId,
    codigoQr: escaneo.codigoQr,
    trabajadorId: escaneo.trabajador.id,
    trabajadorNombre: escaneo.trabajador.nombre,
    tipo: escaneo.tipo,
    capturadoEn: escaneo.hora,
    sinConexion: escaneo.sinConexion,
    latitud: ubicacion?.latitud ?? null,
    longitud: ubicacion?.longitud ?? null,
    estado: 'PENDIENTE',
    motivo: null,
    mensaje: null,
  });

  const fecha = obtenerFechaLocal(new Date(escaneo.hora), escaneo.zonaHoraria);
  const previo = await repositorio.obtenerRegistroDia(escaneo.obraId, escaneo.trabajador.id, fecha);
  await repositorio.guardarRegistroDia({
    obraId: escaneo.obraId,
    trabajadorId: escaneo.trabajador.id,
    fecha,
    tieneEntrada: true,
    tieneSalida: escaneo.tipo === 'SALIDA',
    horaEntrada: escaneo.tipo === 'ENTRADA' ? escaneo.hora : (previo?.horaEntrada ?? null),
  });

  void sincronizar(sesion);
}
