/**
 * @archivo TarjetaActividad.tsx
 * @proyecto Civil Trace
 * @descripcion Tarjeta que muestra una actividad activa o terminada dentro de una obra.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 20/11/2026
 * @version 1.1.0
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Aviso "Pendiente de aprobación" cuando hay una
 *   entrega en revisión; el cálculo de días restantes pasa a utilidades (feature 003)
 */

// 1. Importaciones
import { Pressable, StyleSheet, Text, View } from 'react-native';

import TarjetaFormulario from '@/componentes/TarjetaFormulario';
import { COLORES } from '@/constantes/colores';
import { COLORES_ASISTENCIA } from '@/constantes/textosAsistencia';
import { RADIOS, TIPOGRAFIA } from '@/constantes/tema';
import type { ActividadResumen } from '@/tipos/actividad';
import { calcularTextoRestante } from '@/utilidades/diasRestantes';

// 2. Tipos e interfaces
interface TarjetaActividadProps {
  actividad: ActividadResumen;
  onPresionar: (idActividad: string) => void;
}

// 3. Constantes del módulo
const ETIQUETA_RESPONSABLE = 'Responsable: ';
const ETIQUETA_ENTREGA = 'Entrega: ';
const ETIQUETA_TERMINADA = 'Terminada: ';

// 5. Componente principal
export default function TarjetaActividad({ actividad, onPresionar }: TarjetaActividadProps) {
  const esTerminada = actividad.estado === 'TERMINADA';
  const restante = esTerminada ? null : calcularTextoRestante(actividad.fechaEntrega);

  const manejarPresion = () => {
    onPresionar(actividad.id);
  };

  return (
    <Pressable onPress={manejarPresion}>
      <TarjetaFormulario estilo={estilos.tarjeta}>
        <Text style={estilos.titulo}>{actividad.nombre}</Text>
        {actividad.enRevision && !esTerminada ? (
          <Text style={estilos.enRevision}>Pendiente de aprobación</Text>
        ) : null}
        <View style={estilos.meta}>
          <Text style={estilos.lineaSecundaria}>
            {ETIQUETA_RESPONSABLE}
            <Text style={estilos.valorDestacado}>{actividad.responsable}</Text>
          </Text>
          {restante && restante.texto ? (
            <Text style={[estilos.restante, restante.esVencida && estilos.restanteVencida]}>
              {restante.texto}
            </Text>
          ) : null}
          {esTerminada ? (
            <Text style={estilos.lineaFecha}>
              {ETIQUETA_TERMINADA}
              {actividad.fechaTerminada ?? actividad.fechaEntrega}
            </Text>
          ) : (
            <Text style={estilos.lineaFecha}>
              {ETIQUETA_ENTREGA}
              {actividad.fechaEntrega}
            </Text>
          )}
        </View>
      </TarjetaFormulario>
    </Pressable>
  );
}

// 6. Estilos
const estilos = StyleSheet.create({
  tarjeta: {
    gap: 6,
    padding: 16,
  },
  titulo: {
    ...TIPOGRAFIA.titulo4,
    color: COLORES.texto,
  },
  meta: {
    gap: 2,
  },
  lineaSecundaria: {
    ...TIPOGRAFIA.leyenda,
    color: COLORES.textoAtenuado,
  },
  valorDestacado: {
    ...TIPOGRAFIA.etiqueta,
    color: COLORES.texto,
  },
  restante: {
    ...TIPOGRAFIA.etiqueta,
    color: COLORES.marca,
  },
  enRevision: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: RADIOS.pildora,
    overflow: 'hidden',
    backgroundColor: COLORES_ASISTENCIA.chipPendienteFondo,
    ...TIPOGRAFIA.leyenda,
    color: COLORES_ASISTENCIA.chipPendienteTexto,
  },
  restanteVencida: {
    color: COLORES.error,
  },
  lineaFecha: {
    ...TIPOGRAFIA.leyenda,
    color: COLORES.textoAtenuado,
  },
});
