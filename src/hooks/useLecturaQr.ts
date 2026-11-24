/**
 * @archivo useLecturaQr.ts
 * @proyecto Civil Trace
 * @descripcion Datos de la lectura de QR de una obra: horario y resumen del día (del servidor o,
 *   sin conexión, de lo guardado en el teléfono), cuántos escaneos faltan por enviar y cuántos
 *   rechazó el servidor.
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos RF-27 Registrar asistencia por el supervisor, RNF-07 Captura sin conexión
 *   (D-14)
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001)
 */

// 1. Importaciones
import { useCallback, useEffect, useState } from 'react';

import { ErrorApi, ErrorSinConexion } from '@/conexion/clienteApi';
import { obtenerRepositorioLocal, type PaqueteGuardado } from '@/servicios/local/repositorioLocal';
import { actualizarPaquete } from '@/servicios/local/servicioPaqueteObra';
import { suscribirseACambios } from '@/servicios/local/servicioSincronizacionAsistencia';
import { obtenerResumenDia } from '@/servicios/servicioAsistencia';
import type { SesionAutenticacion } from '@/tipos/autenticacion';
import type { HorarioDelDia, ResumenDia } from '@/tipos/asistencia';
import { obtenerFechaLocal, sumarMinutosAHora } from '@/utilidades/formatoHoras';

// 2. Tipos e interfaces
export interface EstadoLecturaQr {
  resumen: ResumenDia | null;
  zonaHoraria: string;
  generadoEn: string | null;
  sinConexion: boolean;
  pendientes: number;
  rechazados: number;
  cargando: boolean;
  error: string | null;
}

// 3. Constantes del módulo
const ZONA_POR_DEFECTO = 'America/Tijuana';
const MENSAJE_ERROR = 'No se pudo cargar la asistencia de la obra';

// 4. Funciones auxiliares
function horaLocalActual(zona: string): string {
  const fecha = new Date();
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: zona,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(fecha);
  const valor = (tipo: string) => partes.find((parte) => parte.type === tipo)?.value ?? '00';
  return `${valor('hour')}:${valor('minute')}`;
}

// Arma el resumen del día con lo guardado en el teléfono cuando no hay conexión.
async function construirResumenLocal(
  obraId: string,
  paquete: PaqueteGuardado,
): Promise<ResumenDia> {
  const repositorio = await obtenerRepositorioLocal();
  const fecha = obtenerFechaLocal(new Date(), paquete.zonaHoraria);
  const [trabajadores, registros] = await Promise.all([
    repositorio.listarTrabajadoresPaquete(obraId),
    repositorio.listarRegistrosDia(obraId, fecha),
  ]);
  const base = paquete.horario.excepcionHoy ?? paquete.horario.general;
  const diaSemana = new Date(`${fecha}T12:00:00Z`).getUTCDay();
  const horario: HorarioDelDia | null = base
    ? {
        fecha,
        horaEntrada: base.horaEntrada,
        horaSalida: base.horaSalida,
        toleranciaMinutos: base.toleranciaMinutos,
        esDiaLaborable: base.diasLaborales.includes(diaSemana),
        esExcepcion: paquete.horario.excepcionHoy !== null,
      }
    : null;
  const ahora = horaLocalActual(paquete.zonaHoraria);
  return {
    fecha,
    horario,
    estadoEntrada:
      horario && ahora > sumarMinutosAHora(horario.horaEntrada, horario.toleranciaMinutos)
        ? 'FINALIZADO'
        : 'PENDIENTE',
    estadoSalida: horario && ahora > horario.horaSalida ? 'FINALIZADO' : 'PENDIENTE',
    trabajadores: trabajadores.map((trabajador) => {
      const registro = registros.find((r) => r.trabajadorId === trabajador.trabajadorId);
      return {
        id: trabajador.trabajadorId,
        nombre: trabajador.nombre,
        oficio: trabajador.oficio,
        entrada: registro?.horaEntrada ?? null,
        salida: null,
        tipoJornada: null,
      };
    }),
  };
}

// 5. Hook
/**
 * @param sesion - Sesión del supervisor.
 * @param obraId - Obra elegida.
 */
export function useLecturaQr(sesion: SesionAutenticacion, obraId: string) {
  const [estado, setEstado] = useState<EstadoLecturaQr>({
    resumen: null,
    zonaHoraria: ZONA_POR_DEFECTO,
    generadoEn: null,
    sinConexion: false,
    pendientes: 0,
    rechazados: 0,
    cargando: true,
    error: null,
  });
  const usuarioId = sesion.usuario.id;

  const actualizarConteos = useCallback(async () => {
    const repositorio = await obtenerRepositorioLocal();
    const [pendientes, rechazados] = await Promise.all([
      repositorio.contarPendientes(usuarioId, obraId),
      repositorio.listarRechazados(usuarioId, obraId),
    ]);
    setEstado((previo) => ({ ...previo, pendientes, rechazados: rechazados.length }));
  }, [obraId, usuarioId]);

  const recargar = useCallback(async () => {
    setEstado((previo) => ({ ...previo, cargando: true, error: null }));
    try {
      const { paquete, resumen } = await actualizarPaquete(sesion, obraId);
      setEstado((previo) => ({
        ...previo,
        resumen,
        zonaHoraria: paquete.zonaHoraria,
        generadoEn: paquete.generadoEn,
        sinConexion: false,
        cargando: false,
      }));
    } catch (error) {
      if (error instanceof ErrorSinConexion) {
        const paquete = await (await obtenerRepositorioLocal()).obtenerPaquete(obraId);
        const resumen = paquete ? await construirResumenLocal(obraId, paquete) : null;
        setEstado((previo) => ({
          ...previo,
          resumen,
          zonaHoraria: paquete?.zonaHoraria ?? previo.zonaHoraria,
          generadoEn: paquete?.generadoEn ?? null,
          sinConexion: true,
          cargando: false,
        }));
      } else {
        setEstado((previo) => ({
          ...previo,
          cargando: false,
          error: error instanceof ErrorApi ? error.message : MENSAJE_ERROR,
        }));
      }
    }
    await actualizarConteos();
  }, [actualizarConteos, obraId, sesion]);

  // Cuando la sincronización envía o rechaza algo, se actualizan avisos y resumen.
  useEffect(
    () =>
      suscribirseACambios(() => {
        void actualizarConteos();
        void obtenerResumenDia(sesion.token, obraId)
          .then((resumen) => setEstado((previo) => ({ ...previo, resumen, sinConexion: false })))
          .catch(() => undefined);
      }),
    [actualizarConteos, obraId, sesion.token],
  );

  return { ...estado, recargar };
}
