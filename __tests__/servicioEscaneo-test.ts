/**
 * @archivo servicioEscaneo-test.ts
 * @proyecto Civil Trace
 * @descripcion Pruebas del escaneo: con conexión usa la vista previa del servidor; sin conexión
 *   valida contra el paquete guardado y decide entrada/salida con los registros del día.
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos RF-27 Registrar asistencia por el supervisor, RNF-07 Captura sin conexión
 *   (D-14)
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001)
 */

// 1. Importaciones
import { ErrorApi, ErrorSinConexion } from '@/conexion/clienteApi';
import { establecerRepositorioLocal } from '@/servicios/local/repositorioLocal';
import { calcularHuellaQr } from '@/servicios/local/servicioPaqueteObra';
import { aceptarEscaneo, prepararEscaneo } from '@/servicios/local/servicioEscaneo';
import * as sincronizacion from '@/servicios/local/servicioSincronizacionAsistencia';
import * as servicioAsistencia from '@/servicios/servicioAsistencia';
import { RolUsuario, type SesionAutenticacion } from '@/tipos/autenticacion';

import { crearRepositorioEnMemoria } from './dobles/repositorioEnMemoria';

// 3. Constantes del módulo
jest.mock('@/servicios/servicioAsistencia');
jest.mock('@/servicios/local/servicioSincronizacionAsistencia', () => ({
  sincronizar: jest.fn(async () => undefined),
}));

const asistencia = jest.mocked(servicioAsistencia);
const SESION: SesionAutenticacion = {
  token: 'tkn',
  tokenRefresco: 'ref',
  venceEn: Date.now() + 60_000,
  usuario: {
    id: 'maria',
    nombre: 'María Castro',
    correo: 'm@e.com',
    rol: RolUsuario.SUPERVISOR,
    empresaId: 'e1',
  },
};
const TOKEN_ANA = 'q2l2aWxUcmFjZS1hbmEtdG9rZW4tZGUtcHJ1ZWJhLTMyYnl0';
const QR_ANA = `ct1.${TOKEN_ANA}`;

async function prepararRepoConPaquete() {
  const repo = crearRepositorioEnMemoria();
  establecerRepositorioLocal(repo);
  await repo.guardarPaquete(
    {
      obraId: 'hospital',
      usuarioId: 'maria',
      zonaHoraria: 'America/Tijuana',
      horario: { general: null, excepcionHoy: null },
      generadoEn: '2026-11-20T15:00:00.000Z',
    },
    [
      {
        obraId: 'hospital',
        trabajadorId: 'ana',
        nombre: 'Ana Sánchez',
        oficio: 'Albañil',
        huellaCredencial: await calcularHuellaQr(TOKEN_ANA),
        fotoLocal: 'file:///documentos/asistencia/fotos/hospital/ana',
        faltasMes: 1,
      },
    ],
  );
  return repo;
}

// 4. Pruebas
describe('servicioEscaneo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
    jest.setSystemTime(new Date('2026-11-20T16:02:00Z'));
  });
  afterEach(() => jest.useRealTimers());

  it('CP21-A2-APP la huella del QR es el SHA-256 hex del texto sin el prefijo, como en la API', async () => {
    // Valor calculado en la API con createHash('sha256').update(token).digest('hex').
    expect(await calcularHuellaQr('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });

  it('CP21-A1-APP sin conexión: ENTRADA, luego SALIDA y el tercer escaneo se rechaza', async () => {
    asistencia.pedirVistaPrevia.mockRejectedValue(new ErrorSinConexion());
    const repo = await prepararRepoConPaquete();

    const primero = await prepararEscaneo(SESION, 'hospital', QR_ANA);
    expect(primero).toMatchObject({
      ok: true,
      tipo: 'ENTRADA',
      sinConexion: true,
      trabajador: { id: 'ana', nombre: 'Ana Sánchez', faltasMes: 1 },
    });
    if (!primero.ok) throw new Error('debía aceptarse');
    await aceptarEscaneo(SESION, primero, { latitud: 32.6, longitud: -115.4 });
    expect(await repo.contarPendientes('maria')).toBe(1);
    expect(sincronizacion.sincronizar).toHaveBeenCalled();

    const segundo = await prepararEscaneo(SESION, 'hospital', QR_ANA);
    expect(segundo).toMatchObject({ ok: true, tipo: 'SALIDA' });
    if (!segundo.ok) throw new Error('debía aceptarse');
    await aceptarEscaneo(SESION, segundo, null);

    const tercero = await prepararEscaneo(SESION, 'hospital', QR_ANA);
    expect(tercero).toEqual({ ok: false, mensaje: 'La asistencia de hoy ya está completa' });

    const pendientes = await repo.listarPendientes('maria');
    expect(pendientes.map((p) => p.tipo)).toEqual(['ENTRADA', 'SALIDA']);
    expect(pendientes[0]).toMatchObject({
      sinConexion: true,
      latitud: 32.6,
      trabajadorNombre: 'Ana Sánchez',
    });
    expect(pendientes[0]!.idLocal).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('CP21-A21-APP sin conexión, un QR que no está en el paquete da el mensaje de actualizar', async () => {
    asistencia.pedirVistaPrevia.mockRejectedValue(new ErrorSinConexion());
    await prepararRepoConPaquete();

    expect(await prepararEscaneo(SESION, 'hospital', 'ct1.desconocido')).toEqual({
      ok: false,
      mensaje: 'No se encontró al trabajador en los datos guardados; conéctate para actualizarlos.',
    });
    expect(await prepararEscaneo(SESION, 'hospital', 'otro-qr')).toEqual({
      ok: false,
      mensaje: 'El código no es de Civil Trace o ya no es válido',
    });
  });

  it('CP21-A22-APP con conexión usa la vista previa y muestra el rechazo del servidor', async () => {
    await prepararRepoConPaquete();
    asistencia.pedirVistaPrevia.mockResolvedValueOnce({
      tipo: 'ENTRADA',
      hora: '2026-11-20T16:02:00.000Z',
      trabajador: {
        id: 'ana',
        nombre: 'Ana Sánchez',
        oficio: 'Albañil',
        fotoUrl: '/obras/hospital/asistencia/trabajadores/ana/foto',
        faltasMes: 0,
      },
    });
    const conVistaPrevia = await prepararEscaneo(SESION, 'hospital', QR_ANA);
    expect(conVistaPrevia).toMatchObject({
      ok: true,
      sinConexion: false,
      trabajador: { faltasMes: 0 },
    });

    asistencia.pedirVistaPrevia.mockRejectedValueOnce(
      new ErrorApi('El trabajador no está asignado a esta obra', 422, 'NO_ASIGNADO'),
    );
    expect(await prepararEscaneo(SESION, 'hospital', QR_ANA)).toEqual({
      ok: false,
      mensaje: 'El trabajador no está asignado a esta obra',
    });
  });
});
