/**
 * @archivo AvisoSincronizacion.tsx
 * @proyecto Civil Trace
 * @descripcion Avisos de la lectura de QR (propuesta aprobada 2295:254, D-21): ámbar con los
 *   registros pendientes de envío y rojo con los que el servidor no guardó.
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos RNF-07 Captura sin conexión (D-14)
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001)
 */

// 1. Importaciones
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORES_ASISTENCIA } from '@/constantes/textosAsistencia';
import { RADIOS, TIPOGRAFIA } from '@/constantes/tema';
import { formatearInstante } from '@/utilidades/formatoHoras';

// 2. Tipos e interfaces
interface AvisoSincronizacionProps {
  sinConexion: boolean;
  pendientes: number;
  rechazados: number;
  generadoEn: string | null;
  zonaHoraria: string;
  onVerRechazados: () => void;
}

// 4. Componente principal
export default function AvisoSincronizacion({
  sinConexion,
  pendientes,
  rechazados,
  generadoEn,
  zonaHoraria,
  onVerRechazados,
}: AvisoSincronizacionProps) {
  const hayPendientes = sinConexion || pendientes > 0;
  const plural = (n: number, singular: string, pluralTexto: string) =>
    `${n} ${n === 1 ? singular : pluralTexto}`;

  return (
    <View style={estilos.contenedor}>
      {hayPendientes ? (
        <View style={[estilos.caja, estilos.ambar]}>
          <Text style={[estilos.titulo, estilos.textoAmbar]}>
            {sinConexion ? 'Sin conexión · ' : ''}
            {plural(pendientes, 'registro pendiente', 'registros pendientes')} de envío
          </Text>
          <Text style={[estilos.texto, estilos.textoAmbar]}>
            Se enviarán solos al volver la señal.
            {generadoEn
              ? ` Datos de la obra de hoy, ${formatearInstante(generadoEn, zonaHoraria)}.`
              : ''}
          </Text>
        </View>
      ) : null}
      {rechazados > 0 ? (
        <Pressable
          style={[estilos.caja, estilos.rojo]}
          onPress={onVerRechazados}
          accessibilityRole="button"
        >
          <Text style={[estilos.titulo, estilos.textoRojoTitulo]}>
            {plural(rechazados, 'registro no se guardó', 'registros no se guardaron')}
          </Text>
          <Text style={[estilos.texto, estilos.textoRojo]}>Toca para ver el detalle.</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  contenedor: { gap: 12 },
  caja: { borderRadius: RADIOS.accion, borderWidth: 1, padding: 12, gap: 4 },
  ambar: {
    backgroundColor: COLORES_ASISTENCIA.avisoFondo,
    borderColor: COLORES_ASISTENCIA.avisoBorde,
  },
  rojo: {
    backgroundColor: COLORES_ASISTENCIA.alertaFondo,
    borderColor: COLORES_ASISTENCIA.alertaBorde,
  },
  titulo: { ...TIPOGRAFIA.etiqueta },
  texto: { ...TIPOGRAFIA.leyenda },
  textoAmbar: { color: COLORES_ASISTENCIA.avisoTexto },
  textoRojoTitulo: { color: COLORES_ASISTENCIA.alertaTitulo },
  textoRojo: { color: COLORES_ASISTENCIA.alertaTexto },
});
