/**
 * @archivo useMiAsistencia.ts
 * @proyecto Civil Trace
 * @descripcion Datos de "Mi asistencia": QR (primero el guardado, luego el del servidor), horario
 *   y estados de hoy por obra, y oficio del trabajador. Indica si no hay conexión.
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos RF-19 Registrar asistencia propia, D-17, D-18, RNF-07 Captura sin conexión
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001)
 */

// 1. Importaciones
import { useCallback, useState } from 'react';

import { ErrorApi, ErrorSinConexion } from '@/conexion/clienteApi';
import { guardarQrPropio, leerQrPropio } from '@/servicios/local/servicioQrPropio';
import { obtenerMiCredencial, obtenerMiDia } from '@/servicios/servicioAsistencia';
import { obtenerPerfil } from '@/servicios/servicioPerfil';
import type { SesionAutenticacion } from '@/tipos/autenticacion';
import type { MiDia } from '@/tipos/asistencia';

// 2. Tipos e interfaces
interface EstadoMiAsistencia {
  codigoQr: string | null;
  miDia: MiDia | null;
  oficio: string;
  cargando: boolean;
  sinConexion: boolean;
  error: string | null;
}

// 3. Constantes del módulo
const MENSAJE_ERROR = 'No se pudo cargar tu asistencia';

// 4. Hook
/**
 * @param sesion - Sesión del trabajador.
 * @returns Estado de la pantalla y la función para recargarla.
 */
export function useMiAsistencia(sesion: SesionAutenticacion) {
  const [estado, setEstado] = useState<EstadoMiAsistencia>({
    codigoQr: null,
    miDia: null,
    oficio: '',
    cargando: true,
    sinConexion: false,
    error: null,
  });
  const usuarioId = sesion.usuario.id;
  const token = sesion.token;

  const cargar = useCallback(async () => {
    setEstado((previo) => ({ ...previo, cargando: true, error: null }));
    // Primero el QR guardado: así se ve al instante y también sin señal (SC-005).
    const guardado = await leerQrPropio(usuarioId);
    if (guardado) {
      setEstado((previo) => ({ ...previo, codigoQr: guardado }));
    }

    const [credencial, miDia, perfil] = await Promise.allSettled([
      obtenerMiCredencial(token),
      obtenerMiDia(token),
      obtenerPerfil(token),
    ]);
    if (credencial.status === 'fulfilled') {
      await guardarQrPropio(usuarioId, credencial.value.codigoQr);
    }

    const fallos = [credencial, miDia, perfil].flatMap((r) =>
      r.status === 'rejected' ? [r.reason] : [],
    );
    const sinConexion = fallos.some((motivo) => motivo instanceof ErrorSinConexion);
    const errorApi = fallos.find(
      (motivo) => motivo instanceof ErrorApi && !(motivo instanceof ErrorSinConexion),
    );

    setEstado((previo) => ({
      codigoQr: credencial.status === 'fulfilled' ? credencial.value.codigoQr : previo.codigoQr,
      miDia: miDia.status === 'fulfilled' ? miDia.value : previo.miDia,
      oficio: perfil.status === 'fulfilled' ? perfil.value.oficio : previo.oficio,
      cargando: false,
      sinConexion,
      error: errorApi instanceof ErrorApi ? errorApi.message || MENSAJE_ERROR : null,
    }));
  }, [token, usuarioId]);

  return { ...estado, recargar: cargar };
}
