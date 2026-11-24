/**
 * @archivo servicioUbicacion.ts
 * @proyecto Civil Trace
 * @descripcion Ubicación del escaneo de asistencia sin frenar al supervisor: posición actual en
 *   4 s como máximo, si no la última conocida, si no "Sin ubicación GPS" (null).
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos RF-27 Registrar asistencia por el supervisor
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001, research R-08)
 */

// 1. Importaciones
import * as Location from 'expo-location';

// 2. Tipos e interfaces
export interface Ubicacion {
  latitud: number;
  longitud: number;
}

// 3. Constantes del módulo
const TIEMPO_MAXIMO_MS = 4_000;
const ANTIGUEDAD_MAXIMA_MS = 5 * 60_000;

// 4. Funciones
async function tienePermiso(): Promise<boolean> {
  const actual = await Location.getForegroundPermissionsAsync();
  if (actual.granted) {
    return true;
  }
  const solicitado = await Location.requestForegroundPermissionsAsync();
  return solicitado.granted;
}

function esperar(ms: number): Promise<null> {
  return new Promise((resolver) => setTimeout(() => resolver(null), ms));
}

/**
 * @returns La ubicación del teléfono o null si no hay permiso ni posición reciente.
 */
export async function obtenerUbicacionRapida(): Promise<Ubicacion | null> {
  try {
    if (!(await tienePermiso())) {
      return null;
    }
    // La API de Expo no tiene tiempo límite: se compite contra un temporizador.
    const actual = await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      esperar(TIEMPO_MAXIMO_MS),
    ]);
    const posicion =
      actual ?? (await Location.getLastKnownPositionAsync({ maxAge: ANTIGUEDAD_MAXIMA_MS }));
    return posicion
      ? { latitud: posicion.coords.latitude, longitud: posicion.coords.longitude }
      : null;
  } catch {
    return null;
  }
}
