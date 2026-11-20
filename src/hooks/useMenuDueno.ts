/**
 * @archivo useMenuDueno.ts
 * @proyecto Civil Trace
 * @descripcion Contexto del menú de tres rayas. Solo existe dentro de la navegación del dueño,
 *              así que el encabezado lo usa para saber si debe mostrar el botón.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 20/11/2026
 * @version 1.0.0
 */

// 1. Importaciones
import { createContext, useContext } from 'react';

// 2. Tipos e interfaces
export interface ContextoMenuDuenoValor {
  abrirMenu: () => void;
  cambiarAltura: (altura: number) => void;
}

// 4. Contexto y hook
export const ContextoMenuDueno = createContext<ContextoMenuDuenoValor | null>(null);

/**
 * @returns El control del menú si se llama dentro de la navegación del dueño; si no, null.
 */
export function useMenuDueno(): ContextoMenuDuenoValor | null {
  return useContext(ContextoMenuDueno);
}