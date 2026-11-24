/**
 * @archivo servicioQrPropio.ts
 * @proyecto Civil Trace
 * @descripcion Guarda el QR del trabajador en Secure Store para mostrarlo sin conexión.
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos RF-19 Registrar asistencia propia, D-17, RNF-07 Captura sin conexión
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001, research R-02)
 */

// 1. Importaciones
import * as SecureStore from 'expo-secure-store';

// 3. Constantes del módulo
const PREFIJO_CLAVE = 'civiltrace.qrAsistencia.';

// 4. Funciones
// Una clave por usuario: si otra persona inicia sesión en el teléfono no ve un QR ajeno.
function obtenerClave(usuarioId: string): string {
  return `${PREFIJO_CLAVE}${usuarioId.replace(/[^A-Za-z0-9._-]/g, '_')}`;
}

/**
 * @param usuarioId - Trabajador.
 * @returns El QR guardado o null si nunca se descargó.
 */
export async function leerQrPropio(usuarioId: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(obtenerClave(usuarioId));
  } catch {
    // Si el almacén seguro falla, la pantalla pide el QR al servidor.
    return null;
  }
}

/**
 * @param usuarioId - Trabajador.
 * @param codigoQr - Texto del QR (ct1.…).
 */
export async function guardarQrPropio(usuarioId: string, codigoQr: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(obtenerClave(usuarioId), codigoQr);
  } catch {
    // No guardarlo solo impide verlo sin conexión; la pantalla sigue funcionando.
  }
}
