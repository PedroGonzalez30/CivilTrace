/**
 * @archivo FotoPerfil.tsx
 * @proyecto Civil Trace
 * @descripcion Foto de perfil o logotipo con su acción de cambiar. Sin imagen muestra las
 *              iniciales.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 20/11/2026
 * @version 1.1.0
 * @historial 20/11/2026 - Pedro González - Variante de logotipo para Datos de la empresa.
 */

// 1. Importaciones
import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { IconoCamara } from '@/componentes/Iconos';
import { COLORES } from '@/constantes/colores';
import { OPACIDADES, RADIOS, TAMANOS, TIPOGRAFIA } from '@/constantes/tema';
import { TEXTOS_PERFIL } from '@/constantes/textos';
import type { OrigenFoto } from '@/servicios/servicioPerfil';
import { obtenerIniciales } from '@/utilidades/obtenerIniciales';

// 2. Tipos e interfaces
interface FotoPerfilProps {
  nombre: string;
  origen: OrigenFoto | null;
  variante?: 'perfil' | 'logotipo';
  etiquetaAccion?: string;
  descripcion?: string;
  estaDeshabilitado?: boolean;
  onCambiar: () => void;
}

// 4. Componente principal
export default function FotoPerfil({
  nombre,
  origen,
  variante = 'perfil',
  etiquetaAccion = TEXTOS_PERFIL.cambiarFoto,
  descripcion,
  estaDeshabilitado = false,
  onCambiar,
}: FotoPerfilProps) {
  const [fallo, setFallo] = useState(false);
  const esLogotipo = variante === 'logotipo';

  // Una foto nueva merece un intento nuevo aunque la anterior haya fallado.
  useEffect(() => {
    setFallo(false);
  }, [origen?.uri]);

  return (
    <View style={estilos.contenedor}>
      {origen && !fallo ? (
        <Image
          source={origen}
          style={[estilos.foto, esLogotipo && estilos.fotoCuadrada, estilos.fondoFoto]}
          onError={(evento) => {
            // Si la imagen no carga se muestran las iniciales; el motivo sale en la consola.
            console.warn('No se pudo cargar la imagen:', evento.nativeEvent.error);
            setFallo(true);
          }}
        />
      ) : (
        <View
          style={[
            estilos.foto,
            estilos.sinFoto,
            esLogotipo && estilos.fotoCuadrada,
            esLogotipo && estilos.fondoLogotipo,
          ]}
        >
          <Text style={[estilos.iniciales, esLogotipo && estilos.inicialesLogotipo]}>
            {obtenerIniciales(nombre)}
          </Text>
        </View>
      )}
      <View style={estilos.lateral}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={etiquetaAccion}
          disabled={estaDeshabilitado}
          style={[estilos.accion, estaDeshabilitado && estilos.deshabilitada]}
          hitSlop={8}
          onPress={onCambiar}
        >
          <IconoCamara />
          <Text style={estilos.textoAccion}>{etiquetaAccion}</Text>
        </Pressable>
        {descripcion ? <Text style={estilos.descripcion}>{descripcion}</Text> : null}
      </View>
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
  fotoCuadrada: {
    borderRadius: RADIOS.accion,
  },
  fondoFoto: {
    backgroundColor: COLORES.fondoAvatar,
  },
  fondoLogotipo: {
    backgroundColor: COLORES.marca,
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
  inicialesLogotipo: {
    ...TIPOGRAFIA.titulo2,
    color: COLORES.superficie,
  },
  lateral: {
    flex: 1,
    gap: 4,
  },
  accion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deshabilitada: {
    opacity: OPACIDADES.deshabilitado,
  },
  textoAccion: {
    ...TIPOGRAFIA.enlace,
    color: COLORES.marca,
  },
  descripcion: {
    ...TIPOGRAFIA.leyenda,
    color: COLORES.textoSutil,
  },
});