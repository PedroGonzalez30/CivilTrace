/**
 * @archivo servicioAsistencia.ts
 * @proyecto Civil Trace
 * @descripcion Llamadas a la API de asistencia: QR propio, "Mi asistencia", obras del supervisor,
 *   paquete sin conexión, vista previa del escaneo, envío de escaneos y resumen del día.
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos RF-19 Registrar asistencia propia, RF-27 Registrar asistencia por el
 *   supervisor, RNF-07 Captura sin conexión
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001)
 */

// 1. Importaciones
import { llamarApi } from '@/conexion/clienteApi';
import type {
  CredencialAsistencia,
  EscaneoParaEnviar,
  MiDia,
  ObraSupervisada,
  PaqueteSinConexion,
  ResultadoEscaneo,
  ResumenDia,
  VistaPrevia,
} from '@/tipos/asistencia';

// 4. Funciones
/** QR permanente del trabajador (D-17). */
export async function obtenerMiCredencial(tokenAcceso: string): Promise<CredencialAsistencia> {
  return (await llamarApi('/asistencia/mi-credencial', { tokenAcceso })) as CredencialAsistencia;
}

/** Horario de hoy y estado de entrada y salida por obra del trabajador. */
export async function obtenerMiDia(tokenAcceso: string): Promise<MiDia> {
  return (await llamarApi('/asistencia/mi-dia', { tokenAcceso })) as MiDia;
}

/** Obras que supervisa el usuario (SUP_Asistencia_EscogerObra). */
export async function listarMisObras(tokenAcceso: string): Promise<ObraSupervisada[]> {
  const datos = (await llamarApi('/asistencia/mis-obras', { tokenAcceso })) as {
    obras: ObraSupervisada[];
  };
  return datos.obras;
}

/** Datos para validar QR sin conexión (solo huellas, nunca tokens). */
export async function obtenerPaquete(
  tokenAcceso: string,
  obraId: string,
): Promise<PaqueteSinConexion> {
  return (await llamarApi(`/obras/${obraId}/asistencia/paquete-sin-conexion`, {
    tokenAcceso,
  })) as PaqueteSinConexion;
}

/**
 * Valida un QR con conexión sin guardar nada.
 *
 * @throws ErrorApi 422 con motivo si el QR no se puede registrar; ErrorSinConexion sin red.
 */
export async function pedirVistaPrevia(
  tokenAcceso: string,
  obraId: string,
  codigoQr: string,
): Promise<VistaPrevia> {
  return (await llamarApi(`/obras/${obraId}/asistencia/vista-previa`, {
    metodo: 'POST',
    cuerpo: { codigoQr },
    tokenAcceso,
  })) as VistaPrevia;
}

/** Envía un lote de escaneos (máximo 100). Reenviar el mismo idLocal no duplica. */
export async function enviarEscaneos(
  tokenAcceso: string,
  escaneos: EscaneoParaEnviar[],
): Promise<ResultadoEscaneo[]> {
  const datos = (await llamarApi('/asistencia/registros', {
    metodo: 'POST',
    cuerpo: { escaneos },
    tokenAcceso,
  })) as { resultados: ResultadoEscaneo[] };
  return datos.resultados;
}

/** Resumen de asistencia de un día en la obra (hoy si no se indica fecha). */
export async function obtenerResumenDia(
  tokenAcceso: string,
  obraId: string,
  fecha?: string,
): Promise<ResumenDia> {
  const consulta = fecha ? `?fecha=${fecha}` : '';
  return (await llamarApi(`/obras/${obraId}/asistencia${consulta}`, { tokenAcceso })) as ResumenDia;
}
