/**
 * @archivo EncabezadoApp.tsx
 * @proyecto Civil Trace
 * @descripcion Barra superior con el nombre de la aplicación, presente en todas las pantallas.
 * @autor POR_COMPLETAR
 * @fecha POR_COMPLETAR
 * @version 1.0.0
 */

// 1. Importaciones
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORES } from '@/constantes/colores';
import { RADIOS, SOMBRAS, TAMANOS, TIPOGRAFIA } from '@/constantes/tema';

// 4. Componente principal
export default function EncabezadoApp() {
  return (
    <SafeAreaView edges={['top']} style={estilos.contenedor}>
      <View style={estilos.acento} />
      <Text style={estilos.marca}>Civil Trace</Text>
    </SafeAreaView>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    backgroundColor: COLORES.primario,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    zIndex: 4,
    ...SOMBRAS.encabezado,
  },
  acento: {
    width: TAMANOS.anchoBarraAcento,
    height: TAMANOS.altoBarraAcento,
    borderRadius: RADIOS.acento,
    backgroundColor: COLORES.superficie,
  },
  marca: {
    flex: 1,
    ...TIPOGRAFIA.marca,
    color: COLORES.superficie,
  },
});
