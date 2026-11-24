/**
 * @archivo servicioSincronizacionAsistencia.ts
 * @proyecto Civil Trace
 * @descripcion Envía los escaneos pendientes a la API en lotes de 100, en orden de captura. Borra
 *   solo los confirmados (GUARDADO o DUPLICADO), marca los RECHAZADO y reintenta si no hay red.
 *   Se dispara al aceptar un escaneo, al volver la red, al volver la app al frente y al iniciar.
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos RNF-07 Captura sin conexión (D-14), RF-27 Registrar asistencia por el
 *   supervisor
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001, research R-09)
 */

// 1. Importaciones
import { addNetworkStateListener } from 'expo-network';
import { AppState } from 'react-native';

import { ErrorApi } from '@/conexion/clienteApi';
import { obtenerRepositorioLocal } from '@/servicios/local/repositorioLocal';
import { enviarEscaneos } from '@/servicios/servicioAsistencia';
import type { SesionAutenticacion } from '@/tipos/autenticacion';

// 3. Constantes del módulo
const TAMANO_LOTE = 100;
const CODIGO_NO_AUTORIZADO = 401;

let envioEnCurso: Promise<void> | null = null;
// Con la sesión vencida no tiene caso reintentar: se espera a un nuevo inicio de sesión.
let detenidoPorSesion = false;
const suscriptores = new Set<() => void>();

// 4. Funciones privadas
function avisarCambios(): void {
  suscriptores.forEach((avisar) => avisar());
}

async function enviarPendientes(sesion: SesionAutenticacion): Promise<void> {
  const repositorio = await obtenerRepositorioLocal();
  for (;;) {
    const pendientes = await repositorio.listarPendientes(sesion.usuario.id, TAMANO_LOTE);
    if (pendientes.length === 0) {
      return;
    }
    const resultados = await enviarEscaneos(
      sesion.token,
      pendientes.map((p) => ({
        idLocal: p.idLocal,
        obraId: p.obraId,
        codigoQr: p.codigoQr,
        capturadoEn: p.capturadoEn,
        sinConexion: p.sinConexion,
        latitud: p.latitud,
        longitud: p.longitud,
      })),
    );

    const confirmados = resultados
      .filter((r) => r.estado === 'GUARDADO' || r.estado === 'DUPLICADO')
      .map((r) => r.idLocal);
    await repositorio.borrarEscaneos(confirmados);
    for (const rechazado of resultados.filter((r) => r.estado === 'RECHAZADO')) {
      await repositorio.marcarRechazado(rechazado.idLocal, rechazado.motivo, rechazado.mensaje);
    }
    avisarCambios();

    // Si el servidor no respondió por todos, se reintenta en el siguiente evento.
    const sinRespuesta = pendientes.length - resultados.length;
    if (pendientes.length < TAMANO_LOTE || sinRespuesta > 0) {
      return;
    }
  }
}

// 5. Funciones públicas
/**
 * Envía los pendientes del usuario de la sesión. Si ya hay un envío en curso, devuelve ese mismo.
 * Nunca lanza: los errores dejan los pendientes para el siguiente intento.
 */
export function sincronizar(sesion: SesionAutenticacion): Promise<void> {
  if (detenidoPorSesion) {
    return Promise.resolve();
  }
  if (!envioEnCurso) {
    envioEnCurso = enviarPendientes(sesion)
      .catch((error: unknown) => {
        if (error instanceof ErrorApi && error.estado === CODIGO_NO_AUTORIZADO) {
          detenidoPorSesion = true;
        }
      })
      .finally(() => {
        envioEnCurso = null;
        avisarCambios();
      });
  }
  return envioEnCurso;
}

/** Vuelve a permitir envíos (nuevo inicio de sesión). También lo usan las pruebas. */
export function reiniciarSincronizacion(): void {
  detenidoPorSesion = false;
  envioEnCurso = null;
}

/**
 * Avisa cuando cambian los pendientes o rechazados (para actualizar los avisos de la pantalla).
 *
 * @returns Función para dejar de escuchar.
 */
export function suscribirseACambios(avisar: () => void): () => void {
  suscriptores.add(avisar);
  return () => suscriptores.delete(avisar);
}

/** Avisa a las pantallas que algo cambió (por ejemplo, al descartar un rechazado). */
export function notificarCambios(): void {
  avisarCambios();
}

/**
 * Envía los pendientes al volver la red o la app al frente, y ahora mismo.
 *
 * @returns Función para detener la sincronización automática (al cerrar sesión).
 */
export function iniciarSincronizacionAutomatica(sesion: SesionAutenticacion): () => void {
  reiniciarSincronizacion();
  const red = addNetworkStateListener((estado) => {
    if (estado.isInternetReachable ?? estado.isConnected) {
      void sincronizar(sesion);
    }
  });
  const app = AppState.addEventListener('change', (estadoApp) => {
    if (estadoApp === 'active') {
      void sincronizar(sesion);
    }
  });
  void sincronizar(sesion);
  return () => {
    red.remove();
    app.remove();
  };
}
