/**
 * @archivo TarjetaCodigoAcceso.tsx
 * @proyecto Civil Trace
 * @descripcion Tarjeta que muestra un código de acceso con un botón para copiarlo.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 16/11/2026
 * @version 1.0.0
 */

// 1. Importaciones
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORES } from '@/constantes/colores';
import { RADIOS, SOMBRAS, TIPOGRAFIA } from '@/constantes/tema';

// 2. Tipos e interfaces
interface TarjetaCodigoAccesoProps {
  titulo: string;
  descripcion: string;
  codigo: string;
  copiado?: boolean;
  onCopiar: () => void;
}
// 4. Componente principal
export default function TarjetaCodigoAcceso({
  titulo,
  descripcion,
  codigo,
  copiado,
  onCopiar,
}: TarjetaCodigoAccesoProps) {
  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.titulo}>{titulo}</Text>
      <Text style={estilos.descripcion}>{descripcion}</Text>
      <View style={estilos.fila}>
        <Text style={estilos.codigo} selectable>
          {codigo}
        </Text>
        <Pressable style={estilos.botonCopiar} onPress={onCopiar}>
          <Text style={estilos.etiquetaCopiar}>{copiado ? '¡Copiado!' : 'Copiar'}</Text>
          |</Pressable>
      </View>
    </View>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  contenedor: {
    gap: 6,
    padding: 14,
    backgroundColor: COLORES.fondo,
    borderWidth: 1,
    borderColor: COLORES.borde,
    borderRadius: RADIOS.tarjeta,
  },
  titulo: { ...TIPOGRAFIA.etiqueta, color: COLORES.texto },
  descripcion: { ...TIPOGRAFIA.leyenda, color: COLORES.textoAtenuado },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 4,
  },
  codigo: { flex: 1, ...TIPOGRAFIA.etiqueta, color: COLORES.primario },
  botonCopiar: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: COLORES.marca,
    borderRadius: RADIOS.pildora,
    ...SOMBRAS.opcion,
  },
  etiquetaCopiar: { ...TIPOGRAFIA.leyenda, color: COLORES.superficie },
  copiado: { ...TIPOGRAFIA.leyenda, color: COLORES.exito },
});
