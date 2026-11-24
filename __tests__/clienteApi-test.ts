/**
 * @archivo clienteApi-test.ts
 * @proyecto Civil Trace
 * @descripcion Pruebas del cliente HTTP: errores sin conexión, motivo de la API y método PATCH.
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos RNF-07 Captura sin conexión, RF-27 Registrar asistencia por el supervisor
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001)
 */

// 1. Importaciones
import { ErrorApi, ErrorSinConexion, llamarApi } from '@/conexion/clienteApi';

// 4. Pruebas
jest.mock('@/conexion/configuracionApi', () => ({
  URL_API: 'https://api.prueba',
  TIEMPO_ESPERA_API_MS: 1000,
}));

const responder = (estado: number, cuerpo: unknown) =>
  jest.fn(async () => ({
    status: estado,
    ok: estado >= 200 && estado < 300,
    text: async () => JSON.stringify(cuerpo),
  })) as unknown as typeof fetch;

describe('clienteApi', () => {
  it('CP21-A7-APP sin respuesta del servidor lanza ErrorSinConexion', async () => {
    globalThis.fetch = jest.fn(async () => {
      throw new TypeError('Network request failed');
    }) as unknown as typeof fetch;

    const promesa = llamarApi('/salud');
    await expect(promesa).rejects.toBeInstanceOf(ErrorSinConexion);
    await expect(llamarApi('/salud')).rejects.toBeInstanceOf(ErrorApi);
  });

  it('CP21-A8-APP un 422 conserva el motivo que manda la API', async () => {
    globalThis.fetch = responder(422, {
      mensaje: 'El trabajador no está asignado a esta obra',
      motivo: 'NO_ASIGNADO',
    });

    await expect(
      llamarApi('/obras/1/asistencia/vista-previa', { metodo: 'POST', cuerpo: {} }),
    ).rejects.toMatchObject({
      estado: 422,
      motivo: 'NO_ASIGNADO',
      message: 'El trabajador no está asignado a esta obra',
    });
  });

  it('CP19-A3-APP envía PATCH con cuerpo JSON y token', async () => {
    const fetchSimulado = responder(200, { ok: true });
    globalThis.fetch = fetchSimulado;

    await llamarApi('/ruta', { metodo: 'PATCH', cuerpo: { anotacion: 'x' }, tokenAcceso: 'tkn' });

    expect(fetchSimulado).toHaveBeenCalledWith(
      'https://api.prueba/ruta',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ anotacion: 'x' }),
        headers: expect.objectContaining({ Authorization: 'Bearer tkn' }),
      }),
    );
  });
});
