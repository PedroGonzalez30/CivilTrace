/**
 * @archivo EncabezadoApp.tsx
 * @proyecto Civil Trace
 * @descripcion Barra superior con el nombre de la aplicación. Dentro de la navegación del
 *              dueño muestra además el botón de menú de tres rayas. A la derecha va el
 *              logotipo de la empresa, si tiene (D-25).
 * @autor POR_COMPLETAR
 * @fecha POR_COMPLETAR
 * @version 1.3.0
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Logotipo de la empresa a la derecha (D-25,
 *   feature 002)
 */

// 1. Importaciones
import { Image, Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconoMenu } from '@/componentes/Iconos';
import { COLORES } from '@/constantes/colores';
import { RADIOS, SOMBRAS, TAMANOS, TIPOGRAFIA } from '@/constantes/tema';
import { useLogoEmpresa } from '@/hooks/useLogoEmpresa';
import { useMenuDueno } from '@/hooks/useMenuDueno';

// 3. Constantes del módulo
const TAMANO_LOGO = 40;

// 4. Componente principal
export default function EncabezadoApp() {
  // Solo es distinto de null dentro de la navegación del dueño: eso decide si hay 3 rayas.
  const menuDueno = useMenuDueno();
  const logo = useLogoEmpresa();

  // La altura real incluye el área segura; el menú la necesita para colocarse debajo.
  const manejarDiseno = (evento: LayoutChangeEvent) => {
    menuDueno?.cambiarAltura(evento.nativeEvent.layout.height);
  };

  return (
    <SafeAreaView edges={['top']} style={estilos.contenedor} onLayout={manejarDiseno}>
      {menuDueno ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Abrir menú"
          onPress={menuDueno.abrirMenu}
        >
          <IconoMenu />
        </Pressable>
      ) : (
        <View style={estilos.acento} />
      )}
      <Text style={estilos.marca}>Civil Trace</Text>
      {logo?.uri ? (
        <Image
          source={{ uri: logo.uri }}
          style={estilos.logo}
          accessibilityLabel="Logotipo de la empresa"
        />
      ) : null}
    </SafeAreaView>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    backgroundColor: COLORES.primario,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    zIndex: 4,
    ...SOMBRAS.encabezado,
  },
  acento: {
    width: TAMANOS.anchoBarraAcento,
    height: TAMANOS.altoBarraAcento,
    borderRadius: RADIOS.acento,
    backgroundColor: COLORES.superficie,
  },
  marca: {
    flex: 1,
    ...TIPOGRAFIA.marca,
    color: COLORES.superficie,
  },
  logo: {
    width: TAMANO_LOGO,
    height: TAMANO_LOGO,
    borderRadius: RADIOS.accion,
    backgroundColor: COLORES.superficie,
  },
});
