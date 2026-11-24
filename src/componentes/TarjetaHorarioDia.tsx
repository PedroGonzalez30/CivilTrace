/**
 * @archivo TarjetaHorarioDia.tsx
 * @proyecto Civil Trace
 * @descripcion Tarjeta con la hora de entrada y de salida del día y su estado. Variante "chips"
 *   para el trabajador (TRA-Asistencia Dia, 96:329) y "columnas" para el supervisor
 *   (SUP_Asistencia_LeerQr, 2272:117) con el acceso a editar el horario.
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos RF-19 Registrar asistencia propia, RF-27 Registrar asistencia por el
 *   supervisor, D-06
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001)
 */

// 1. Importaciones
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { IconoLapiz } from '@/componentes/Iconos';
import { COLORES } from '@/constantes/colores';
import { COLORES_ASISTENCIA } from '@/constantes/textosAsistencia';
import { RADIOS, SOMBRAS, TIPOGRAFIA } from '@/constantes/tema';
import { formatearHora12 } from '@/utilidades/formatoHoras';

// 2. Tipos e interfaces
interface TarjetaHorarioDiaProps {
  horaEntrada: string | null;
  horaSalida: string | null;
  /** true = registrada (trabajador) o finalizado (supervisor). */
  entradaLista: boolean;
  salidaLista: boolean;
  variante: 'chips' | 'columnas';
  onEditarHorario?: () => void;
}

// 3. Constantes del módulo
const SIN_HORARIO = '—';

// 4. Componente principal
export default function TarjetaHorarioDia({
  horaEntrada,
  horaSalida,
  entradaLista,
  salidaLista,
  variante,
  onEditarHorario,
}: TarjetaHorarioDiaProps) {
  const entrada = horaEntrada ? formatearHora12(horaEntrada) : SIN_HORARIO;
  const salida = horaSalida ? formatearHora12(horaSalida) : SIN_HORARIO;

  if (variante === 'chips') {
    return (
      <View style={[estilos.tarjeta, estilos.tarjetaChips]}>
        <FilaChip etiqueta="Entrada" hora={entrada} lista={entradaLista} />
        <View style={estilos.divisor} />
        <FilaChip etiqueta="Salida" hora={salida} lista={salidaLista} />
      </View>
    );
  }

  return (
    <View style={estilos.tarjeta}>
      <View style={estilos.columnas}>
        <Columna etiqueta="Entrada" hora={entrada} lista={entradaLista} alineacion="flex-start" />
        <Columna etiqueta="Salida" hora={salida} lista={salidaLista} alineacion="flex-end" />
      </View>
      {onEditarHorario ? (
        <Pressable onPress={onEditarHorario} style={estilos.enlace} accessibilityRole="button">
          <IconoLapiz color={COLORES_ASISTENCIA.azul} />
          <Text style={estilos.textoEnlace}>Editar horario de la obra</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function FilaChip({ etiqueta, hora, lista }: { etiqueta: string; hora: string; lista: boolean }) {
  return (
    <View style={estilos.fila}>
      <View>
        <Text style={estilos.etiqueta}>{etiqueta}</Text>
        <Text style={estilos.hora}>{hora}</Text>
      </View>
      <View style={[estilos.chip, lista ? estilos.chipListo : estilos.chipPendiente]}>
        <Text
          style={[estilos.textoChip, lista ? estilos.textoChipListo : estilos.textoChipPendiente]}
        >
          {lista ? 'Registrada' : 'Pendiente'}
        </Text>
      </View>
    </View>
  );
}

function Columna({
  etiqueta,
  hora,
  lista,
  alineacion,
}: {
  etiqueta: string;
  hora: string;
  lista: boolean;
  alineacion: 'flex-start' | 'flex-end';
}) {
  return (
    <View style={{ alignItems: alineacion, gap: 4 }}>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>
      <Text style={estilos.hora}>{hora}</Text>
      <Text
        style={[
          estilos.estado,
          { color: lista ? COLORES_ASISTENCIA.verdeTexto : COLORES_ASISTENCIA.naranjaTexto },
        ]}
      >
        {lista ? 'Finalizado' : 'Pendiente'}
      </Text>
    </View>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  tarjeta: {
    backgroundColor: COLORES.superficie,
    borderRadius: RADIOS.tarjeta,
    padding: 16,
    gap: 12,
    ...SOMBRAS.tarjeta,
  },
  tarjetaChips: { borderWidth: 1, borderColor: '#d1d5db', ...SOMBRAS.tarjeta },
  columnas: { flexDirection: 'row', justifyContent: 'space-between' },
  fila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  divisor: { height: 1, backgroundColor: COLORES.bordeModal },
  etiqueta: { ...TIPOGRAFIA.leyenda, color: COLORES.textoSutil },
  hora: { ...TIPOGRAFIA.titulo3, color: COLORES.texto },
  estado: { ...TIPOGRAFIA.etiqueta },
  chip: { borderRadius: RADIOS.pildora, paddingHorizontal: 10, paddingVertical: 4 },
  chipPendiente: { backgroundColor: COLORES_ASISTENCIA.chipPendienteFondo },
  chipListo: { backgroundColor: COLORES.exitoFondo },
  textoChip: { ...TIPOGRAFIA.etiqueta },
  textoChipPendiente: { color: COLORES_ASISTENCIA.chipPendienteTexto },
  textoChipListo: { color: COLORES_ASISTENCIA.verdeTexto },
  enlace: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  textoEnlace: { ...TIPOGRAFIA.leyenda, color: COLORES_ASISTENCIA.azul },
});
