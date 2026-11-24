/**
 * @archivo servicioSincronizacionAsistencia-test.ts
 * @proyecto Civil Trace
 * @descripcion Pruebas del envío de escaneos pendientes: borrado solo con confirmación, rechazos,
 *   errores de red, candado, lotes de 100, sesión y 401.
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos RNF-07 Captura sin conexión (D-14), RF-27 Registrar asistencia por el
 *   supervisor
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001)
 */

// 1. Importaciones
import { ErrorApi, ErrorSinConexion } from '@/conexion/clienteApi';
import type { EscaneoPendiente } from '@/servicios/local/repositorioLocal';
import { establecerRepositorioLocal } from '@/servicios/local/repositorioLocal';
import {
  reiniciarSincronizacion,
  sincronizar,
} from '@/servicios/local/servicioSincronizacionAsistencia';
import * as servicioAsistencia from '@/servicios/servicioAsistencia';
import { RolUsuario, type SesionAutenticacion } from '@/tipos/autenticacion';
import type { EscaneoParaEnviar, ResultadoEscaneo } from '@/tipos/asistencia';

import { crearRepositorioEnMemoria } from './dobles/repositorioEnMemoria';

// 3. Constantes del módulo
jest.mock('@/servicios/servicioAsistencia');
const asistencia = jest.mocked(servicioAsistencia);

const SESION: SesionAutenticacion = {
  token: 'tkn',
  tokenRefresco: 'ref',
  venceEn: Date.now() + 60_000,
  usuario: {
    id: 'maria',
    nombre: 'María',
    correo: 'm@e.com',
    rol: RolUsuario.SUPERVISOR,
    empresaId: 'e1',
  },
};

const pendiente = (indice: number, usuarioId = 'maria'): EscaneoPendiente => ({
  idLocal: `id-${String(indice).padStart(3, '0')}`,
  usuarioId,
  obraId: 'hospital',
  codigoQr: `ct1.${indice}`,
  trabajadorId: null,
  trabajadorNombre: `Trabajador ${indice}`,
  tipo: 'ENTRADA',
  capturadoEn: new Date(Date.UTC(2026, 10, 20, 16, 0, indice)).toISOString(),
  sinConexion: true,
  latitud: null,
  longitud: null,
  estado: 'PENDIENTE',
  motivo: null,
  mensaje: null,
});

const resultado = (idLocal: string, estado: ResultadoEscaneo['estado']): ResultadoEscaneo => ({
  idLocal,
  estado,
  motivo: estado === 'RECHAZADO' ? 'NO_ASIGNADO' : null,
  mensaje: estado === 'RECHAZADO' ? 'El trabajador no está asignado a esta obra' : null,
  registro: null,
});

// 4. Pruebas
describe('servicioSincronizacionAsistencia', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    reiniciarSincronizacion();
  });

  it('CP21-A3-APP GUARDADO y DUPLICADO se borran; RECHAZADO queda con su motivo', async () => {
    const repo = crearRepositorioEnMemoria();
    establecerRepositorioLocal(repo);
    for (const i of [1, 2, 3]) await repo.guardarEscaneo(pendiente(i));
    asistencia.enviarEscaneos.mockResolvedValueOnce([
      resultado('id-001', 'GUARDADO'),
      resultado('id-002', 'DUPLICADO'),
      resultado('id-003', 'RECHAZADO'),
    ]);

    await sincronizar(SESION);

    expect(await repo.contarPendientes('maria')).toBe(0);
    expect(await repo.listarRechazados('maria')).toEqual([
      expect.objectContaining({ idLocal: 'id-003', motivo: 'NO_ASIGNADO' }),
    ]);
    const enviados = asistencia.enviarEscaneos.mock.calls[0]![1] as EscaneoParaEnviar[];
    expect(enviados[0]).toEqual({
      idLocal: 'id-001',
      obraId: 'hospital',
      codigoQr: 'ct1.1',
      capturadoEn: pendiente(1).capturadoEn,
      sinConexion: true,
      latitud: null,
      longitud: null,
    });
  });

  it('CP21-A23-APP un error de red no borra nada y se reintenta después', async () => {
    const repo = crearRepositorioEnMemoria();
    establecerRepositorioLocal(repo);
    await repo.guardarEscaneo(pendiente(1));
    asistencia.enviarEscaneos.mockRejectedValueOnce(new ErrorSinConexion());

    await sincronizar(SESION);
    expect(await repo.contarPendientes('maria')).toBe(1);

    asistencia.enviarEscaneos.mockResolvedValueOnce([resultado('id-001', 'GUARDADO')]);
    await sincronizar(SESION);
    expect(await repo.contarPendientes('maria')).toBe(0);
  });

  it('CP21-A24-APP dos llamadas simultáneas hacen un solo envío', async () => {
    const repo = crearRepositorioEnMemoria();
    establecerRepositorioLocal(repo);
    await repo.guardarEscaneo(pendiente(1));
    asistencia.enviarEscaneos.mockResolvedValue([resultado('id-001', 'GUARDADO')]);

    await Promise.all([sincronizar(SESION), sincronizar(SESION)]);

    expect(asistencia.enviarEscaneos).toHaveBeenCalledTimes(1);
  });

  it('CP21-A4-APP 150 pendientes salen en lotes de 100 y 50, en orden de captura', async () => {
    const repo = crearRepositorioEnMemoria();
    establecerRepositorioLocal(repo);
    for (let i = 150; i >= 1; i -= 1) await repo.guardarEscaneo(pendiente(i));
    asistencia.enviarEscaneos.mockImplementation(async (_token, escaneos) =>
      escaneos.map((e) => resultado(e.idLocal, 'GUARDADO')),
    );

    await sincronizar(SESION);

    const lotes = asistencia.enviarEscaneos.mock.calls.map((llamada) => llamada[1]);
    expect(lotes.map((lote) => lote.length)).toEqual([100, 50]);
    expect(lotes[0]![0]!.idLocal).toBe('id-001');
    expect(lotes[1]![49]!.idLocal).toBe('id-150');
  });

  it('CP21-A5-APP solo se envían los pendientes del usuario de la sesión', async () => {
    const repo = crearRepositorioEnMemoria();
    establecerRepositorioLocal(repo);
    await repo.guardarEscaneo(pendiente(1, 'luis'));
    await repo.guardarEscaneo(pendiente(2));
    asistencia.enviarEscaneos.mockResolvedValue([resultado('id-002', 'GUARDADO')]);

    await sincronizar(SESION);

    expect(asistencia.enviarEscaneos.mock.calls[0]![1].map((e) => e.idLocal)).toEqual(['id-002']);
    expect(await repo.contarPendientes('luis')).toBe(1);
  });

  it('CP21-A25-APP un 401 detiene la sincronización hasta un nuevo inicio de sesión', async () => {
    const repo = crearRepositorioEnMemoria();
    establecerRepositorioLocal(repo);
    await repo.guardarEscaneo(pendiente(1));
    asistencia.enviarEscaneos.mockRejectedValueOnce(
      new ErrorApi('Sesión no válida o expirada', 401),
    );

    await sincronizar(SESION);
    await sincronizar(SESION);

    expect(asistencia.enviarEscaneos).toHaveBeenCalledTimes(1);
    expect(await repo.contarPendientes('maria')).toBe(1);

    reiniciarSincronizacion();
    asistencia.enviarEscaneos.mockResolvedValueOnce([resultado('id-001', 'GUARDADO')]);
    await sincronizar({ ...SESION, token: 'nuevo' });
    expect(await repo.contarPendientes('maria')).toBe(0);
  });
});
