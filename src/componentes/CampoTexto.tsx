/**
 * @archivo CampoTexto.tsx
 * @proyecto Civil Trace
 * @descripcion Campo de texto con etiqueta y mensaje de error, usado en los formularios.
 * @autor POR_COMPLETAR
 * @fecha POR_COMPLETAR
 * @version 1.0.0
 * @historial 25/11/2026 - Emilio Manuel Esquivel - Prop textContentType (feature 006)
 */

// 1. Importaciones
import { type ComponentRef, type ComponentType, type Ref, useState } from 'react';
import {
  type KeyboardTypeOptions,
  Pressable,
  type ReturnKeyTypeOptions,
  type StyleProp,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
  type ViewStyle,
} from 'react-native';

import { IconoOjo, IconoOjoOculto, type IconoProps } from '@/componentes/Iconos';
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
  textContentType?: TextInputProps['textContentType'];
  returnKeyType?: ReturnKeyTypeOptions;
  referenciaEntrada?: Ref<CampoTextoRef>;
  esMultilinea?: boolean;
  puedeAlternarVisibilidad?: boolean;
  Icono?: ComponentType<IconoProps>;
  estiloCaja?: StyleProp<ViewStyle>;
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
  esMultilinea,
  error,
  editable,
  keyboardType,
  autoCapitalize,
  autoComplete,
  textContentType,
  returnKeyType,
  puedeAlternarVisibilidad,
  referenciaEntrada,
  Icono,
  estiloCaja,
  onCambiarTexto,
  onPerderFoco,
  onEnviar,
}: CampoTextoProps) {
  const [esVisible, setEsVisible] = useState(false);
  const estaOculto = puedeAlternarVisibilidad ? !esVisible : secureTextEntry;

  const manejarAlternarVisibilidad = () => setEsVisible((anterior) => !anterior);
  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>
      <View
        style={[
          estilos.caja,
          esCompacto && estilos.cajaCompacta,
          esMultilinea && estilos.cajaMultilinea,
          Icono && estilos.cajaConIcono,
          error ? estilos.cajaError : null,
          estiloCaja,
        ]}
      >
        {Icono ? <Icono /> : null}
        <TextInput
          ref={referenciaEntrada}
          style={[
            estilos.entrada,
            Icono && estilos.entradaFlexible,
            puedeAlternarVisibilidad && estilos.entradaConIcono,
          ]}
          secureTextEntry={estaOculto}
          value={valor}
          placeholder={textoMarcador}
          placeholderTextColor={esCompacto ? COLORES.marcador : COLORES.textoAtenuado}
          editable={editable}
          multiline={esMultilinea}
          textAlignVertical={esMultilinea ? 'top' : undefined}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          textContentType={textContentType}
          autoCorrect={false}
          returnKeyType={returnKeyType}
          onChangeText={onCambiarTexto}
          onBlur={onPerderFoco}
          onSubmitEditing={onEnviar}
        />
        {puedeAlternarVisibilidad ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={esVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            hitSlop={8}
            style={estilos.botonVisibilidad}
            onPress={manejarAlternarVisibilidad}
          >
            {esVisible ? <IconoOjo /> : <IconoOjoOculto />}
          </Pressable>
        ) : null}
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
  cajaMultilinea: {
    height: TAMANOS.entradaMultilinea,
    justifyContent: 'flex-start',
    paddingVertical: 12,
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
  entradaConIcono: {
    paddingRight: 30,
  },
  botonVisibilidad: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 16,
    justifyContent: 'center',
  },
  cajaConIcono: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  entradaFlexible: {
    flex: 1,
  },
});
