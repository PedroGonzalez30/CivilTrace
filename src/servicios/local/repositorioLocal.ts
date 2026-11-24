/**
 * @archivo repositorioLocal.ts
 * @proyecto Civil Trace
 * @descripcion Interfaz del almacenamiento local de asistencia (cola de escaneos, paquete de la
 *   obra y registros del día) y punto único para obtenerlo. La implementación real usa SQLite;
 *   las pruebas usan una en memoria.
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos RNF-07 Captura sin conexión (D-14), RF-27 Registrar asistencia por el
 *   supervisor
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001, data-model.md)
 */

// 1. Importaciones
import type { MotivoRechazo, PaqueteSinConexion, TipoRegistro } from '@/tipos/asistencia';

// 2. Tipos e interfaces
export type EstadoEscaneoLocal = 'PENDIENTE' | 'RECHAZADO';

export interface EscaneoPendiente {
  idLocal: string;
  usuarioId: string;
  obraId: string;
  codigoQr: string;
  trabajadorId: string | null;
  trabajadorNombre: string | null;
  tipo: TipoRegistro;
  capturadoEn: string;
  sinConexion: boolean;
  latitud: number | null;
  longitud: number | null;
  estado: EstadoEscaneoLocal;
  motivo: MotivoRechazo | null;
  mensaje: string | null;
}

export interface PaqueteGuardado {
  obraId: string;
  usuarioId: string;
  zonaHoraria: string;
  horario: PaqueteSinConexion['horario'];
  generadoEn: string;
}

export interface TrabajadorGuardado {
  obraId: string;
  trabajadorId: string;
  nombre: string;
  oficio: string | null;
  huellaCredencial: string | null;
  fotoLocal: string | null;
  faltasMes: number;
}

export interface RegistroDiaLocal {
  obraId: string;
  trabajadorId: string;
  fecha: string;
  tieneEntrada: boolean;
  tieneSalida: boolean;
  horaEntrada: string | null;
}

export interface RepositorioLocal {
  guardarEscaneo(escaneo: EscaneoPendiente): Promise<void>;
  /** Pendientes del usuario en orden de captura (los más viejos primero). */
  listarPendientes(usuarioId: string, limite?: number): Promise<EscaneoPendiente[]>;
  listarRechazados(usuarioId: string, obraId?: string): Promise<EscaneoPendiente[]>;
  contarPendientes(usuarioId: string, obraId?: string): Promise<number>;
  borrarEscaneos(idsLocales: string[]): Promise<void>;
  marcarRechazado(
    idLocal: string,
    motivo: MotivoRechazo | null,
    mensaje: string | null,
  ): Promise<void>;
  /** Reemplaza el paquete de la obra y sus trabajadores en una sola operación. */
  guardarPaquete(paquete: PaqueteGuardado, trabajadores: TrabajadorGuardado[]): Promise<void>;
  obtenerPaquete(obraId: string): Promise<PaqueteGuardado | null>;
  listarTrabajadoresPaquete(obraId: string): Promise<TrabajadorGuardado[]>;
  buscarTrabajadorPorHuella(obraId: string, huella: string): Promise<TrabajadorGuardado | null>;
  /** Reemplaza los registros conocidos de un día de la obra (vienen del servidor). */
  reemplazarRegistrosDia(
    obraId: string,
    fecha: string,
    registros: RegistroDiaLocal[],
  ): Promise<void>;
  obtenerRegistroDia(
    obraId: string,
    trabajadorId: string,
    fecha: string,
  ): Promise<RegistroDiaLocal | null>;
  guardarRegistroDia(registro: RegistroDiaLocal): Promise<void>;
  listarRegistrosDia(obraId: string, fecha: string): Promise<RegistroDiaLocal[]>;
}

// 3. Constantes del módulo
let repositorioActual: RepositorioLocal | null = null;
let cargador: (() => Promise<RepositorioLocal>) | null = null;

// 4. Funciones
/**
 * Registra cómo crear el repositorio (la app usa SQLite). Se llama una vez al arrancar.
 */
export function configurarRepositorioLocal(crear: () => Promise<RepositorioLocal>): void {
  cargador = crear;
  repositorioActual = null;
}

/**
 * Usa un repositorio ya creado; lo usan las pruebas con la versión en memoria.
 */
export function establecerRepositorioLocal(repositorio: RepositorioLocal | null): void {
  repositorioActual = repositorio;
}

/**
 * Devuelve el repositorio local, creándolo la primera vez.
 *
 * @throws Error si nadie lo configuró.
 */
export async function obtenerRepositorioLocal(): Promise<RepositorioLocal> {
  if (repositorioActual) {
    return repositorioActual;
  }
  if (!cargador) {
    throw new Error('El almacenamiento local no está configurado');
  }
  repositorioActual = await cargador();
  return repositorioActual;
}
