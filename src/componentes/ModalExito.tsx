/**
 * @archivo ModalExito.tsx
 * @proyecto Civil Trace
 * @descripcion Ventana con fondo desenfocado que confirma que una acción salió bien
 *              (por ejemplo, el cambio de contraseña).
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 19/11/2026
 * @version 1.0.0
 */

// 1. Importaciones
import { BlurView } from 'expo-blur';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BotonPrincipal from '@/componentes/BotonPrincipal';
import { COLORES } from '@/constantes/colores';
import { RADIOS, SOMBRAS, TAMANOS, TIPOGRAFIA } from '@/constantes/tema';

// 2. Tipos e interfaces
interface ModalExitoProps {
  titulo: string;
  descripcion: string;
  etiquetaBoton: string;
  onCerrar: () => void;
  onAceptar: () => void;
}

// 4. Componente principal
export default function ModalExito({
  titulo,
  descripcion,
  etiquetaBoton,
  onCerrar,
  onAceptar,
}: ModalExitoProps) {
  const margenesSeguros = useSafeAreaInsets();

  return (
    <View
      accessibilityViewIsModal
      style={[estilos.superposicion, { top: TAMANOS.encabezadoApp + margenesSeguros.top }]}
    >
      <BlurView intensity={TAMANOS.desenfoque} tint="light" style={StyleSheet.absoluteFill} />
      <View style={estilos.tarjeta}>
        <Pressable accessibilityLabel="Cerrar" style={estilos.cerrar} onPress={onCerrar} hitSlop={12}>
          <Text style={estilos.textoCerrar}>X</Text>
        </Pressable>
        <Text style={estilos.titulo}>{titulo}</Text>
        <Text style={estilos.descripcion}>{descripcion}</Text>
        <BotonPrincipal etiqueta={etiquetaBoton} onPresionar={onAceptar} estilo={estilos.boton} />
      </View>
    </View>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  superposicion: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: 22,
    backgroundColor: COLORES.superposicion,
    zIndex: 3,
  },
  tarjeta: {
    paddingTop: 48,
    paddingHorizontal: 23,
    paddingBottom: 24,
    backgroundColor: COLORES.superficie,
    borderWidth: 1,
    borderColor: COLORES.bordeModal,
    borderRadius: RADIOS.modal,
    ...SOMBRAS.modal,
  },
  cerrar: {
    position: 'absolute',
    top: 8,
    right: 12,
  },
  textoCerrar: {
    ...TIPOGRAFIA.leyenda,
    color: COLORES.texto,
  },
  titulo: {
    ...TIPOGRAFIA.titulo2,
    color: COLORES.texto,
  },
  descripcion: {
    marginTop: 12,
    ...TIPOGRAFIA.leyenda,
    color: COLORES.textoSutil,
  },
  boton: {
    marginTop: 48,
    marginHorizontal: 6,
  },
});