/**
 * @archivo IconoFlecha.tsx
 * @proyecto Civil Trace
 * @descripcion Flecha que apunta hacia arriba o hacia abajo, usada en listas desplegables.
 * @autor POR_COMPLETAR
 * @fecha POR_COMPLETAR
 * @version 1.0.0
 */

// 1. Importaciones
import Svg, { Path } from 'react-native-svg';

import { COLORES } from '@/constantes/colores';
import { TAMANOS } from '@/constantes/tema';

// 2. Tipos e interfaces
interface IconoFlechaProps {
  direccion: 'arriba' | 'abajo';
}

// 4. Componente principal
export default function IconoFlecha({ direccion }: IconoFlechaProps) {
  return (
    <Svg
      width={TAMANOS.flecha}
      height={TAMANOS.flecha}
      viewBox="0 0 20 20"
      fill="none"
      style={{ transform: [{ rotate: direccion === 'abajo' ? '180deg' : '0deg' }] }}
    >
      <Path
        d="M5 12.5L10 7.5L15 12.5"
        stroke={COLORES.textoAtenuado}
        strokeWidth={1.67}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
