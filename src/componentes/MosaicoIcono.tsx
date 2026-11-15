/**
 * @archivo MosaicoIcono.tsx
 * @proyecto Civil Trace
 * @descripcion Cuadro de color con un icono al centro, usado en las tarjetas de acción.
 * @autor POR_COMPLETAR
 * @fecha POR_COMPLETAR
 * @version 1.0.0
 */

// 1. Importaciones
import type { ComponentType } from 'react';
import { StyleSheet, View } from 'react-native';

import type { IconoProps } from '@/componentes/Iconos';
import { COLORES } from '@/constantes/colores';
import { RADIOS, TAMANOS } from '@/constantes/tema';

// 2. Tipos e interfaces
interface MosaicoIconoProps {
  Icono: ComponentType<IconoProps>;
  tamano?: number;
}

// 3. Constantes del módulo
const TAMANO_ICONO = 18;

// 4. Componente principal
export default function MosaicoIcono({ Icono, tamano = TAMANOS.mosaico }: MosaicoIconoProps) {
  return (
    <View style={[estilos.contenedor, { width: tamano, height: tamano }]}>
      <Icono tamano={TAMANO_ICONO} color={COLORES.superficie} />
    </View>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  contenedor: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIOS.mosaico,
    backgroundColor: COLORES.marcaOscura,
  },
});
