/**
 * @archivo TarjetaFormulario.tsx
 * @proyecto Civil Trace
 * @descripcion Tarjeta blanca con sombra que agrupa los campos de un formulario o una sección.
 * @autor POR_COMPLETAR
 * @fecha POR_COMPLETAR
 * @version 1.0.0
 */

// 1. Importaciones
import type { ReactNode } from 'react';
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';

import { COLORES } from '@/constantes/colores';
import { RADIOS, SOMBRAS } from '@/constantes/tema';

// 2. Tipos e interfaces
interface TarjetaFormularioProps {
  children: ReactNode;
  estilo?: StyleProp<ViewStyle>;
}

// 4. Componente principal
export default function TarjetaFormulario({ children, estilo }: TarjetaFormularioProps) {
  return <View style={[estilos.contenedor, estilo]}>{children}</View>;
}

// 5. Estilos
const estilos = StyleSheet.create({
  contenedor: {
    gap: 20,
    padding: 24,
    backgroundColor: COLORES.superficie,
    borderRadius: RADIOS.tarjeta,
    ...SOMBRAS.tarjeta,
  },
});
