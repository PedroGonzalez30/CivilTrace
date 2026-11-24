/**
 * @archivo useConexion.ts
 * @proyecto Civil Trace
 * @descripcion Indica si el teléfono tiene internet, para avisar "Sin conexión" en asistencia.
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos RNF-07 Captura sin conexión (D-14)
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001, research R-07)
 */

// 1. Importaciones
import { useNetworkState } from 'expo-network';

// 4. Hook
/**
 * @returns true si hay internet. Mientras el sistema no responde se supone que sí, para no mostrar
 *   avisos falsos al abrir la pantalla; las llamadas fallidas se manejan aparte.
 */
export function useConexion(): boolean {
  const estado = useNetworkState();
  return estado.isInternetReachable ?? estado.isConnected ?? true;
}
