/**
 * @archivo CampoTexto.tsx
 * @proyecto Civil Trace
 * @descripcion Campo de texto con etiqueta y mensaje de error, usado en los formularios.
 * @autor POR_COMPLETAR
 * @fecha POR_COMPLETAR
 * @version 1.0.0
 */

// 1. Importaciones
import type { ComponentRef, Ref } from 'react';
import {
  type KeyboardTypeOptions,
  type ReturnKeyTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';

import { COLORES } from '@/constantes/colores';
import { RADIOS, TAMANOS, TIPOGRAFIA } from '@/constantes/tema';

// 2. Tipos e interfaces
export type CampoTextoRef = ComponentRef<typeof TextInput>;

interface CampoTextoProps {
  etiqueta: string;
  valor?: string;
  textoMarcador?: string;
  secureTextEntry?: boolean;
  esCompacto?: boolean;
  error?: string;
  editable?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoComplete?: TextInputProps['autoComplete'];
  returnKeyType?: ReturnKeyTypeOptions;
  referenciaEntrada?: Ref<CampoTextoRef>;
  onCambiarTexto?: (texto: string) => void;
  onPerderFoco?: () => void;
  onEnviar?: () => void;
}

// 4. Componente principal
export default function CampoTexto({
  etiqueta,
  valor,
  textoMarcador,
  secureTextEntry,
  esCompacto,
  error,
  editable,
  keyboardType,
  autoCapitalize,
  autoComplete,
  returnKeyType,
  referenciaEntrada,
  onCambiarTexto,
  onPerderFoco,
  onEnviar,
}: CampoTextoProps) {
  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>
      <View
        style={[
          estilos.caja,
          esCompacto && estilos.cajaCompacta,
          error ? estilos.cajaError : null,
        ]}
      >
        <TextInput
          ref={referenciaEntrada}
          style={estilos.entrada}
          value={valor}
          placeholder={textoMarcador}
          placeholderTextColor={esCompacto ? COLORES.marcador : COLORES.textoAtenuado}
          secureTextEntry={secureTextEntry}
          editable={editable}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          autoCorrect={false}
          returnKeyType={returnKeyType}
          onChangeText={onCambiarTexto}
          onBlur={onPerderFoco}
          onSubmitEditing={onEnviar}
        />
      </View>
      {error ? <Text style={estilos.error}>{error}</Text> : null}
    </View>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  contenedor: {
    gap: 8,
  },
  etiqueta: {
    ...TIPOGRAFIA.etiqueta,
    color: COLORES.texto,
  },
  caja: {
    height: TAMANOS.entrada,
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: COLORES.fondoEntrada,
    borderWidth: 1,
    borderColor: COLORES.borde,
    borderRadius: RADIOS.entrada,
  },
  cajaCompacta: {
    height: TAMANOS.entradaModal,
  },
  cajaError: {
    borderColor: COLORES.error,
  },
  entrada: {
    padding: 0,
    ...TIPOGRAFIA.entrada,
    color: COLORES.textoAtenuado,
  },
  error: {
    ...TIPOGRAFIA.leyenda,
    color: COLORES.error,
  },
});
