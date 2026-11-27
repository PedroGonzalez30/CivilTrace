/**
 * @archivo servicioUbicacion.ts
 * @proyecto Civil Trace
 * @descripcion Ubicación del escaneo de asistencia sin frenar al supervisor: posición actual en
 *   4 s como máximo, si no la última conocida, si no "Sin ubicación GPS" (null).
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.1.0
 * @requerimientos RF-27 Registrar asistencia por el supervisor, RF-08 Capturar evidencia
 *   fotográfica
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001, research R-08)
 *   25/11/2026 - Emilio Manuel Esquivel - Ubicación con precisión para las evidencias (feature 007)
 */

// 1. Importaciones
import * as Location from 'expo-location';

import type { UbicacionEvidencia } from '@/tipos/actividad';

// 2. Tipos e interfaces
export interface Ubicacion {
  latitud: number;
  longitud: number;
}

// 3. Constantes del módulo
const TIEMPO_MAXIMO_MS = 4_000;
// La foto ya está tomada: se puede esperar un poco más para una posición precisa.
const TIEMPO_MAXIMO_EVIDENCIA_MS = 8_000;
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

// La API de Expo no tiene tiempo límite: se compite contra un temporizador, que se cancela al
// terminar para no dejarlo vivo.
async function conTiempoLimite<T>(promesa: Promise<T>, ms: number): Promise<T | null> {
  let temporizador: ReturnType<typeof setTimeout> | undefined;
  const limite = new Promise<null>((resolver) => {
    temporizador = setTimeout(() => resolver(null), ms);
  });
  try {
    return await Promise.race([promesa, limite]);
  } finally {
    clearTimeout(temporizador);
  }
}

/**
 * Ubicación para una evidencia fotográfica (feature 007, RF-08): la posición actual con su
 * precisión, o la última conocida de hace menos de 5 minutos. Sin permiso ni señal, null: la
 * pantalla pide entonces una referencia escrita.
 *
 * @returns Coordenadas con la precisión en metros, o null.
 */
export async function obtenerUbicacionEvidencia(): Promise<UbicacionEvidencia | null> {
  try {
    if (!(await tienePermiso())) {
      return null;
    }
    const actual = await conTiempoLimite(
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
      TIEMPO_MAXIMO_EVIDENCIA_MS,
    );
    const posicion =
      actual ?? (await Location.getLastKnownPositionAsync({ maxAge: ANTIGUEDAD_MAXIMA_MS }));
    if (!posicion) {
      return null;
    }
    const precision = posicion.coords.accuracy;
    return {
      latitud: posicion.coords.latitude,
      longitud: posicion.coords.longitude,
      precisionMetros: typeof precision === 'number' && precision >= 0 ? precision : null,
    };
  } catch {
    return null;
  }
}

/**
 * @returns La ubicación del teléfono o null si no hay permiso ni posición reciente.
 */
export async function obtenerUbicacionRapida(): Promise<Ubicacion | null> {
  try {
    if (!(await tienePermiso())) {
      return null;
    }
    const actual = await conTiempoLimite(
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      TIEMPO_MAXIMO_MS,
    );
    const posicion =
      actual ?? (await Location.getLastKnownPositionAsync({ maxAge: ANTIGUEDAD_MAXIMA_MS }));
    return posicion
      ? { latitud: posicion.coords.latitude, longitud: posicion.coords.longitude }
      : null;
  } catch {
    return null;
  }
}
