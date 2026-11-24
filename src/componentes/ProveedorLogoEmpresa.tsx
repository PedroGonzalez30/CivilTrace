/**
 * @archivo ProveedorLogoEmpresa.tsx
 * @proyecto Civil Trace
 * @descripcion Descarga una vez el logotipo de la empresa de la sesión y lo comparte con el
 *   encabezado de todas las pantallas (D-25). Sin logotipo o sin conexión no muestra nada.
 * @autor Emilio Manuel Esquivel
 * @fecha 24/11/2026
 * @version 1.0.0
 * @requerimientos D-25 (logotipo de la empresa en el encabezado)
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Creación (feature 002)
 */

// 1. Importaciones
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import { ContextoLogoEmpresa } from '@/hooks/useLogoEmpresa';
import { descargarLogoEmpresa } from '@/servicios/servicioEmpresa';

// 2. Tipos e interfaces
interface ProveedorLogoEmpresaProps {
  tokenAcceso: string;
  children: ReactNode;
}

// 4. Componente principal
export default function ProveedorLogoEmpresa({ tokenAcceso, children }: ProveedorLogoEmpresaProps) {
  const [uri, setUri] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelado = false;
    descargarLogoEmpresa(tokenAcceso)
      .then((datos) => {
        if (!cancelado) {
          setUri(datos);
        }
      })
      .catch(() => {
        // Sin logotipo (404) o sin conexión: el encabezado se queda solo con el nombre.
        if (!cancelado) {
          setUri(null);
        }
      });
    return () => {
      cancelado = true;
    };
  }, [tokenAcceso, version]);

  const recargar = useCallback(() => setVersion((anterior) => anterior + 1), []);
  const valor = useMemo(() => ({ uri, recargar }), [uri, recargar]);

  return <ContextoLogoEmpresa.Provider value={valor}>{children}</ContextoLogoEmpresa.Provider>;
}
