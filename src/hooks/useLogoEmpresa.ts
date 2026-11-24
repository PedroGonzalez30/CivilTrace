/**
 * @archivo useLogoEmpresa.ts
 * @proyecto Civil Trace
 * @descripcion Contexto con el logotipo de la empresa de la sesión, para mostrarlo a la derecha
 *   del encabezado en los tres roles (D-25).
 * @autor Emilio Manuel Esquivel
 * @fecha 24/11/2026
 * @version 1.0.0
 * @requerimientos D-25 (logotipo de la empresa en el encabezado)
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Creación (feature 002)
 */

// 1. Importaciones
import { createContext, useContext } from 'react';

// 2. Tipos e interfaces
export interface ContextoLogoEmpresaValor {
  // Imagen lista para mostrarse (url de datos), o null si la empresa no tiene logotipo.
  uri: string | null;
  // Vuelve a descargarlo; lo usa Datos de la empresa al cambiar el logotipo.
  recargar: () => void;
}

// 4. Contexto y hook
export const ContextoLogoEmpresa = createContext<ContextoLogoEmpresaValor | null>(null);

/**
 * @returns El logotipo si se llama con una sesión abierta; fuera de ella, null.
 */
export function useLogoEmpresa(): ContextoLogoEmpresaValor | null {
  return useContext(ContextoLogoEmpresa);
}
