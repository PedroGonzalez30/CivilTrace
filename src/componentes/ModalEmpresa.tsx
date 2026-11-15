/**
 * @archivo ModalEmpresa.tsx
 * @proyecto Civil Trace
 * @descripcion Ventana que pide el nombre o el código de la empresa durante el registro.
 * @autor POR_COMPLETAR
 * @fecha POR_COMPLETAR
 * @version 1.0.0
 */

// 1. Importaciones
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BotonPrincipal from '@/componentes/BotonPrincipal';
import CampoTexto from '@/componentes/CampoTexto';
import { COLORES } from '@/constantes/colores';
import { RADIOS, SOMBRAS, TAMANOS, TIPOGRAFIA } from '@/constantes/tema';

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

  return (
    <View style={[estilos.superposicion, { top: TAMANOS.encabezadoApp + margenesSeguros.top }]}>
      <ScrollView
        contentContainerStyle={estilos.desplazamiento}
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
