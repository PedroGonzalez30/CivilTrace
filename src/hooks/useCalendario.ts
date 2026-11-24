/**
 * @archivo useCalendario.ts
 * @proyecto Civil Trace
 * @descripcion Calendario del mes de un trabajador y el detalle del día que se toque.
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos RF-56 Mostrar días con descuento, RF-58 Mostrar calendario de asistencia
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001)
 */

// 1. Importaciones
import { useCallback, useEffect, useState } from 'react';

import { ErrorApi, ErrorSinConexion } from '@/conexion/clienteApi';
import { MENSAJES_ASISTENCIA } from '@/constantes/textosAsistencia';
import { obtenerCalendario } from '@/servicios/servicioCalendario';
import { obtenerDetalleDia } from '@/servicios/servicioDetallesAsistencia';
import type { CalendarioMes, DetalleDia, DiaCalendario } from '@/tipos/asistencia';

// 3. Constantes del módulo
const MENSAJE_ERROR = 'No se pudo cargar el calendario';

function mensajeDe(falla: unknown): string {
  if (falla instanceof ErrorSinConexion) {
    return MENSAJES_ASISTENCIA.sinConexionCalendario;
  }
  return falla instanceof ErrorApi ? falla.message : MENSAJE_ERROR;
}

// 4. Hook
/**
 * @param mesInicial - YYYY-MM con el que abre.
 * @param obraId - Opcional: solo esa obra (calendario del supervisor).
 */
export function useCalendario(
  tokenAcceso: string,
  trabajadorId: string,
  mesInicial: string,
  obraId?: string,
) {
  const [mes, setMes] = useState(mesInicial);
  const [calendario, setCalendario] = useState<CalendarioMes | null>(null);
  const [detalle, setDetalle] = useState<DetalleDia | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let vigente = true;
    setCargando(true);
    setError(null);
    obtenerCalendario(tokenAcceso, trabajadorId, mes, obraId)
      .then((datos) => vigente && setCalendario(datos))
      .catch((falla: unknown) => vigente && setError(mensajeDe(falla)))
      .finally(() => vigente && setCargando(false));
    return () => {
      vigente = false;
    };
  }, [mes, obraId, tokenAcceso, trabajadorId]);

  const abrirDia = useCallback(
    async (dia: DiaCalendario) => {
      try {
        setDetalle(await obtenerDetalleDia(tokenAcceso, dia.obraId, trabajadorId, dia.fecha));
      } catch (falla) {
        setError(mensajeDe(falla));
      }
    },
    [tokenAcceso, trabajadorId],
  );

  return {
    mes,
    cambiarMes: setMes,
    calendario,
    detalle,
    cerrarDia: () => setDetalle(null),
    abrirDia,
    cargando,
    error,
  };
}
