/**
 * @archivo servicioPaqueteObra.ts
 * @proyecto Civil Trace
 * @descripcion Paquete de la obra para escanear sin conexión: lo descarga con las fotos de los
 *   trabajadores y el resumen del día, y busca al dueño de un QR por su huella SHA-256.
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos RNF-07 Captura sin conexión (D-14), RF-27 Registrar asistencia por el
 *   supervisor
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001, research R-03 y R-05)
 */

// 1. Importaciones
import * as Crypto from 'expo-crypto';
import { Directory, File, Paths } from 'expo-file-system';

import { URL_API } from '@/conexion/configuracionApi';
import {
  obtenerRepositorioLocal,
  type TrabajadorGuardado,
} from '@/servicios/local/repositorioLocal';
import { obtenerPaquete, obtenerResumenDia } from '@/servicios/servicioAsistencia';
import type { SesionAutenticacion } from '@/tipos/autenticacion';
import type { PaqueteSinConexion, ResumenDia, TrabajadorPaquete } from '@/tipos/asistencia';

// 3. Constantes del módulo
export const PREFIJO_QR = 'ct1.';
const CARPETA_FOTOS = ['asistencia', 'fotos'];

// 4. Funciones
/**
 * Huella del QR como la calcula la API: SHA-256 hex del texto después de "ct1.".
 *
 * @param token - Texto del QR sin el prefijo.
 */
export async function calcularHuellaQr(token: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, token);
}

// La foto se guarda en el teléfono para mostrarla en la confirmación sin señal. Si no se puede
// descargar, la confirmación muestra las iniciales.
async function descargarFoto(
  token: string,
  obraId: string,
  trabajador: TrabajadorPaquete,
): Promise<string | null> {
  if (!trabajador.fotoUrl) {
    return null;
  }
  try {
    const carpeta = new Directory(Paths.document, ...CARPETA_FOTOS, obraId);
    carpeta.create({ intermediates: true, idempotent: true });
    const destino = new File(carpeta, trabajador.id);
    if (destino.exists) {
      destino.delete();
    }
    const tarea = File.createDownloadTask(`${URL_API}${trabajador.fotoUrl}`, destino, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const archivo = await tarea.downloadAsync();
    return archivo?.uri ?? null;
  } catch {
    return null;
  }
}

/**
 * Descarga y guarda el paquete de la obra, las fotos y los registros de hoy.
 *
 * @throws ErrorSinConexion si no hay red; ErrorApi si el servidor lo rechaza.
 */
export async function actualizarPaquete(
  sesion: SesionAutenticacion,
  obraId: string,
): Promise<{ paquete: PaqueteSinConexion; resumen: ResumenDia }> {
  const [paquete, resumen] = await Promise.all([
    obtenerPaquete(sesion.token, obraId),
    obtenerResumenDia(sesion.token, obraId),
  ]);
  const repositorio = await obtenerRepositorioLocal();

  const trabajadores: TrabajadorGuardado[] = [];
  for (const trabajador of paquete.trabajadores) {
    trabajadores.push({
      obraId,
      trabajadorId: trabajador.id,
      nombre: trabajador.nombre,
      oficio: trabajador.oficio,
      huellaCredencial: trabajador.huellaCredencial,
      fotoLocal: await descargarFoto(sesion.token, obraId, trabajador),
      faltasMes: trabajador.faltasMes,
    });
  }
  await repositorio.guardarPaquete(
    {
      obraId,
      usuarioId: sesion.usuario.id,
      zonaHoraria: paquete.zonaHoraria,
      horario: paquete.horario,
      generadoEn: paquete.generadoEn,
    },
    trabajadores,
  );
  await repositorio.reemplazarRegistrosDia(
    obraId,
    resumen.fecha,
    resumen.trabajadores.map((trabajador) => ({
      obraId,
      trabajadorId: trabajador.id,
      fecha: resumen.fecha,
      tieneEntrada: trabajador.entrada !== null,
      tieneSalida: trabajador.salida !== null,
      horaEntrada: trabajador.entrada,
    })),
  );
  return { paquete, resumen };
}

/**
 * Busca en el paquete guardado al trabajador dueño del QR.
 *
 * @returns El trabajador o null si el QR no es de Civil Trace o no está en el paquete.
 */
export async function buscarPorQr(
  obraId: string,
  codigoQr: string,
): Promise<TrabajadorGuardado | null> {
  if (!codigoQr.startsWith(PREFIJO_QR)) {
    return null;
  }
  const repositorio = await obtenerRepositorioLocal();
  const huella = await calcularHuellaQr(codigoQr.slice(PREFIJO_QR.length));
  return repositorio.buscarTrabajadorPorHuella(obraId, huella);
}
