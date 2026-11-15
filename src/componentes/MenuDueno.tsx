/**
 * @archivo MenuDueno.tsx
 * @proyecto Civil Trace
 * @descripcion Menú desplegable del dueño con acceso a los datos de la empresa y al código de obra.
 * @autor POR_COMPLETAR
 * @fecha POR_COMPLETAR
 * @version 1.0.0
 */

// 1. Importaciones
import { BlurView } from 'expo-blur';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';

import { COLORES } from '@/constantes/colores';
import { RADIOS, SOMBRAS, TAMANOS, TIPOGRAFIA } from '@/constantes/tema';

// 2. Tipos e interfaces
interface MenuDuenoProps {
  esVisible: boolean;
  alturaEncabezado: number;
  onCerrar: () => void;
  onDatosEmpresa: () => void;
  onCodigoAcceso: () => void;
}

interface OpcionMenu {
  etiqueta: string;
  onPresionar: () => void;
}

// 4. Componente principal
export default function MenuDueno({
  esVisible,
  alturaEncabezado,
  onCerrar,
  onDatosEmpresa,
  onCodigoAcceso,
}: MenuDuenoProps) {
  const opciones: OpcionMenu[] = [
    { etiqueta: 'Datos de la empresa', onPresionar: onDatosEmpresa },
    { etiqueta: 'Código de acceso a la obra', onPresionar: onCodigoAcceso },
  ];

  const manejarSeleccion = (opcion: OpcionMenu) => () => {
    onCerrar();
    opcion.onPresionar();
  };

  return (
    <Modal
      visible={esVisible}
      transparent
      statusBarTranslucent
      animationType="none"
      onRequestClose={onCerrar}
    >
      <Pressable style={[estilos.fondo, { top: alturaEncabezado }]} onPress={onCerrar}>
        <BlurView intensity={TAMANOS.desenfoque} tint="light" style={StyleSheet.absoluteFill} />
      </Pressable>
      <Pressable
        style={[estilos.zonaEncabezado, { height: alturaEncabezado }]}
        onPress={onCerrar}
      />
      <Svg width={24} height={20} style={[estilos.puntero, { top: alturaEncabezado - 11 }]}>
        <Polygon points="12,0 24,20 0,20" fill={COLORES.superficie} />
      </Svg>
      <View style={[estilos.panel, { top: alturaEncabezado + 9 }]}>
        {opciones.map((opcion) => (
          <Pressable
            key={opcion.etiqueta}
            style={estilos.opcion}
            onPress={manejarSeleccion(opcion)}
          >
            <Text style={estilos.etiquetaOpcion}>{opcion.etiqueta}</Text>
          </Pressable>
        ))}
      </View>
    </Modal>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  fondo: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  zonaEncabezado: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  puntero: {
    position: 'absolute',
    left: 18,
  },
  panel: {
    position: 'absolute',
    left: 0,
    width: TAMANOS.anchoMenu,
    gap: TAMANOS.menuSeparacion,
    paddingTop: TAMANOS.menuSuperior,
    paddingBottom: TAMANOS.menuInferior,
    paddingHorizontal: 11,
    backgroundColor: COLORES.superficie,
    borderRadius: RADIOS.tarjeta,
    ...SOMBRAS.desplegable,
  },
  opcion: {
    height: TAMANOS.opcionMenu,
    padding: 14,
    backgroundColor: COLORES.fondo,
    borderWidth: 2,
    borderColor: COLORES.borde,
    borderRadius: RADIOS.accion,
    ...SOMBRAS.opcion,
  },
  etiquetaOpcion: {
    ...TIPOGRAFIA.etiqueta,
    color: COLORES.texto,
  },
});
