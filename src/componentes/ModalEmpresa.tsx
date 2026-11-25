/**
 * @archivo ModalEmpresa.tsx
 * @proyecto Civil Trace
 * @descripcion Ventana que pide el nombre o el código de la empresa durante el registro.
 * @autor POR_COMPLETAR
 * @fecha POR_COMPLETAR
 * @version 1.0.0
 * @historial 25/11/2026 - Emilio Manuel Esquivel - El teclado ya no tapa el código de empresa
 *   (retroalimentación del equipo, feature 006, D-37)
 */

// 1. Importaciones
import { KeyboardAvoidingView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BotonPrincipal from '@/componentes/BotonPrincipal';
import CampoTexto from '@/componentes/CampoTexto';
import { COLORES } from '@/constantes/colores';
import { RADIOS, SOMBRAS, TAMANOS, TIPOGRAFIA } from '@/constantes/tema';
import { useTecladoVisible } from '@/hooks/useTecladoVisible';

// 2. Tipos e interfaces
interface ModalEmpresaProps {
  titulo: string;
  descripcion: string;
  etiqueta: string;
  textoMarcador: string;
  valor: string;
  error?: string;
  onCambiarTexto: (texto: string) => void;
  onEnviar: () => void;
}

// 4. Componente principal
export default function ModalEmpresa({
  titulo,
  descripcion,
  etiqueta,
  textoMarcador,
  valor,
  error,
  onCambiarTexto,
  onEnviar,
}: ModalEmpresaProps) {
  const margenesSeguros = useSafeAreaInsets();
  const tecladoVisible = useTecladoVisible();

  // D-37: con el teclado abierto la tarjeta sube para que se vea el código que se escribe
  // (el ajuste de teclado del 002 no alcanzaba esta capa).
  return (
    <View style={[estilos.superposicion, { top: TAMANOS.encabezadoApp + margenesSeguros.top }]}>
      <KeyboardAvoidingView style={estilos.flexible} behavior="padding">
        <ScrollView
          contentContainerStyle={[
            estilos.desplazamiento,
            tecladoVisible && estilos.desplazamientoConTeclado,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={estilos.tarjeta}>
            <View style={estilos.encabezado}>
              <Text style={estilos.titulo}>{titulo}</Text>
              <Text style={estilos.descripcion}>{descripcion}</Text>
            </View>
            <CampoTexto
              etiqueta={etiqueta}
              textoMarcador={textoMarcador}
              valor={valor}
              error={error}
              esCompacto
              autoCapitalize="characters"
              returnKeyType="done"
              onCambiarTexto={onCambiarTexto}
              onEnviar={onEnviar}
            />
            <BotonPrincipal etiqueta="Continuar" onPresionar={onEnviar} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  superposicion: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORES.superposicion,
    zIndex: 3,
  },
  flexible: {
    flex: 1,
  },
  desplazamientoConTeclado: {
    paddingTop: 16,
  },
  desplazamiento: {
    paddingTop: TAMANOS.modalSuperior - TAMANOS.encabezadoApp,
    paddingHorizontal: 22,
    paddingBottom: 24,
  },
  tarjeta: {
    gap: 20,
    padding: 24,
    backgroundColor: COLORES.superficie,
    borderWidth: 1,
    borderColor: COLORES.bordeModal,
    borderRadius: RADIOS.modal,
    ...SOMBRAS.modal,
  },
  encabezado: {
    gap: 8,
  },
  titulo: {
    ...TIPOGRAFIA.titulo2,
    color: COLORES.texto,
  },
  descripcion: {
    ...TIPOGRAFIA.leyenda,
    color: COLORES.textoSutil,
  },
});
