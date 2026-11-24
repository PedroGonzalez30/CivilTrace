/**
 * @archivo repositorioAsistenciaLocal-test.ts
 * @proyecto Civil Trace
 * @descripcion Pruebas del almacenamiento local: contrato de RepositorioLocal (cola, paquete,
 *   registros del día), migración de la base y conversión de filas SQLite.
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos RNF-07 Captura sin conexión (D-14)
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001)
 */

// 1. Importaciones
import type { SQLiteDatabase } from 'expo-sqlite';

import { migrarBaseLocal } from '@/servicios/local/baseLocal';
import { crearRepositorioSqlite } from '@/servicios/local/repositorioAsistenciaLocal';
import type { EscaneoPendiente } from '@/servicios/local/repositorioLocal';

import { crearRepositorioEnMemoria } from './dobles/repositorioEnMemoria';

// 3. Constantes del módulo
const escaneo = (sobrescribir: Partial<EscaneoPendiente> = {}): EscaneoPendiente => ({
  idLocal: 'id-1',
  usuarioId: 'maria',
  obraId: 'hospital',
  codigoQr: 'ct1.abc',
  trabajadorId: 'ana',
  trabajadorNombre: 'Ana Sánchez',
  tipo: 'ENTRADA',
  capturadoEn: '2026-11-20T16:00:00.000Z',
  sinConexion: true,
  latitud: null,
  longitud: null,
  estado: 'PENDIENTE',
  motivo: null,
  mensaje: null,
  ...sobrescribir,
});

// 4. Pruebas
describe('RepositorioLocal (contrato, versión en memoria)', () => {
  it('CP21-A9-APP lista pendientes por usuario en orden de captura y respeta el límite', async () => {
    const repo = crearRepositorioEnMemoria();
    await repo.guardarEscaneo(escaneo({ idLocal: 'b', capturadoEn: '2026-11-20T16:05:00.000Z' }));
    await repo.guardarEscaneo(escaneo({ idLocal: 'a', capturadoEn: '2026-11-20T16:01:00.000Z' }));
    await repo.guardarEscaneo(escaneo({ idLocal: 'otro', usuarioId: 'luis' }));

    expect((await repo.listarPendientes('maria')).map((e) => e.idLocal)).toEqual(['a', 'b']);
    expect(await repo.listarPendientes('maria', 1)).toHaveLength(1);
    expect(await repo.contarPendientes('maria', 'hospital')).toBe(2);
  });

  it('CP21-A10-APP un rechazado sale de pendientes y conserva su motivo hasta descartarlo', async () => {
    const repo = crearRepositorioEnMemoria();
    await repo.guardarEscaneo(escaneo());
    await repo.marcarRechazado('id-1', 'NO_ASIGNADO', 'El trabajador no está asignado a esta obra');

    expect(await repo.contarPendientes('maria')).toBe(0);
    expect(await repo.listarRechazados('maria', 'hospital')).toEqual([
      expect.objectContaining({ motivo: 'NO_ASIGNADO', estado: 'RECHAZADO' }),
    ]);
    await repo.borrarEscaneos(['id-1']);
    expect(await repo.listarRechazados('maria')).toEqual([]);
  });

  it('CP21-A11-APP el paquete se reemplaza completo y se busca por huella', async () => {
    const repo = crearRepositorioEnMemoria();
    const paquete = {
      obraId: 'hospital',
      usuarioId: 'maria',
      zonaHoraria: 'America/Tijuana',
      horario: { general: null, excepcionHoy: null },
      generadoEn: '2026-11-20T15:45:00.000Z',
    };
    const trabajador = {
      obraId: 'hospital',
      trabajadorId: 'ana',
      nombre: 'Ana',
      oficio: null,
      huellaCredencial: 'h1',
      fotoLocal: null,
      faltasMes: 0,
    };
    await repo.guardarPaquete(paquete, [
      trabajador,
      { ...trabajador, trabajadorId: 'luis', huellaCredencial: 'h2' },
    ]);
    await repo.guardarPaquete(paquete, [trabajador]);

    expect(await repo.listarTrabajadoresPaquete('hospital')).toHaveLength(1);
    expect((await repo.buscarTrabajadorPorHuella('hospital', 'h1'))?.trabajadorId).toBe('ana');
    expect(await repo.buscarTrabajadorPorHuella('hospital', 'h2')).toBeNull();
  });

  it('CP21-A12-APP los registros del día se reemplazan y se actualizan por trabajador', async () => {
    const repo = crearRepositorioEnMemoria();
    const registro = {
      obraId: 'hospital',
      trabajadorId: 'ana',
      fecha: '2026-11-20',
      tieneEntrada: true,
      tieneSalida: false,
      horaEntrada: '2026-11-20T16:02:00.000Z',
    };
    await repo.reemplazarRegistrosDia('hospital', '2026-11-20', [registro]);
    await repo.guardarRegistroDia({ ...registro, tieneSalida: true });

    expect(await repo.obtenerRegistroDia('hospital', 'ana', '2026-11-20')).toMatchObject({
      tieneEntrada: true,
      tieneSalida: true,
    });
    expect(await repo.listarRegistrosDia('hospital', '2026-11-20')).toHaveLength(1);
  });
});

