/**
 * @archivo repositorioAsistenciaLocal.ts
 * @proyecto Civil Trace
 * @descripcion Implementación SQLite de RepositorioLocal: cola de escaneos pendientes, paquete de
 *   la obra para validar QR sin conexión y registros del día conocidos por el teléfono.
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos RNF-07 Captura sin conexión (D-14), RF-27 Registrar asistencia por el
 *   supervisor
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001, data-model.md)
 */

// 1. Importaciones
import type { SQLiteDatabase } from 'expo-sqlite';

import type {
  EscaneoPendiente,
  PaqueteGuardado,
  RegistroDiaLocal,
  RepositorioLocal,
  TrabajadorGuardado,
} from '@/servicios/local/repositorioLocal';
import type { MotivoRechazo, TipoRegistro } from '@/tipos/asistencia';

// 2. Tipos e interfaces
interface FilaEscaneo {
  id_local: string;
  usuario_id: string;
  obra_id: string;
  codigo_qr: string;
  trabajador_id: string | null;
  trabajador_nombre: string | null;
  tipo: TipoRegistro;
  capturado_en: string;
  sin_conexion: number;
  latitud: number | null;
  longitud: number | null;
  estado: 'PENDIENTE' | 'RECHAZADO';
  motivo: MotivoRechazo | null;
  mensaje: string | null;
}

interface FilaTrabajador {
  obra_id: string;
  trabajador_id: string;
  nombre: string;
  oficio: string | null;
  huella_credencial: string | null;
  foto_local: string | null;
  faltas_mes: number;
}

interface FilaRegistroDia {
  obra_id: string;
  trabajador_id: string;
  fecha: string;
  tiene_entrada: number;
  tiene_salida: number;
  hora_entrada: string | null;
}

// 3. Constantes del módulo
/** Esquema versión 1 (data-model.md). Se aplica con PRAGMA user_version. */
export const ESQUEMA_V1 = `
CREATE TABLE IF NOT EXISTS escaneo_pendiente (
  id_local TEXT PRIMARY KEY NOT NULL,
  usuario_id TEXT NOT NULL,
  obra_id TEXT NOT NULL,
  codigo_qr TEXT NOT NULL,
  trabajador_id TEXT,
  trabajador_nombre TEXT,
  tipo TEXT NOT NULL,
  capturado_en TEXT NOT NULL,
  sin_conexion INTEGER NOT NULL,
  latitud REAL,
  longitud REAL,
  estado TEXT NOT NULL,
  motivo TEXT,
  mensaje TEXT
);
CREATE INDEX IF NOT EXISTS idx_escaneo_usuario_estado ON escaneo_pendiente (usuario_id, estado, capturado_en);
CREATE TABLE IF NOT EXISTS paquete_obra (
  obra_id TEXT PRIMARY KEY NOT NULL,
  usuario_id TEXT NOT NULL,
  zona_horaria TEXT NOT NULL,
  horario_json TEXT NOT NULL,
  generado_en TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS trabajador_paquete (
  obra_id TEXT NOT NULL,
  trabajador_id TEXT NOT NULL,
  nombre TEXT NOT NULL,
  oficio TEXT,
  huella_credencial TEXT,
  foto_local TEXT,
  faltas_mes INTEGER NOT NULL,
  PRIMARY KEY (obra_id, trabajador_id)
);
CREATE INDEX IF NOT EXISTS idx_trabajador_huella ON trabajador_paquete (obra_id, huella_credencial);
CREATE TABLE IF NOT EXISTS registro_dia_local (
  obra_id TEXT NOT NULL,
  trabajador_id TEXT NOT NULL,
  fecha TEXT NOT NULL,
  tiene_entrada INTEGER NOT NULL,
  tiene_salida INTEGER NOT NULL,
  hora_entrada TEXT,
  PRIMARY KEY (obra_id, trabajador_id, fecha)
);
`;

