/**
 * @archivo ModalEliminarPersonal.tsx
 * @proyecto Civil Trace
 * @descripcion Ventana con fondo desenfocado que pide confirmar la eliminación de una persona.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 19/11/2026
 * @version 1.0.0
 */

// 1. Importaciones
import { BlurView } from 'expo-blur';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import BotonPrincipal from '@/componentes/BotonPrincipal';
import { COLORES } from '@/constantes/colores';
import { RADIOS, SOMBRAS, TAMANOS, TIPOGRAFIA } from '@/constantes/tema';
import { TEXTOS_ELIMINAR_PERSONAL } from '@/constantes/textos';

// 2. Tipos e interfaces
interface ModalEliminarPersonalProps {
  esVisible: boolean;
  estaCargando: boolean;
  titulo?: string;
  descripcion?: string;
  onCancelar: () => void;
  onAceptar: () => void;
}

// 3. Constantes del módulo
// Distancia desde el borde superior de la pantalla hasta la tarjeta, medida en el diseño.
const POSICION_SUPERIOR_TARJETA = 342;

// 4. Componente principal
export default function ModalEliminarPersonal({
  esVisible,
  estaCargando,
  titulo = TEXTOS_ELIMINAR_PERSONAL.titulo,
  descripcion = TEXTOS_ELIMINAR_PERSONAL.descripcion,
  onCancelar,
  onAceptar,
}: ModalEliminarPersonalProps) {
  return (
    <Modal
      transparent
      visible={esVisible}
      statusBarTranslucent
      animationType="none"
      onRequestClose={onCancelar}
    >
      <View style={estilos.superposicion}>
        <BlurView intensity={TAMANOS.desenfoque} tint="light" style={StyleSheet.absoluteFill} />
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancelar} />
        <View style={estilos.tarjeta}>
          <Pressable style={estilos.cerrar} onPress={onCancelar} hitSlop={12}>
            <Text style={estilos.textoCerrar}>X</Text>
          </Pressable>
          <Text style={estilos.titulo}>{titulo}</Text>
          <Text style={estilos.descripcion}>{descripcion}</Text>{' '}
          <View style={estilos.botones}>
            <BotonPrincipal
              etiqueta={TEXTOS_ELIMINAR_PERSONAL.cancelar}
              variante="contorno"
              onPresionar={onCancelar}
              estilo={estilos.boton}
            />
            <BotonPrincipal
              etiqueta={TEXTOS_ELIMINAR_PERSONAL.aceptar}
              estaCargando={estaCargando}
              onPresionar={onAceptar}
              estilo={estilos.boton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  superposicion: {
    flex: 1,
    paddingTop: POSICION_SUPERIOR_TARJETA,
    paddingHorizontal: 22,
    backgroundColor: COLORES.superposicion,
  },
  tarjeta: {
    paddingTop: 48,
    paddingHorizontal: 23,
    paddingBottom: 25,
    backgroundColor: COLORES.superficie,
    borderWidth: 1,
    borderColor: COLORES.bordeModal,
    borderRadius: RADIOS.modal,
    ...SOMBRAS.modal,
  },
  cerrar: {
    position: 'absolute',
    top: 9,
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
    marginTop: 11,
    ...TIPOGRAFIA.leyenda,
    color: COLORES.textoSutil,
  },
  botones: {
    flexDirection: 'row',
    gap: 21,
    marginTop: 46,
    paddingHorizontal: 3,
  },
  boton: {
    flex: 1,
  },
});
