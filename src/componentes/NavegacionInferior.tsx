/**
 * @archivo NavegacionInferior.tsx
 * @proyecto Civil Trace
 * @descripcion Barra de navegación inferior con las pestañas Inicio, Personal y Cuenta.
 * @autor POR_COMPLETAR
 * @fecha POR_COMPLETAR
 * @version 1.1.0
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Pestañas de asistencia y color activo (feature 001)
 *   24/11/2026 - Emilio Manuel Esquivel - Se oculta con el teclado abierto (D-27, feature 002)
 */

// 1. Importaciones
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import type { ComponentType } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  IconoCalendarioCheck,
  IconoInicio,
  type IconoProps,
  IconoTarjetaId,
  IconoUsuario,
} from '@/componentes/Iconos';
import { COLORES } from '@/constantes/colores';
import { RADIOS, SOMBRAS, TAMANOS, TIPOGRAFIA } from '@/constantes/tema';
import { useTecladoVisible } from '@/hooks/useTecladoVisible';

// 2. Tipos e interfaces
// El supervisor y el trabajador usan el azul del Figma; el dueño conserva su color.
type NavegacionInferiorProps = BottomTabBarProps & { colorActivo?: string };

interface ElementoNavegacion {
  etiqueta: string;
  Icono: ComponentType<IconoProps>;
}

// 3. Constantes del módulo
const ELEMENTOS_NAVEGACION: Record<string, ElementoNavegacion> = {
  Inicio: { etiqueta: 'Inicio', Icono: IconoInicio },
  Personal: { etiqueta: 'Personal', Icono: IconoTarjetaId },
  Cuenta: { etiqueta: 'Cuenta', Icono: IconoUsuario },
  // Supervisor y trabajador (feature 001).
  Asistencia: { etiqueta: 'Asistencia', Icono: IconoCalendarioCheck },
  Trabajo: { etiqueta: 'Trabajo', Icono: IconoInicio },
  MiAsistencia: { etiqueta: 'Mi asistencia', Icono: IconoTarjetaId },
};

// 4. Componente principal
export default function NavegacionInferior({
  state,
  navigation,
  colorActivo = COLORES.marca,
}: NavegacionInferiorProps) {
  const margenesSeguros = useSafeAreaInsets();
  const tecladoVisible = useTecladoVisible();

  // Con el teclado abierto la barra subiría con él y taparía el campo (D-27).
  if (tecladoVisible) {
    return null;
  }

  return (
    <View style={[estilos.contenedor, { paddingBottom: margenesSeguros.bottom }]}>
      {state.routes.map((ruta, indice) => {
        const estaEnfocado = state.index === indice;
        const { etiqueta, Icono } = ELEMENTOS_NAVEGACION[ruta.name];
        const color = estaEnfocado ? colorActivo : COLORES.textoTenue;

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
