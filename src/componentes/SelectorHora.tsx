/**
 * @archivo SelectorHora.tsx
 * @proyecto Civil Trace
 * @descripcion Campo de hora con ícono de reloj (Figma SUP_HorarioObra) que abre una lista de
 *   horas cada 15 minutos. Evita agregar una librería de selector de fecha.
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos D-06
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001)
 */

// 1. Importaciones
import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { COLORES } from '@/constantes/colores';
import { COLORES_ASISTENCIA } from '@/constantes/textosAsistencia';
import { RADIOS, TIPOGRAFIA } from '@/constantes/tema';
import { formatearHoraCampo } from '@/utilidades/formatoHoras';

// 2. Tipos e interfaces
interface SelectorHoraProps {
  etiqueta: string;
  // null = todavía sin hora (por ejemplo, salida no registrada).
  valor: string | null;
  onCambiar: (hora: string) => void;
}

// 3. Constantes del módulo
const PRIMERA_HORA = 5;
const ULTIMA_HORA = 22;
const PASO_MINUTOS = 15;
const SIN_HORA = '—';
const INDICE_POR_DEFECTO = 12;
const HORAS = Array.from({ length: (ULTIMA_HORA - PRIMERA_HORA + 1) * 4 }, (_, indice) => {
  const minutos = PRIMERA_HORA * 60 + indice * PASO_MINUTOS;
  return `${String(Math.floor(minutos / 60)).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`;
});

// 4. Componente principal
export default function SelectorHora({ etiqueta, valor, onCambiar }: SelectorHoraProps) {
  const [abierto, setAbierto] = useState(false);

  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>
      <Pressable
        style={estilos.campo}
        onPress={() => setAbierto(true)}
        accessibilityRole="button"
        accessibilityLabel={`${etiqueta}: ${valor ? formatearHoraCampo(valor) : SIN_HORA}`}
      >
        <Text style={estilos.valor}>{valor ? formatearHoraCampo(valor) : SIN_HORA}</Text>
        <Svg
          width={20}
          height={20}
          viewBox="0 0 24 24"
          fill="none"
          stroke={COLORES.textoSutil}
          strokeWidth={2}
        >
          <Circle cx={12} cy={12} r={10} />
          <Path d="M12 6v6l4 2" />
        </Svg>
      </Pressable>
      <Modal
        visible={abierto}
        transparent
        animationType="fade"
        onRequestClose={() => setAbierto(false)}
      >
        <Pressable style={estilos.fondo} onPress={() => setAbierto(false)}>
          <View style={estilos.lista}>
            <Text style={estilos.tituloLista}>{etiqueta}</Text>
            <FlatList
              data={HORAS}
              keyExtractor={(hora) => hora}
              initialScrollIndex={valor ? Math.max(0, HORAS.indexOf(valor)) : INDICE_POR_DEFECTO}
              getItemLayout={(_, indice) => ({ length: 44, offset: 44 * indice, index: indice })}
              renderItem={({ item }) => (
                <Pressable
                  style={[estilos.opcion, item === valor && estilos.opcionActiva]}
                  onPress={() => {
                    onCambiar(item);
                    setAbierto(false);
                  }}
                >
                  <Text style={[estilos.textoOpcion, item === valor && estilos.textoActivo]}>
                    {formatearHoraCampo(item)}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  contenedor: { flex: 1, gap: 8 },
  etiqueta: { ...TIPOGRAFIA.leyenda, color: COLORES.textoSutil },
  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORES.borde,
    borderRadius: RADIOS.entrada,
    backgroundColor: COLORES.fondoEntrada,
    paddingHorizontal: 12,
    height: 52,
  },
  valor: { ...TIPOGRAFIA.etiqueta, fontSize: 16, color: COLORES.texto },
  fondo: {
    flex: 1,
    backgroundColor: COLORES_ASISTENCIA.fondoOscuro,
    justifyContent: 'center',
    padding: 40,
  },
  lista: {
    backgroundColor: COLORES.superficie,
    borderRadius: RADIOS.modal,
    maxHeight: 420,
    padding: 12,
  },
  tituloLista: { ...TIPOGRAFIA.titulo3, color: COLORES.texto, marginBottom: 8 },
  opcion: {
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: RADIOS.accion,
  },
  opcionActiva: { backgroundColor: COLORES_ASISTENCIA.azulChip },
  textoOpcion: { ...TIPOGRAFIA.subtitulo, color: COLORES.texto },
  textoActivo: { color: COLORES_ASISTENCIA.azul },
});
