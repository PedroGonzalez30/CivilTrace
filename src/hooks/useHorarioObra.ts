/**
 * @archivo useHorarioObra.ts
 * @proyecto Civil Trace
 * @descripcion Estado del formulario del horario de la obra: carga el horario guardado (o los
 *   valores por defecto), valida y guarda.
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos D-06, RF-60 Registrar retardo o salida anticipada
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001)
 */

// 1. Importaciones
import { useCallback, useEffect, useState } from 'react';

import { ErrorApi, ErrorSinConexion } from '@/conexion/clienteApi';
import { HORARIO_POR_DEFECTO, MENSAJES_ASISTENCIA } from '@/constantes/textosAsistencia';
import { guardarHorario, obtenerHorario } from '@/servicios/servicioHorario';
import type { DatosGuardarHorario } from '@/tipos/asistencia';

// 3. Constantes del módulo
const MENSAJE_ERROR = 'No se pudo guardar el horario';

// 4. Hook
/**
 * @param tokenAcceso - Token de la sesión.
 * @param obraId - Obra.
 */
export function useHorarioObra(tokenAcceso: string, obraId: string) {
  const [valores, setValores] = useState<DatosGuardarHorario>({
    ...HORARIO_POR_DEFECTO,
    alcance: 'TODOS_LOS_DIAS',
  });
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let vigente = true;
    obtenerHorario(tokenAcceso, obraId)
      .then((horario) => {
        if (vigente && horario.general) {
          const { horaEntrada, horaSalida, toleranciaMinutos, diasLaborales } = horario.general;
          setValores((previo) => ({
            ...previo,
            horaEntrada,
            horaSalida,
            toleranciaMinutos,
            diasLaborales,
          }));
        }
      })
      .catch(() => undefined) // Sin horario guardado o sin red: se muestran los valores por defecto.
      .finally(() => vigente && setCargando(false));
    return () => {
      vigente = false;
    };
  }, [obraId, tokenAcceso]);

  const cambiar = useCallback((cambios: Partial<DatosGuardarHorario>) => {
    setValores((previo) => ({ ...previo, ...cambios }));
    setError(null);
  }, []);

  /** @returns true si se guardó. */
  const guardar = useCallback(async (): Promise<boolean> => {
    if (valores.horaSalida <= valores.horaEntrada) {
      setError(MENSAJES_ASISTENCIA.salidaAntesEntrada);
      return false;
    }
    if (valores.diasLaborales.length === 0) {
      setError(MENSAJES_ASISTENCIA.sinDiasLaborales);
      return false;
    }
    setGuardando(true);
    try {
      await guardarHorario(tokenAcceso, obraId, valores);
      return true;
    } catch (falla) {
      setError(
        falla instanceof ErrorSinConexion
          ? MENSAJES_ASISTENCIA.sinConexionHorario
          : falla instanceof ErrorApi
            ? falla.message
            : MENSAJE_ERROR,
      );
      return false;
    } finally {
      setGuardando(false);
    }
  }, [obraId, tokenAcceso, valores]);

  return { valores, cargando, guardando, error, cambiar, guardar };
}
