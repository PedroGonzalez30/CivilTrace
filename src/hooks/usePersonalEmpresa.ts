/**
 * @archivo usePersonalEmpresa.ts
 * @proyecto Civil Trace
 * @descripcion Hook que carga los supervisores y trabajadores de la empresa.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 16/11/2026
 * @version 1.0.0
 */

// 1. Importaciones
import { useCallback, useEffect, useState } from 'react';

import { ErrorApi } from '@/conexion/clienteApi';
import { obtenerPersonalEmpresa } from '@/servicios/servicioEmpresa';
import type { PersonalEmpresa } from '@/tipos/personal';

// 3. Constantes del módulo
const MENSAJE_ERROR_GENERICO = 'No se pudo cargar el personal.';

// 4. Hook
/**
 * Carga el personal al abrirse y cada vez que se pide reintentar.
 *
 * @param tokenAcceso - Token de acceso de la sesión.
 * @returns El personal (null mientras carga o si falló), el error y "reintentar".
 */
export function usePersonalEmpresa(tokenAcceso: string) {
  const [personal, setPersonal] = useState<PersonalEmpresa | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    // Evita actualizar el estado si la pantalla se cerró antes de que respondiera la API.
    let cancelado = false;
    setError(null);

    obtenerPersonalEmpresa(tokenAcceso)
      .then((resultado) => {
        if (!cancelado) {
          setPersonal(resultado);
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

  const reintentar = useCallback(() => setIntento((previo) => previo + 1), []);

  // Quita a la persona de la lista ya cargada, sin volver a pedirla al servidor.
  const quitarPersona = useCallback((idPersona: string) => {
    setPersonal((previo) =>
      previo === null
        ? previo
        : {
            supervisores: previo.supervisores.filter((persona) => persona.id !== idPersona),
            trabajadores: previo.trabajadores.filter((persona) => persona.id !== idPersona),
          },
    );
  }, []);

  return { personal, error, reintentar, quitarPersona };
}
