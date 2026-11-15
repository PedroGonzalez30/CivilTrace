/**
 * @archivo NavegacionInferior.tsx
 * @proyecto Civil Trace
 * @descripcion Barra de navegación inferior con las pestañas Inicio, Personal y Cuenta.
 * @autor POR_COMPLETAR
 * @fecha POR_COMPLETAR
 * @version 1.0.0
 */

// 1. Importaciones
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import type { ComponentType } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconoInicio, type IconoProps, IconoTarjetaId, IconoUsuario } from '@/componentes/Iconos';
import { COLORES } from '@/constantes/colores';
import { RADIOS, SOMBRAS, TAMANOS, TIPOGRAFIA } from '@/constantes/tema';

// 2. Tipos e interfaces
interface ElementoNavegacion {
  etiqueta: string;
  Icono: ComponentType<IconoProps>;
}

// 3. Constantes del módulo
const ELEMENTOS_NAVEGACION: Record<string, ElementoNavegacion> = {
  Inicio: { etiqueta: 'Inicio', Icono: IconoInicio },
  Personal: { etiqueta: 'Personal', Icono: IconoTarjetaId },
  Cuenta: { etiqueta: 'Cuenta', Icono: IconoUsuario },
};

// 4. Componente principal
export default function NavegacionInferior({ state, navigation }: BottomTabBarProps) {
  const margenesSeguros = useSafeAreaInsets();

  return (
    <View style={[estilos.contenedor, { paddingBottom: margenesSeguros.bottom }]}>
      {state.routes.map((ruta, indice) => {
        const estaEnfocado = state.index === indice;
        const { etiqueta, Icono } = ELEMENTOS_NAVEGACION[ruta.name];
        const color = estaEnfocado ? COLORES.marca : COLORES.textoTenue;

        const manejarPresion = () => {
          const evento = navigation.emit({
            type: 'tabPress',
            target: ruta.key,
            canPreventDefault: true,
          });
          if (!estaEnfocado && !evento.defaultPrevented) {
            navigation.navigate(ruta.name);
          }
        };

        return (
          <Pressable key={ruta.key} onPress={manejarPresion} style={estilos.elemento}>
            <Icono color={color} />
            <Text style={[estaEnfocado ? estilos.etiquetaActiva : estilos.etiqueta, { color }]}>
              {etiqueta}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: TAMANOS.navegacionInferior,
    paddingHorizontal: 24,
    backgroundColor: COLORES.superficie,
    borderTopLeftRadius: RADIOS.encabezado,
    borderTopRightRadius: RADIOS.encabezado,
    ...SOMBRAS.navegacion,
  },
  elemento: {
    alignItems: 'center',
    gap: 4,
  },
  etiqueta: {
    ...TIPOGRAFIA.etiquetaNavegacion,
  },
  etiquetaActiva: {
    ...TIPOGRAFIA.etiquetaNavegacionActiva,
  },
});
