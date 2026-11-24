/**
 * @archivo MarcadorPantalla.tsx
 * @proyecto Civil Trace
 * @descripcion Pantalla provisional para pestañas cuyo contenido pertenece a otro feature (por
 *   ejemplo "Trabajo" del trabajador). Usa el encabezado de la app.
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos Constitución I.2 (solo lo que está en el Figma)
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001)
 */

// 1. Importaciones
import { StyleSheet, Text, View } from 'react-native';

import EncabezadoApp from '@/componentes/EncabezadoApp';
import { COLORES } from '@/constantes/colores';
import { TIPOGRAFIA } from '@/constantes/tema';

// 2. Tipos e interfaces
interface MarcadorPantallaProps {
  titulo: string;
  mensaje: string;
}

// 4. Componente principal
export default function MarcadorPantalla({ titulo, mensaje }: MarcadorPantallaProps) {
  return (
    <View style={estilos.contenedor}>
      <EncabezadoApp />
      <View style={estilos.contenido}>
        <Text style={estilos.titulo}>{titulo}</Text>
        <Text style={estilos.mensaje}>{mensaje}</Text>
      </View>
    </View>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: COLORES.pantalla },
  contenido: { padding: 24, gap: 8 },
  titulo: { ...TIPOGRAFIA.titulo1, color: COLORES.texto },
  mensaje: { ...TIPOGRAFIA.subtitulo, color: COLORES.textoAtenuado },
});
