/**
 * @archivo FotoPerfil.tsx
 * @proyecto Civil Trace
 * @descripcion Foto de perfil con la acción "Cambiar foto". Sin foto muestra las iniciales.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 20/11/2026
 * @version 1.0.0
 */

// 1. Importaciones
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { IconoCamara } from '@/componentes/Iconos';
import { COLORES } from '@/constantes/colores';
import { RADIOS, TAMANOS, TIPOGRAFIA } from '@/constantes/tema';
import { TEXTOS_PERFIL } from '@/constantes/textos';
import type { OrigenFoto } from '@/servicios/servicioPerfil';
import { obtenerIniciales } from '@/utilidades/obtenerIniciales';

// 2. Tipos e interfaces
interface FotoPerfilProps {
  nombre: string;
  origen: OrigenFoto | null;
  onCambiar: () => void;
}

// 4. Componente principal
export default function FotoPerfil({ nombre, origen, onCambiar }: FotoPerfilProps) {
  return (
    <View style={estilos.contenedor}>
      {origen ? (
        <Image source={origen} style={estilos.foto} />
      ) : (
        <View style={[estilos.foto, estilos.sinFoto]}>
          <Text style={estilos.iniciales}>{obtenerIniciales(nombre)}</Text>
        </View>
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={TEXTOS_PERFIL.cambiarFoto}
        style={estilos.accion}
        hitSlop={8}
        onPress={onCambiar}
      >
        <IconoCamara />
        <Text style={estilos.textoAccion}>{TEXTOS_PERFIL.cambiarFoto}</Text>
      </Pressable>
    </View>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  foto: {
    width: TAMANOS.fotoPerfil,
    height: TAMANOS.fotoPerfil,
    borderRadius: RADIOS.pildora,
  },
  sinFoto: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORES.fondoAvatar,
  },
  iniciales: {
    ...TIPOGRAFIA.titulo3,
    color: COLORES.textoSutil,
  },
  accion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  textoAccion: {
    ...TIPOGRAFIA.enlace,
    color: COLORES.marca,
  },
});