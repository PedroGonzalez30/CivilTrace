/**
 * @archivo useObrasSupervisadas.ts
 * @proyecto Civil Trace
 * @descripcion Obras que supervisa el usuario, para escoger dónde pasar asistencia.
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos RF-27 Registrar asistencia por el supervisor
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001)
 */

// 1. Importaciones
import { useCallback, useState } from 'react';

import { ErrorApi } from '@/conexion/clienteApi';
import { listarMisObras } from '@/servicios/servicioAsistencia';
import type { ObraSupervisada } from '@/tipos/asistencia';

// 3. Constantes del módulo
const MENSAJE_ERROR = 'No se pudieron cargar tus obras';

// 4. Hook
/**
 * @param tokenAcceso - Token de la sesión del supervisor.
 * @returns Obras, estado de carga y error, y la función para recargar.
 */
export function useObrasSupervisadas(tokenAcceso: string) {
  const [obras, setObras] = useState<ObraSupervisada[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      setObras(await listarMisObras(tokenAcceso));
    } catch (falla) {
      setError(falla instanceof ErrorApi ? falla.message : MENSAJE_ERROR);
    } finally {
      setCargando(false);
    }
  }, [tokenAcceso]);

  return { obras, cargando, error, recargar };
}
