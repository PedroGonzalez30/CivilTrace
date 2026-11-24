/**
 * @archivo ProveedorMenuDueno.tsx
 * @proyecto Civil Trace
 * @descripcion Envuelve la navegación del dueño: guarda el estado del menú de tres rayas y lo
 *              dibuja una sola vez para todas sus pantallas.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 20/11/2026
 * @version 1.0.0
 */

// 1. Importaciones
import { type ReactNode, useMemo, useState } from 'react';

import MenuDueno from '@/componentes/MenuDueno';
import { ContextoMenuDueno } from '@/hooks/useMenuDueno';

// 2. Tipos e interfaces
interface ProveedorMenuDuenoProps {
  children: ReactNode;
  onDatosEmpresa: () => void;
  onCodigoAcceso: () => void;
}

// 4. Componente principal
export default function ProveedorMenuDueno({
  children,
  onDatosEmpresa,
  onCodigoAcceso,
}: ProveedorMenuDuenoProps) {
  const [esVisible, setEsVisible] = useState(false);
  const [alturaEncabezado, setAlturaEncabezado] = useState(0);

  const valor = useMemo(
    () => ({ abrirMenu: () => setEsVisible(true), cambiarAltura: setAlturaEncabezado }),
    [],
  );

  return (
    <ContextoMenuDueno.Provider value={valor}>
      {children}
      <MenuDueno
        esVisible={esVisible}
        alturaEncabezado={alturaEncabezado}
        onCerrar={() => setEsVisible(false)}
        onDatosEmpresa={onDatosEmpresa}
        onCodigoAcceso={onCodigoAcceso}
      />
    </ContextoMenuDueno.Provider>
  );
}