// 4. Funciones
function aEscaneo(fila: FilaEscaneo): EscaneoPendiente {
  return {
    idLocal: fila.id_local,
    usuarioId: fila.usuario_id,
    obraId: fila.obra_id,
    codigoQr: fila.codigo_qr,
    trabajadorId: fila.trabajador_id,
    trabajadorNombre: fila.trabajador_nombre,
    tipo: fila.tipo,
    capturadoEn: fila.capturado_en,
    sinConexion: fila.sin_conexion === 1,
    latitud: fila.latitud,
    longitud: fila.longitud,
    estado: fila.estado,
    motivo: fila.motivo,
    mensaje: fila.mensaje,
  };
}

function aTrabajador(fila: FilaTrabajador): TrabajadorGuardado {
  return {
    obraId: fila.obra_id,
    trabajadorId: fila.trabajador_id,
    nombre: fila.nombre,
    oficio: fila.oficio,
    huellaCredencial: fila.huella_credencial,
    fotoLocal: fila.foto_local,
    faltasMes: fila.faltas_mes,
  };
}

function aRegistro(fila: FilaRegistroDia): RegistroDiaLocal {
  return {
    obraId: fila.obra_id,
    trabajadorId: fila.trabajador_id,
    fecha: fila.fecha,
    tieneEntrada: fila.tiene_entrada === 1,
    tieneSalida: fila.tiene_salida === 1,
    horaEntrada: fila.hora_entrada,
  };
}

async function insertarRegistro(db: SQLiteDatabase, registro: RegistroDiaLocal): Promise<void> {
  await db.runAsync(
    `INSERT OR REPLACE INTO registro_dia_local
      (obra_id, trabajador_id, fecha, tiene_entrada, tiene_salida, hora_entrada)
      VALUES (?, ?, ?, ?, ?, ?)`,
    [
      registro.obraId,
      registro.trabajadorId,
      registro.fecha,
      registro.tieneEntrada ? 1 : 0,
      registro.tieneSalida ? 1 : 0,
      registro.horaEntrada,
    ],
  );
}

/**
 * Crea el repositorio sobre una base SQLite ya abierta y migrada (ver baseLocal.ts).
 *
 * @param db - Base abierta con openDatabaseAsync.
 * @returns El repositorio local.
 */
