/**
 * @archivo TextoUbicacion.tsx
 * @proyecto Civil Trace
 * @descripcion Línea con la ubicación de una evidencia: coordenadas con enlace al mapa, "Sin
 *   ubicación GPS" con la referencia escrita, o "Ubicación no registrada" en fotos anteriores.
 * @autor Emilio Manuel Esquivel
 * @fecha 25/11/2026
 * @version 1.0.0
 * @requerimientos RF-08 Capturar evidencia fotográfica, RF-54 Consultar cronología de avance
 * @historial 25/11/2026 - Emilio Manuel Esquivel - Creación (feature 007)
 */

// 1. Importaciones
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { IconoUbicacion } from '@/componentes/Iconos';
import { COLORES } from '@/constantes/colores';
import { COLORES_ASISTENCIA } from '@/constantes/textosAsistencia';
import { TIPOGRAFIA } from '@/constantes/tema';
import {
  describirUbicacion,
  enlaceMapa,
  type DatosUbicacion,
} from '@/utilidades/ubicacionEvidencia';

// 2. Tipos e interfaces
interface TextoUbicacionProps {
  datos: DatosUbicacion;
}

// 3. Constantes del módulo
const TAMANO_ICONO = 14;

// 4. Componente principal
export default function TextoUbicacion({ datos }: TextoUbicacionProps) {
  const { ubicacion } = datos;
  const texto = describirUbicacion(datos);
  return (
    <View style={estilos.fila}>
      <IconoUbicacion tamano={TAMANO_ICONO} color={COLORES.textoSutil} />
      <Text style={estilos.texto} accessibilityLabel={`Ubicación de la foto: ${texto}`}>
        {texto}
      </Text>
      {ubicacion ? (
        <Pressable
          onPress={() => void Linking.openURL(enlaceMapa(ubicacion))}
          accessibilityRole="link"
          accessibilityLabel="Ver la ubicación en el mapa"
          hitSlop={8}
        >
          <Text style={estilos.enlace}>Ver mapa</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  texto: { ...TIPOGRAFIA.leyenda, color: COLORES.textoSutil, flexShrink: 1 },
  enlace: { ...TIPOGRAFIA.leyenda, color: COLORES_ASISTENCIA.azul },
});
