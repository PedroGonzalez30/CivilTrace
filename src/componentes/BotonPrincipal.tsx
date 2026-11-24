/**
 * @archivo BotonPrincipal.tsx
 * @proyecto Civil Trace
 * @descripcion Botón reutilizable con variantes principal, contorno y marca, y estado de carga.
 * @autor POR_COMPLETAR
 * @fecha POR_COMPLETAR
 * @version 1.1.0
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Prop deshabilitado (la usaba Reportes sin existir)
 */

// 1. Importaciones
import {
  ActivityIndicator,
  Pressable,
  type StyleProp,
  StyleSheet,
  Text,
  type ViewStyle,
} from 'react-native';

import { COLORES } from '@/constantes/colores';
import { RADIOS, SOMBRAS, TAMANOS, TIPOGRAFIA } from '@/constantes/tema';

// 2. Tipos e interfaces
interface BotonPrincipalProps {
  etiqueta: string;
  onPresionar?: () => void;
  variante?: 'principal' | 'contorno' | 'marca';
  estaCargando?: boolean;
  // Desactiva el botón sin mostrar el indicador de carga.
  deshabilitado?: boolean;
  estilo?: StyleProp<ViewStyle>;
}

// 4. Componente principal
export default function BotonPrincipal({
  etiqueta,
  onPresionar,
  variante = 'principal',
  estaCargando = false,
  deshabilitado = false,
  estilo,
}: BotonPrincipalProps) {
  const colorContenido = variante === 'contorno' ? COLORES.primario : COLORES.superficie;
  const estiloVariante = {
    principal: estilos.principal,
    contorno: estilos.contorno,
    marca: estilos.marca,
  }[variante];

  const estiloEtiqueta = variante === 'marca' ? estilos.etiquetaPequena : estilos.etiqueta;

  return (
    <Pressable
      onPress={onPresionar}
      disabled={estaCargando || deshabilitado}
      style={[estilos.base, estiloVariante, deshabilitado && estilos.deshabilitado, estilo]}
    >
      {estaCargando ? (
        <ActivityIndicator color={colorContenido} />
      ) : (
        <Text style={[estiloEtiqueta, { color: colorContenido }]}>{etiqueta}</Text>
      )}
    </Pressable>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  base: {
    height: TAMANOS.boton,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIOS.pildora,
  },
  principal: {
    backgroundColor: COLORES.primario,
    ...SOMBRAS.boton,
  },
  marca: {
    backgroundColor: COLORES.marca,
    ...SOMBRAS.botonMarca,
  },
  contorno: {
    backgroundColor: COLORES.superficie,
    borderWidth: 1.5,
    borderColor: COLORES.primario,
  },
  etiqueta: {
    ...TIPOGRAFIA.boton,
  },
  etiquetaPequena: {
    ...TIPOGRAFIA.botonPequeno,
  },
  deshabilitado: {
    opacity: 0.5,
  },
});
