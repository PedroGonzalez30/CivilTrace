/**
 * @archivo CampoEtiquetado.tsx
 * @proyecto Civil Trace
 * @descripcion Muestra un dato de solo lectura con su etiqueta encima.
 * @autor POR_COMPLETAR
 * @fecha POR_COMPLETAR
 * @version 1.0.0
 */

// 1. Importaciones
import { type StyleProp, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { COLORES } from '@/constantes/colores';
import { TIPOGRAFIA } from '@/constantes/tema';

// 2. Tipos e interfaces
interface CampoEtiquetadoProps {
  etiqueta: string;
  valor: string;
  estilo?: StyleProp<ViewStyle>;
}

// 4. Componente principal
export default function CampoEtiquetado({ etiqueta, valor, estilo }: CampoEtiquetadoProps) {
  return (
    <View style={[estilos.contenedor, estilo]}>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>
      <Text style={estilos.valor}>{valor}</Text>
    </View>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  contenedor: {
    gap: 4,
  },
  etiqueta: {
    ...TIPOGRAFIA.etiquetaCampo,
    color: COLORES.textoTenue,
  },
  valor: {
    ...TIPOGRAFIA.valorCampo,
    color: COLORES.texto,
  },
});
