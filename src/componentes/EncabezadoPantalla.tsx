/**
 * @archivo EncabezadoPantalla.tsx
 * @proyecto Civil Trace
 * @descripcion Título y subtítulo que encabezan el contenido de una pantalla.
 * @autor POR_COMPLETAR
 * @fecha POR_COMPLETAR
 * @version 1.0.0
 */

// 1. Importaciones
import { StyleSheet, Text, View } from 'react-native';

import { COLORES } from '@/constantes/colores';
import { TIPOGRAFIA } from '@/constantes/tema';

// 2. Tipos e interfaces
interface EncabezadoPantallaProps {
  titulo: string;
  subtitulo: string;
}

// 4. Componente principal
export default function EncabezadoPantalla({ titulo, subtitulo }: EncabezadoPantallaProps) {
  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.titulo}>{titulo}</Text>
      <Text style={estilos.subtitulo}>{subtitulo}</Text>
    </View>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  contenedor: {
    gap: 8,
  },
  titulo: {
    ...TIPOGRAFIA.titulo1,
    color: COLORES.texto,
  },
  subtitulo: {
    ...TIPOGRAFIA.subtitulo,
    color: COLORES.textoAtenuado,
  },
});
