/**
 * @archivo TarjetaTrabajador.tsx
 * @proyecto Civil Trace
 * @descripcion Tarjeta con iniciales, nombre y oficio del trabajador (pantallas de asistencia del
 *   Figma: TRA-Asistencia Dia, calendarios).
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos RF-58 Mostrar calendario de asistencia, D-18
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001)
 */

// 1. Importaciones
import { StyleSheet, Text, View } from 'react-native';

import { COLORES } from '@/constantes/colores';
import { COLORES_ASISTENCIA } from '@/constantes/textosAsistencia';
import { RADIOS, SOMBRAS, TIPOGRAFIA } from '@/constantes/tema';
import { obtenerIniciales } from '@/utilidades/obtenerIniciales';

// 2. Tipos e interfaces
interface TarjetaTrabajadorProps {
  nombre: string;
  oficio: string | null;
}

// 4. Componente principal
export default function TarjetaTrabajador({ nombre, oficio }: TarjetaTrabajadorProps) {
  return (
    <View style={estilos.tarjeta}>
      <View style={estilos.avatar}>
        <Text style={estilos.iniciales}>{obtenerIniciales(nombre)}</Text>
      </View>
      <View style={estilos.datos}>
        <Text style={estilos.nombre}>{nombre}</Text>
        {oficio ? <Text style={estilos.oficio}>{oficio}</Text> : null}
      </View>
    </View>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORES.superficie,
    borderRadius: RADIOS.tarjeta,
    padding: 16,
    ...SOMBRAS.tarjeta,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORES_ASISTENCIA.azulSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iniciales: { ...TIPOGRAFIA.etiqueta, color: COLORES_ASISTENCIA.azul },
  datos: { flex: 1 },
  nombre: { ...TIPOGRAFIA.titulo3, color: COLORES.texto },
  oficio: { ...TIPOGRAFIA.leyenda, color: COLORES.textoSutil },
});