describe('Base SQLite', () => {
  const crearBaseSimulada = (version: number, filas: unknown[] = []) =>
    ({
      execAsync: jest.fn(async () => undefined),
      getFirstAsync: jest.fn(async () => ({ user_version: version })),
      getAllAsync: jest.fn(async () => filas),
      runAsync: jest.fn(async () => ({ changes: 1, lastInsertRowId: 1 })),
      withTransactionAsync: jest.fn(async (tarea: () => Promise<void>) => tarea()),
    }) as unknown as SQLiteDatabase & { execAsync: jest.Mock; getAllAsync: jest.Mock };

  it('CP21-A13-APP la migración crea las tablas solo en una base nueva', async () => {
    const nueva = crearBaseSimulada(0);
    await migrarBaseLocal(nueva);
    expect(nueva.execAsync).toHaveBeenCalledWith(
      expect.stringContaining('CREATE TABLE IF NOT EXISTS escaneo_pendiente'),
    );
    expect(nueva.execAsync).toHaveBeenCalledWith('PRAGMA user_version = 1');

    const migrada = crearBaseSimulada(1);
    await migrarBaseLocal(migrada);
    expect(migrada.execAsync).toHaveBeenCalledTimes(1); // solo el PRAGMA de WAL
  });

  it('CP21-A14-APP convierte las filas de SQLite al formato de la app', async () => {
    const db = crearBaseSimulada(1, [
      {
        id_local: 'id-1',
        usuario_id: 'maria',
        obra_id: 'hospital',
        codigo_qr: 'ct1.abc',
        trabajador_id: null,
        trabajador_nombre: null,
        tipo: 'SALIDA',
        capturado_en: '2026-11-20T16:00:00.000Z',
        sin_conexion: 1,
        latitud: 32.6,
        longitud: -115.4,
        estado: 'PENDIENTE',
        motivo: null,
        mensaje: null,
      },
    ]);
    const repo = crearRepositorioSqlite(db);

    const [pendiente] = await repo.listarPendientes('maria', 100);
    expect(pendiente).toMatchObject({
      idLocal: 'id-1',
      sinConexion: true,
      tipo: 'SALIDA',
      latitud: 32.6,
    });
    expect(db.getAllAsync).toHaveBeenCalledWith(expect.stringContaining('LIMIT ?'), ['maria', 100]);
  });
});

describe('Repositorio SQLite: todas las operaciones generan su SQL', () => {
  it('CP21-A40-APP ejecuta cada operación contra la base con sus parámetros', async () => {
    const llamadas: string[] = [];
    const db = {
      execAsync: jest.fn(async () => undefined),
      runAsync: jest.fn(async (sql: string) => {
        llamadas.push(sql.replace(/\s+/g, ' ').trim().slice(0, 30));
        return { changes: 1, lastInsertRowId: 1 };
      }),
      getAllAsync: jest.fn(async () => []),
      getFirstAsync: jest.fn(async (sql: string) =>
        sql.includes('COUNT')
          ? { total: 3 }
          : sql.includes('paquete_obra')
            ? {
                obra_id: 'o1',
                usuario_id: 'maria',
                zona_horaria: 'America/Tijuana',
                horario_json: '{"general":null,"excepcionHoy":null}',
                generado_en: 'g',
              }
            : null,
      ),
      withTransactionAsync: jest.fn(async (tarea: () => Promise<void>) => tarea()),
    } as unknown as SQLiteDatabase;
    const repo = crearRepositorioSqlite(db);
    const registro = {
      obraId: 'o1',
      trabajadorId: 'ana',
      fecha: '2026-11-20',
      tieneEntrada: true,
      tieneSalida: false,
      horaEntrada: null,
    };

    await repo.guardarEscaneo(escaneo());
    await repo.borrarEscaneos([]);
    await repo.borrarEscaneos(['a', 'b']);
    await repo.marcarRechazado('a', 'NO_ASIGNADO', 'm');
    await repo.guardarPaquete(
      {
        obraId: 'o1',
        usuarioId: 'maria',
        zonaHoraria: 'America/Tijuana',
        horario: { general: null, excepcionHoy: null },
        generadoEn: 'g',
      },
      [
        {
          obraId: 'o1',
          trabajadorId: 'ana',
          nombre: 'Ana',
          oficio: null,
          huellaCredencial: 'h',
          fotoLocal: null,
          faltasMes: 0,
        },
      ],
    );
    await repo.reemplazarRegistrosDia('o1', '2026-11-20', [registro]);
    await repo.guardarRegistroDia(registro);

    expect(await repo.contarPendientes('maria', 'o1')).toBe(3);
    expect(await repo.obtenerPaquete('o1')).toMatchObject({
      zonaHoraria: 'America/Tijuana',
      horario: { general: null },
    });
    expect(await repo.listarRechazados('maria', 'o1')).toEqual([]);
    expect(await repo.listarTrabajadoresPaquete('o1')).toEqual([]);
    expect(await repo.buscarTrabajadorPorHuella('o1', 'h')).toBeNull();
    expect(await repo.obtenerRegistroDia('o1', 'ana', '2026-11-20')).toBeNull();
    expect(await repo.listarRegistrosDia('o1', '2026-11-20')).toEqual([]);
    expect(llamadas).toEqual([
      'INSERT OR REPLACE INTO escaneo',
      'DELETE FROM escaneo_pendiente ',
      'UPDATE escaneo_pendiente SET e',
      'INSERT OR REPLACE INTO paquete',
      'DELETE FROM trabajador_paquete',
      'INSERT INTO trabajador_paquete',
      'DELETE FROM registro_dia_local',
      'DELETE FROM registro_dia_local',
      'INSERT OR REPLACE INTO registr',
      'INSERT OR REPLACE INTO registr',
    ]);
  });
});
