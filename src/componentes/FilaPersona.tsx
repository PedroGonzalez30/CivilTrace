/**
 * @archivo FilaPersona.tsx
 * @proyecto Civil Trace
 * @descripcion Fila de una persona de la empresa con avatar, nombre, rol y botón de eliminar.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 19/11/2026
 * @version 1.0.0
 * @historial 25/11/2026 - Emilio Manuel Esquivel - Tocar el nombre abre el desempeño (feature 005)
 */

// 1. Importaciones
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { IconoPapelera } from '@/componentes/Iconos';
import { COLORES } from '@/constantes/colores';
import { RADIOS, TAMANOS, TIPOGRAFIA } from '@/constantes/tema';
import { obtenerIniciales } from '@/utilidades/obtenerIniciales';

// 2. Tipos e interfaces
interface FilaPersonaProps {
  nombre: string;
  subtitulo: string;
  onEliminar: () => void;
  // Feature 005: tocar a un trabajador abre su desempeño.
  onPresionar?: () => void;
}

// 3. Constantes del módulo
const OPACIDAD_PAPELERA = 0.45;
const MARGEN_AREA_TOQUE = 10;

// 4. Componente principal
export default function FilaPersona({
  nombre,
  subtitulo,
  onEliminar,
  onPresionar,
}: FilaPersonaProps) {
  return (
    <View style={estilos.fila}>
      <View style={estilos.avatar}>
        <Text style={estilos.iniciales}>{obtenerIniciales(nombre)}</Text>
      </View>
      <Pressable
        style={estilos.textos}
        disabled={!onPresionar}
        onPress={onPresionar}
        accessibilityRole={onPresionar ? 'button' : undefined}
        accessibilityLabel={onPresionar ? `Ver desempeño de ${nombre}` : undefined}
      >
        <Text numberOfLines={1} style={estilos.nombre}>
          {nombre}
        </Text>
        <Text numberOfLines={1} style={estilos.subtitulo}>
          {subtitulo}
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Eliminar a ${nombre}`}
        hitSlop={MARGEN_AREA_TOQUE}
        onPress={onEliminar}
        style={estilos.papelera}
      >
        <IconoPapelera />
      </Pressable>
    </View>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  fila: {
    height: TAMANOS.filaPersona,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    backgroundColor: COLORES.fondoFila,
    borderRadius: RADIOS.mosaico,
  },
  avatar: {
    width: TAMANOS.avatar,
    height: TAMANOS.avatar,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORES.fondoAvatar,
    borderRadius: RADIOS.avatar,
  },
  iniciales: {
    ...TIPOGRAFIA.iniciales,
    color: COLORES.textoSutil,
  },
  textos: {
    flex: 1,
  },
  nombre: {
    ...TIPOGRAFIA.etiqueta,
    color: COLORES.texto,
  },
  subtitulo: {
    ...TIPOGRAFIA.leyenda,
    color: COLORES.textoSutil,
  },
  papelera: {
    opacity: OPACIDAD_PAPELERA,
  },
});