export function crearRepositorioSqlite(db: SQLiteDatabase): RepositorioLocal {
  return {
    async guardarEscaneo(e) {
      await db.runAsync(
        `INSERT OR REPLACE INTO escaneo_pendiente
          (id_local, usuario_id, obra_id, codigo_qr, trabajador_id, trabajador_nombre, tipo,
           capturado_en, sin_conexion, latitud, longitud, estado, motivo, mensaje)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          e.idLocal,
          e.usuarioId,
          e.obraId,
          e.codigoQr,
          e.trabajadorId,
          e.trabajadorNombre,
          e.tipo,
          e.capturadoEn,
          e.sinConexion ? 1 : 0,
          e.latitud,
          e.longitud,
          e.estado,
          e.motivo,
          e.mensaje,
        ],
      );
    },
    async listarPendientes(usuarioId, limite) {
      const filas = await db.getAllAsync<FilaEscaneo>(
        `SELECT * FROM escaneo_pendiente WHERE usuario_id = ? AND estado = 'PENDIENTE'
          ORDER BY capturado_en ASC ${limite ? 'LIMIT ?' : ''}`,
        limite ? [usuarioId, limite] : [usuarioId],
      );
      return filas.map(aEscaneo);
    },
    async listarRechazados(usuarioId, obraId) {
      const filas = await db.getAllAsync<FilaEscaneo>(
        `SELECT * FROM escaneo_pendiente WHERE usuario_id = ? AND estado = 'RECHAZADO'
          ${obraId ? 'AND obra_id = ?' : ''} ORDER BY capturado_en ASC`,
        obraId ? [usuarioId, obraId] : [usuarioId],
      );
      return filas.map(aEscaneo);
    },
    async contarPendientes(usuarioId, obraId) {
      const fila = await db.getFirstAsync<{ total: number }>(
        `SELECT COUNT(*) AS total FROM escaneo_pendiente WHERE usuario_id = ? AND estado = 'PENDIENTE'
          ${obraId ? 'AND obra_id = ?' : ''}`,
        obraId ? [usuarioId, obraId] : [usuarioId],
      );
      return fila?.total ?? 0;
    },
    async borrarEscaneos(ids) {
      if (ids.length === 0) {
        return;
      }
      await db.runAsync(
        `DELETE FROM escaneo_pendiente WHERE id_local IN (${ids.map(() => '?').join(', ')})`,
        ids,
      );
    },
    async marcarRechazado(idLocal, motivo, mensaje) {
      await db.runAsync(
        `UPDATE escaneo_pendiente SET estado = 'RECHAZADO', motivo = ?, mensaje = ? WHERE id_local = ?`,
        [motivo, mensaje, idLocal],
      );
    },
    async guardarPaquete(paquete, trabajadores) {
      await db.withTransactionAsync(async () => {
        await db.runAsync(
          `INSERT OR REPLACE INTO paquete_obra (obra_id, usuario_id, zona_horaria, horario_json, generado_en)
            VALUES (?, ?, ?, ?, ?)`,
          [
            paquete.obraId,
            paquete.usuarioId,
            paquete.zonaHoraria,
            JSON.stringify(paquete.horario),
            paquete.generadoEn,
          ],
        );
        await db.runAsync('DELETE FROM trabajador_paquete WHERE obra_id = ?', [paquete.obraId]);
        for (const t of trabajadores) {
          await db.runAsync(
            `INSERT INTO trabajador_paquete
              (obra_id, trabajador_id, nombre, oficio, huella_credencial, foto_local, faltas_mes)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              t.obraId,
              t.trabajadorId,
              t.nombre,
              t.oficio,
              t.huellaCredencial,
              t.fotoLocal,
              t.faltasMes,
            ],
          );
        }
      });
    },
    async obtenerPaquete(obraId) {
      const fila = await db.getFirstAsync<{
        obra_id: string;
        usuario_id: string;
        zona_horaria: string;
        horario_json: string;
        generado_en: string;
      }>('SELECT * FROM paquete_obra WHERE obra_id = ?', [obraId]);
      if (!fila) {
        return null;
      }
      return {
        obraId: fila.obra_id,
        usuarioId: fila.usuario_id,
        zonaHoraria: fila.zona_horaria,
        horario: JSON.parse(fila.horario_json) as PaqueteGuardado['horario'],
        generadoEn: fila.generado_en,
      };
    },
    async listarTrabajadoresPaquete(obraId) {
      const filas = await db.getAllAsync<FilaTrabajador>(
        'SELECT * FROM trabajador_paquete WHERE obra_id = ? ORDER BY nombre ASC',
        [obraId],
      );
      return filas.map(aTrabajador);
    },
    async buscarTrabajadorPorHuella(obraId, huella) {
      const fila = await db.getFirstAsync<FilaTrabajador>(
        'SELECT * FROM trabajador_paquete WHERE obra_id = ? AND huella_credencial = ?',
        [obraId, huella],
      );
      return fila ? aTrabajador(fila) : null;
    },
    async reemplazarRegistrosDia(obraId, fecha, registros) {
      await db.withTransactionAsync(async () => {
        // Los días anteriores ya no sirven para decidir entrada o salida.
        await db.runAsync('DELETE FROM registro_dia_local WHERE obra_id = ? AND fecha <> ?', [
          obraId,
          fecha,
        ]);
        await db.runAsync('DELETE FROM registro_dia_local WHERE obra_id = ? AND fecha = ?', [
          obraId,
          fecha,
        ]);
        for (const registro of registros) {
          await insertarRegistro(db, registro);
        }
      });
    },
    async obtenerRegistroDia(obraId, trabajadorId, fecha) {
      const fila = await db.getFirstAsync<FilaRegistroDia>(
        'SELECT * FROM registro_dia_local WHERE obra_id = ? AND trabajador_id = ? AND fecha = ?',
        [obraId, trabajadorId, fecha],
      );
      return fila ? aRegistro(fila) : null;
    },
    async guardarRegistroDia(registro) {
      await insertarRegistro(db, registro);
    },
    async listarRegistrosDia(obraId, fecha) {
      const filas = await db.getAllAsync<FilaRegistroDia>(
        'SELECT * FROM registro_dia_local WHERE obra_id = ? AND fecha = ?',
        [obraId, fecha],
      );
      return filas.map(aRegistro);
    },
  };
}
