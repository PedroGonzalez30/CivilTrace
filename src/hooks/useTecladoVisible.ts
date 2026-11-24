/**
 * @archivo useTecladoVisible.ts
 * @proyecto Civil Trace
 * @descripcion Indica si el teclado está abierto. La barra de navegación inferior se oculta
 *   mientras se escribe para que no suba con el teclado ni tape los campos (D-27).
 * @autor Emilio Manuel Esquivel
 * @fecha 24/11/2026
 * @version 1.0.0
 * @requerimientos D-27 (el teclado no tapa los campos)
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Creación (feature 002)
 */

// 1. Importaciones
import { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';

// 4. Hook
/**
 * @returns Verdadero mientras el teclado está en pantalla.
 */
export function useTecladoVisible(): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const alMostrar = Keyboard.addListener('keyboardDidShow', () => setVisible(true));
    const alOcultar = Keyboard.addListener('keyboardDidHide', () => setVisible(false));
    return () => {
      alMostrar.remove();
      alOcultar.remove();
    };
  }, []);

  return visible;
}
