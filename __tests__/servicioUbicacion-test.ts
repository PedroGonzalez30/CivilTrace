/**
 * @archivo servicioUbicacion-test.ts
 * @proyecto Civil Trace
 * @descripcion Pruebas de la ubicación del escaneo: rápida, con respaldo de la última conocida y
 *   null si no hay permiso o señal (research R-08).
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos RF-27 Registrar asistencia por el supervisor
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001)
 */

// 1. Importaciones
import * as Location from 'expo-location';

import { obtenerUbicacionRapida } from '@/servicios/local/servicioUbicacion';

// 3. Constantes del módulo
const ubicacion = jest.mocked(Location);

// 4. Pruebas
describe('servicioUbicacion', () => {
  beforeEach(() => jest.clearAllMocks());

  it('CP21-A26-APP devuelve la posición actual', async () => {
    expect(await obtenerUbicacionRapida()).toEqual({ latitud: 32.6245, longitud: -115.4523 });
  });

  it('CP21-A27-APP si la posición tarda más de 4 s usa la última conocida', async () => {
    jest.useFakeTimers();
    ubicacion.getCurrentPositionAsync.mockImplementationOnce(() => new Promise(() => undefined));
    ubicacion.getLastKnownPositionAsync.mockResolvedValueOnce({
      coords: { latitude: 32.5, longitude: -115.5 },
    } as Location.LocationObject);

    const promesa = obtenerUbicacionRapida();
    await jest.advanceTimersByTimeAsync(4_000);

    expect(await promesa).toEqual({ latitud: 32.5, longitud: -115.5 });
    jest.useRealTimers();
  });

  it('CP21-A28-APP sin permiso devuelve null (se registra "Sin ubicación GPS")', async () => {
    ubicacion.getForegroundPermissionsAsync.mockResolvedValueOnce({
      granted: false,
    } as Location.LocationPermissionResponse);
    ubicacion.requestForegroundPermissionsAsync.mockResolvedValueOnce({
      granted: false,
    } as Location.LocationPermissionResponse);

    expect(await obtenerUbicacionRapida()).toBeNull();
  });
});
