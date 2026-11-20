/**
 * @archivo useActividadesObra.ts
 * @proyecto Civil Trace
 * @descripcion Hook para cargar y recargar las actividades de una obra desde la API.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 20/11/2026
 * @version 1.0.0
 */

// 1. Importaciones
import { useCallback, useEffect, useState } from 'react';

import { ErrorApi } from '@/conexion/clienteApi';
import { obtenerActividadesObra } from '@/servicios/servicioActividades';
import type { ActividadResumen } from '@/tipos/actividad';

// 3. Constantes del módulo
const MENSAJE_ERROR_CARGA = 'No se pudieron cargar las actividades de la obra.';

// 4. Hook principal
export function useActividadesObra(tokenAcceso: string, idObra: string) {
  const [actividades, setActividades] = useState<ActividadResumen[] | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recarga, setRecarga] = useState(0);

  const cargar = useCallback(() => {
    setCargando(true);
    setError(null);
    setRecarga((anterior) => anterior + 1);
  }, []);

  useEffect(() => {
    let cancelado = false;
    setError(null);

    obtenerActividadesObra(tokenAcceso, idObra)
      .then((lista) => {
        if (!cancelado) {
          setActividades(lista);
        }
      })
      .catch((falla: unknown) => {
        if (!cancelado) {
          setError(falla instanceof ErrorApi ? falla.message : MENSAJE_ERROR_CARGA);
        }
      })
      .finally(() => {
        if (!cancelado) {
          setCargando(false);
        }
      });

    return () => {
      cancelado = true;
    };
  }, [tokenAcceso, idObra, recarga]);

  return {
    actividades,
    cargando,
    error,
    recargar: cargar,
  };
}
