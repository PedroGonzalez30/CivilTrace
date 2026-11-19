/**
 * @archivo Iconos.tsx
 * @proyecto Civil Trace
 * @descripcion Colección de iconos SVG de la aplicación (menú, inicio, usuario, edificio, etc.).
 * @autor POR_COMPLETAR
 * @fecha POR_COMPLETAR
 * @version 1.0.0
 */

// 1. Importaciones
import Svg, { Circle, Path, Polyline, Rect } from 'react-native-svg';

import { COLORES } from '@/constantes/colores';

// 2. Tipos e interfaces
export interface IconoProps {
  tamano?: number;
  color?: string;
}

// 3. Constantes del módulo
const PROPIEDADES_TRAZO = {
  fill: 'none',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

const RUTA_EDIFICIO =
  'M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01' +
  'M8 14h.01M12 14h.01M16 14h.01';

// 4. Componentes
export function IconoMenu() {
  return (
    <Svg width={31} height={30} viewBox="0 0 31 30">
      <Rect width={31} height={30} rx={8} fill={COLORES.superficie} />
      <Rect x={7} y={8} width={17} height={3} rx={1.5} fill={COLORES.textoTenue} />
      <Rect x={7} y={13.5} width={17} height={3} rx={1.5} fill={COLORES.textoTenue} />
      <Rect x={7} y={19} width={17} height={3} rx={1.5} fill={COLORES.textoTenue} />
    </Svg>
  );
}

export function IconoInicio({ tamano = 20, color = COLORES.marca }: IconoProps) {
  return (
    <Svg width={tamano} height={tamano} viewBox="0 0 24 24" stroke={color} {...PROPIEDADES_TRAZO}>
      <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <Polyline points="9 22 9 12 15 12 15 22" />
    </Svg>
  );
}

export function IconoTarjetaId({ tamano = 25, color = COLORES.textoTenue }: IconoProps) {
  return (
    <Svg width={tamano} height={tamano} viewBox="0 0 24 24" stroke={color} {...PROPIEDADES_TRAZO}>
      <Rect x={2} y={4} width={20} height={16} rx={2} />
      <Circle cx={9} cy={11} r={2} />
      <Path d="M15 9h3M15 13h3M6 17a3 3 0 0 1 6 0" />
    </Svg>
  );
}

export function IconoUsuario({ tamano = 17, color = COLORES.textoTenue }: IconoProps) {
  return (
    <Svg width={tamano} height={tamano} viewBox="0 0 24 24" fill={color}>
      <Circle cx={12} cy={7} r={5} />
      <Path d="M3 22a9 9 0 0 1 18 0z" />
    </Svg>
  );
}

export function IconoEdificio({ tamano = 20, color = COLORES.textoTenue }: IconoProps) {
  return (
    <Svg width={tamano} height={tamano} viewBox="0 0 24 24" stroke={color} {...PROPIEDADES_TRAZO}>
      <Rect x={4} y={2} width={16} height={20} rx={2} />
      <Path d={RUTA_EDIFICIO} />
    </Svg>
  );
}

export function IconoMas({ tamano = 18, color = COLORES.superficie }: IconoProps) {
  return (
    <Svg width={tamano} height={tamano} viewBox="0 0 24 24" stroke={color} {...PROPIEDADES_TRAZO}>
      <Path d="M5 12h14M12 5v14" />
    </Svg>
  );
}

export function IconoArchivoTexto({ tamano = 18, color = COLORES.superficie }: IconoProps) {
  return (
    <Svg width={tamano} height={tamano} viewBox="0 0 24 24" stroke={color} {...PROPIEDADES_TRAZO}>
      <Path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <Polyline points="14 2 14 8 20 8" />
      <Path d="M16 13H8M16 17H8M10 9H8" />
    </Svg>
  );
}

export function IconoFlechaIzquierda({ tamano = 20, color = COLORES.textoAtenuado }: IconoProps) {
  return (
    <Svg width={tamano} height={tamano} viewBox="0 0 24 24" stroke={color} {...PROPIEDADES_TRAZO}>
      <Polyline points="15 18 9 12 15 6" />
    </Svg>
  );
}

export function IconoCheck({ tamano = 14, color = COLORES.superficie }: IconoProps) {
  return (
    <Svg width={tamano} height={tamano} viewBox="0 0 24 24" stroke={color} {...PROPIEDADES_TRAZO}>
      <Polyline points="20 6 9 17 4 12" />
    </Svg>
  );
}

export function IconoUsuarios({ tamano = 20, color = COLORES.marca }: IconoProps) {
  return (
    <Svg width={tamano} height={tamano} viewBox="0 0 24 24" stroke={color} {...PROPIEDADES_TRAZO}>
      <Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <Circle cx={9} cy={7} r={4} />
      <Path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </Svg>
  );
}

export function IconoPapelera({ tamano = 20, color = COLORES.error }: IconoProps) {
  return (
    <Svg width={tamano} height={tamano} viewBox="0 0 24 24" stroke={color} {...PROPIEDADES_TRAZO}>
      <Path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <Path d="M10 11v6M14 11v6" />
    </Svg>
  );
}

export function IconoCheckCirculo({ tamano = 16, color = COLORES.exitoTexto }: IconoProps) {
  return (
    <Svg width={tamano} height={tamano} viewBox="0 0 24 24" stroke={color} {...PROPIEDADES_TRAZO}>
      <Circle cx={12} cy={12} r={10} />
      <Polyline points="9 12 11 14 15 10" />
    </Svg>
  );
}

