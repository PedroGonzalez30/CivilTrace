/**
 * @archivo AvisoExito.tsx
 * @proyecto Civil Trace
 * @descripcion Aviso verde con icono de palomita que confirma que una acción salió bien.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 19/11/2026
 * @version 1.0.0
 */

// 1. Importaciones
import { StyleSheet, Text, View } from 'react-native';

import { IconoCheckCirculo } from '@/componentes/Iconos';
import { COLORES } from '@/constantes/colores';
import { RADIOS, TIPOGRAFIA } from '@/constantes/tema';

// 2. Tipos e interfaces
interface AvisoExitoProps {
  mensaje: string;
}

// 4. Componente principal
export default function AvisoExito({ mensaje }: AvisoExitoProps) {
  return (
    <View accessibilityRole="alert" style={estilos.contenedor}>
      <IconoCheckCirculo />
      <Text style={estilos.mensaje}>{mensaje}</Text>
    </View>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  contenedor: {
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    backgroundColor: COLORES.exitoFondo,
    borderWidth: 1,
    borderColor: COLORES.exitoBorde,
    borderRadius: RADIOS.mosaico,
  },
  mensaje: {
    ...TIPOGRAFIA.etiqueta,
    color: COLORES.exitoTexto,
  },
});
