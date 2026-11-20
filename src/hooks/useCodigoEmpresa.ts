/**
 * @archivo useCodigosEmpresa.ts
 * @proyecto Civil Trace
 * @descripcion Hook que carga los códigos de acceso de la empresa y expone su estado.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 16/11/2026
 * @version 1.0.0
 */

// 1. Importaciones
import { useCallback, useEffect, useState } from 'react';

import { ErrorApi } from '@/conexion/clienteApi';
import { obtenerCodigosEmpresa, type CodigosEmpresa } from '@/servicios/servicioEmpresa';

// 2. Tipos e interfaces
interface EstadoCodigos {
  cargando: boolean;
  codigos: CodigosEmpresa | null;
  error: string | null;
}

// 3. Constantes del módulo
const MENSAJE_ERROR_GENERICO = 'No se pudieron cargar los códigos.';

// 4. Hook
/**
 * Carga los códigos de acceso mientras "activo" sea verdadero (por ejemplo, solo cuando la
 * empresa todavía no tiene obras y la pantalla los muestra).
 *
 * @param tokenAcceso - Token de acceso de la sesión.
 * @param activo - Si es falso, no se hace ninguna petición.
 * @returns Estado de la carga y una función para reintentar.
 */
export function useCodigosEmpresa(tokenAcceso: string, activo: boolean) {
  const [estado, setEstado] = useState<EstadoCodigos>({
    cargando: activo,
    codigos: null,
    error: null,
  });
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    if (!activo) {
      return;
    }

    // Evita actualizar el estado si la pantalla se cerró antes de que respondiera la API.
    let cancelado = false;
    setEstado((previo) => ({ ...previo, cargando: true, error: null }));

    obtenerCodigosEmpresa(tokenAcceso)
      .then((codigos) => {
        if (!cancelado) {
          setEstado({ cargando: false, codigos, error: null });
        }
      })
      .catch((error: unknown) => {
        if (!cancelado) {
          const mensaje = error instanceof ErrorApi ? error.message : MENSAJE_ERROR_GENERICO;
          setEstado({ cargando: false, codigos: null, error: mensaje });
        }
      });

    return () => {
      cancelado = true;
    };
  }, [tokenAcceso, activo, intento]);

  const reintentar = useCallback(() => setIntento((previo) => previo + 1), []);

  // Muestra los códigos nuevos sin volver a pedirlos a la API.
  const reemplazarCodigos = useCallback(
    (codigos: CodigosEmpresa) => setEstado({ cargando: false, codigos, error: null }),
    [],
  );

  return { ...estado, reintentar, reemplazarCodigos };
}