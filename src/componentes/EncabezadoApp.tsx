/**
 * @archivo EncabezadoApp.tsx
 * @proyecto Civil Trace
 * @descripcion Barra superior con el nombre de la aplicación. Muestra el botón de menú de tres
 *              rayas solo cuando la pantalla le pasa onPresionarMenu (pantallas del dueño).
 * @autor POR_COMPLETAR
 * @fecha POR_COMPLETAR
 * @version 1.1.0
 */

// 1. Importaciones
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconoMenu } from '@/componentes/Iconos';
import { COLORES } from '@/constantes/colores';
import { RADIOS, SOMBRAS, TAMANOS, TIPOGRAFIA } from '@/constantes/tema';

// 2. Tipos e interfaces
interface EncabezadoAppProps {
  onPresionarMenu?: () => void;
  onCambiarAltura?: (altura: number) => void;
}

// 4. Componente principal
export default function EncabezadoApp({ onPresionarMenu, onCambiarAltura }: EncabezadoAppProps) {
  // La altura real incluye el área segura; el menú la necesita para colocarse debajo del encabezado.
  const manejarDiseno = (evento: LayoutChangeEvent) => {
    onCambiarAltura?.(evento.nativeEvent.layout.height);
  };

  return (
    <SafeAreaView edges={['top']} style={estilos.contenedor} onLayout={manejarDiseno}>
      {onPresionarMenu ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Abrir menú"
          onPress={onPresionarMenu}
        >
          <IconoMenu />
        </Pressable>
      ) : (
        <View style={estilos.acento} />
      )}
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
