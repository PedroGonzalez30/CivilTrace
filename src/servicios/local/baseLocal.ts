/**
 * @archivo baseLocal.ts
 * @proyecto Civil Trace
 * @descripcion Abre la base SQLite local (civiltrace.db), activa WAL, aplica las migraciones con
 *   PRAGMA user_version y configura el repositorio local que usa asistencia.
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos RNF-07 Captura sin conexión (D-14)
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001, research R-01)
 */

// 1. Importaciones
import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

import { crearRepositorioSqlite, ESQUEMA_V1 } from '@/servicios/local/repositorioAsistenciaLocal';
import { configurarRepositorioLocal } from '@/servicios/local/repositorioLocal';

// 3. Constantes del módulo
const NOMBRE_BASE = 'civiltrace.db';
const VERSION_ESQUEMA = 1;

// 4. Funciones
/**
 * Aplica las migraciones pendientes. Cada versión nueva agrega su bloque sin tocar los anteriores.
 *
 * @param db - Base abierta.
 */
export async function migrarBaseLocal(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA journal_mode = WAL;');
  const fila = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const versionActual = fila?.user_version ?? 0;
  if (versionActual < 1) {
    await db.execAsync(ESQUEMA_V1);
  }
  if (versionActual < VERSION_ESQUEMA) {
    await db.execAsync(`PRAGMA user_version = ${VERSION_ESQUEMA}`);
  }
}

/**
 * Configura el repositorio local de la app sobre SQLite. La base se abre la primera vez que
 * alguien la necesita. Se llama una vez al arrancar la app.
 */
export function configurarBaseLocal(): void {
  configurarRepositorioLocal(async () => {
    const db = await openDatabaseAsync(NOMBRE_BASE);
    await migrarBaseLocal(db);
    return crearRepositorioSqlite(db);
  });
}
