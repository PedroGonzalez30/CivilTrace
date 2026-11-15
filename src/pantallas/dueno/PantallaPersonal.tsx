/**
 * @archivo PantallaPersonal.tsx
 * @proyecto Civil Trace
 * @descripcion Pantalla temporal de la pestaña Personal del dueño (solo muestra el encabezado).
 * @autor POR_COMPLETAR
 * @fecha POR_COMPLETAR
 * @version 1.0.0
 */

// 1. Importaciones
import { StyleSheet, View } from 'react-native';

import { EncabezadoApp } from '@/componentes';
import { COLORES } from '@/constantes/colores';

// 4. Componente principal
// TODO(Equipo): construir la lista de personal de la empresa.
export default function PantallaPersonal() {
  return (
    <View style={estilos.contenedor}>
      <EncabezadoApp />
    </View>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: COLORES.pantalla,
  },
});
