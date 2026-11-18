/**
 * @archivo useObras.ts
 * @proyecto Civil Trace
 * @descripcion Hook que carga las obras de la empresa y expone su estado.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 16/11/2026
 * @version 1.0.0
 * @requerimientos RF-44 Mostrar obras
 */

// 1. Importaciones
import { useCallback, useEffect, useState } from 'react';

import { ErrorApi } from '@/conexion/clienteApi';
import { obtenerObras } from '@/servicios/servicioObras';
import type { Obra } from '@/tipos/obra';

// 3. Constantes del módulo
const MENSAJE_ERROR_GENERICO = 'No se pudieron cargar las obras.';

// 4. Hook
/**
 * Carga las obras al abrirse y cada vez que se pide recargar.
 *
 * @param tokenAcceso - Token de acceso de la sesión.
 * @returns Las obras (null mientras no se han cargado nunca), el error y "recargar".
 */
export function useObras(tokenAcceso: string) {
  const [obras, setObras] = useState<Obra[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    // Evita actualizar el estado si la pantalla se cerró antes de que respondiera la API.
    let cancelado = false;
    setError(null);

    obtenerObras(tokenAcceso)
      .then((resultado) => {
        if (!cancelado) {
          setObras(resultado);
        }
      })
      .catch((falla: unknown) => {
        if (!cancelado) {
          setError(falla instanceof ErrorApi ? falla.message : MENSAJE_ERROR_GENERICO);
        }
      });

    return () => {
      cancelado = true;
    };
  }, [tokenAcceso, intento]);

  const recargar = useCallback(() => setIntento((previo) => previo + 1), []);

  return { obras, error, recargar };
}