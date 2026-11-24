/**
 * @archivo repositorioEnMemoria.ts
 * @proyecto Civil Trace
 * @descripcion Implementación en memoria de RepositorioLocal para las pruebas (SQLite no existe
 *   en Jest). Sigue las mismas reglas que la versión SQLite.
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos Constitución III (pruebas primero), RNF-07 Captura sin conexión
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001)
 */

// 1. Importaciones
import type {
  EscaneoPendiente,
  PaqueteGuardado,
  RegistroDiaLocal,
  RepositorioLocal,
  TrabajadorGuardado,
} from '@/servicios/local/repositorioLocal';

// 4. Implementación
export function crearRepositorioEnMemoria(): RepositorioLocal & {
  escaneos: Map<string, EscaneoPendiente>;
} {
  const escaneos = new Map<string, EscaneoPendiente>();
  const paquetes = new Map<string, PaqueteGuardado>();
  let trabajadores: TrabajadorGuardado[] = [];
  let registros: RegistroDiaLocal[] = [];
  const porCaptura = (a: EscaneoPendiente, b: EscaneoPendiente) =>
    a.capturadoEn.localeCompare(b.capturadoEn);
  const mismaClave = (r: RegistroDiaLocal, obraId: string, trabajadorId: string, fecha: string) =>
    r.obraId === obraId && r.trabajadorId === trabajadorId && r.fecha === fecha;

  return {
    escaneos,
    async guardarEscaneo(escaneo) {
      escaneos.set(escaneo.idLocal, { ...escaneo });
    },
    async listarPendientes(usuarioId, limite) {
      const lista = [...escaneos.values()]
        .filter((e) => e.usuarioId === usuarioId && e.estado === 'PENDIENTE')
        .sort(porCaptura);
      return limite ? lista.slice(0, limite) : lista;
    },
    async listarRechazados(usuarioId, obraId) {
      return [...escaneos.values()]
        .filter((e) => e.usuarioId === usuarioId && e.estado === 'RECHAZADO')
        .filter((e) => !obraId || e.obraId === obraId)
        .sort(porCaptura);
    },
    async contarPendientes(usuarioId, obraId) {
      return [...escaneos.values()].filter(
        (e) =>
          e.usuarioId === usuarioId && e.estado === 'PENDIENTE' && (!obraId || e.obraId === obraId),
      ).length;
    },
    async borrarEscaneos(ids) {
      ids.forEach((id) => escaneos.delete(id));
    },
    async marcarRechazado(idLocal, motivo, mensaje) {
      const escaneo = escaneos.get(idLocal);
      if (escaneo) {
        escaneos.set(idLocal, { ...escaneo, estado: 'RECHAZADO', motivo, mensaje });
      }
    },
    async guardarPaquete(paquete, nuevos) {
      paquetes.set(paquete.obraId, { ...paquete });
      trabajadores = [...trabajadores.filter((t) => t.obraId !== paquete.obraId), ...nuevos];
    },
    async obtenerPaquete(obraId) {
      return paquetes.get(obraId) ?? null;
    },
    async listarTrabajadoresPaquete(obraId) {
      return trabajadores.filter((t) => t.obraId === obraId);
    },
    async buscarTrabajadorPorHuella(obraId, huella) {
      return trabajadores.find((t) => t.obraId === obraId && t.huellaCredencial === huella) ?? null;
    },
    async reemplazarRegistrosDia(obraId, fecha, nuevos) {
      registros = [
        ...registros.filter((r) => !(r.obraId === obraId && r.fecha === fecha)),
        ...nuevos,
      ];
    },
    async obtenerRegistroDia(obraId, trabajadorId, fecha) {
      return registros.find((r) => mismaClave(r, obraId, trabajadorId, fecha)) ?? null;
    },
    async guardarRegistroDia(registro) {
      registros = [
        ...registros.filter(
          (r) => !mismaClave(r, registro.obraId, registro.trabajadorId, registro.fecha),
        ),
        { ...registro },
      ];
    },
    async listarRegistrosDia(obraId, fecha) {
      return registros.filter((r) => r.obraId === obraId && r.fecha === fecha);
    },
  };
}
