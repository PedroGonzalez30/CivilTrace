/**
 * @archivo TarjetaAccion.tsx
 * @proyecto Civil Trace
 * @descripcion Tarjeta con icono, título y subtítulo que representa una acción rápida.
 * @autor POR_COMPLETAR
 * @fecha POR_COMPLETAR
 * @version 1.0.0
 */

// 1. Importaciones
import type { ComponentType } from 'react';
import { Pressable, type StyleProp, StyleSheet, Text, type ViewStyle } from 'react-native';

import type { IconoProps } from '@/componentes/Iconos';
import MosaicoIcono from '@/componentes/MosaicoIcono';
import { COLORES } from '@/constantes/colores';
import { RADIOS, TIPOGRAFIA } from '@/constantes/tema';

// 2. Tipos e interfaces
interface TarjetaAccionProps {
  Icono: ComponentType<IconoProps>;
  titulo: string;
  subtitulo: string;
  onPresionar?: () => void;
  estilo?: StyleProp<ViewStyle>;
}

// 4. Componente principal
export default function TarjetaAccion({
  Icono,
  titulo,
  subtitulo,
  onPresionar,
  estilo,
}: TarjetaAccionProps) {
  return (
    <Pressable onPress={onPresionar} style={[estilos.contenedor, estilo]}>
      <MosaicoIcono Icono={Icono} />
      <Text style={estilos.titulo}>{titulo}</Text>
      <Text style={estilos.subtitulo}>{subtitulo}</Text>
    </Pressable>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  contenedor: {
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORES.fondo,
    borderWidth: 2,
    borderColor: COLORES.borde,
    borderRadius: RADIOS.accion,
  },
  titulo: {
    ...TIPOGRAFIA.etiqueta,
    color: COLORES.texto,
  },
  subtitulo: {
    ...TIPOGRAFIA.leyenda,
    color: COLORES.textoAtenuado,
  },
});
