/**
 * @archivo HojaDetalleDia.tsx
 * @proyecto Civil Trace
 * @descripcion Hoja con el detalle de un día del calendario (Figma
 *   SUP_CalendarioTrabajador_DetalleDia 2272:523 con el $ de la propuesta 2295:392): tipo de
 *   jornada, horas, motivo, efecto en el pago, anotación, quién registró y modificaciones.
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos RF-56 Mostrar días con descuento, RF-58 Mostrar calendario de asistencia,
 *   D-13
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001)
 */

// 1. Importaciones
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import BotonPrincipal from '@/componentes/BotonPrincipal';
import { COLORES } from '@/constantes/colores';
import {
  COLORES_ASISTENCIA,
  ETIQUETAS_EFECTO_PAGO,
  ETIQUETAS_EFECTO_PAGO_DETALLE,
  ETIQUETAS_MOTIVO,
  ETIQUETAS_TIPO_JORNADA,
} from '@/constantes/textosAsistencia';
import { RADIOS, TIPOGRAFIA } from '@/constantes/tema';
import type {
  CambioAsistencia,
  DetalleDia,
  EfectoPago,
  MotivoAsistencia,
  TipoJornada,
} from '@/tipos/asistencia';
import { formatearFechaLarga, formatearInstante } from '@/utilidades/formatoHoras';

// 2. Tipos e interfaces
interface HojaDetalleDiaProps {
  detalle: DetalleDia;
  zonaHoraria: string;
  onCerrar: () => void;
}

// 3. Constantes del módulo
const NOMBRES_CAMPO: Record<string, string> = {
  entradaEn: 'entrada',
  salidaEn: 'salida',
  tipoJornada: 'tipo de jornada',
  motivo: 'motivo',
  efectoPago: 'efecto en el pago',
  anotacion: 'anotación',
};

// 4. Componente principal
export default function HojaDetalleDia({ detalle, zonaHoraria, onCerrar }: HojaDetalleDiaProps) {
  const hora = (instante: string | undefined) =>
    instante ? formatearInstante(instante, zonaHoraria) : '—';

  // Las horas se muestran en formato de 12 horas y los catálogos con su etiqueta en español.
  const describirValor = (campo: string, valor: string | null) => {
    if (valor === null) {
      return '—';
    }
    if (campo === 'entradaEn' || campo === 'salidaEn') {
      return formatearInstante(valor, zonaHoraria);
    }
    if (campo === 'tipoJornada') {
      return ETIQUETAS_TIPO_JORNADA[valor as TipoJornada] ?? valor;
    }
    if (campo === 'motivo') {
      return ETIQUETAS_MOTIVO[valor as MotivoAsistencia] ?? valor;
    }
    if (campo === 'efectoPago') {
      return ETIQUETAS_EFECTO_PAGO[valor as EfectoPago] ?? valor;
    }
    return valor;
  };
  const describirCambio = (cambio: CambioAsistencia) =>
    `Modificado: ${NOMBRES_CAMPO[cambio.campo] ?? cambio.campo} original ${describirValor(cambio.campo, cambio.valorAnterior)} → ${describirValor(cambio.campo, cambio.valorNuevo)}${cambio.motivo ? ` (${cambio.motivo})` : ''}`;

  const colorChip =
    detalle.tipoJornada === 'COMPLETA'
      ? COLORES_ASISTENCIA.verdeTexto
      : detalle.tipoJornada === 'FALTA'
        ? COLORES_ASISTENCIA.rojoTexto
        : COLORES_ASISTENCIA.naranjaTexto;
  const [anio, mes, dia] = (detalle.registradoEn ?? '').slice(0, 10).split('-');

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onCerrar}>
      <Pressable
        style={estilos.fondo}
        onPress={onCerrar}
        accessibilityLabel="Cerrar detalle del día"
      />
      <View style={estilos.hoja}>
        <View style={estilos.agarradera} />
        <ScrollView contentContainerStyle={estilos.contenido}>
          <View style={estilos.cabecera}>
            <Text style={estilos.titulo}>{formatearFechaLarga(detalle.fecha)}</Text>
            {detalle.tipoJornada ? (
              <View
                style={[estilos.chip, { backgroundColor: COLORES_ASISTENCIA.chipPendienteFondo }]}
              >
                <Text style={[estilos.textoChip, { color: colorChip }]}>
                  {ETIQUETAS_TIPO_JORNADA[detalle.tipoJornada]}
                </Text>
              </View>
            ) : null}
          </View>
          <Fila etiqueta="Entrada" valor={hora(detalle.entrada?.hora)} />
          <Fila etiqueta="Salida" valor={hora(detalle.salida?.hora)} />
          <Fila etiqueta="Motivo" valor={detalle.motivo ? ETIQUETAS_MOTIVO[detalle.motivo] : '—'} />
          <View style={estilos.fila}>
            <Text style={estilos.etiqueta}>Efecto en el pago</Text>
            <View style={estilos.valorConInsignia}>
              {detalle.conDescuento ? (
                <View style={estilos.insignia}>
                  <Text style={estilos.signo}>$</Text>
                </View>
              ) : null}
              <Text style={estilos.valor}>{ETIQUETAS_EFECTO_PAGO_DETALLE[detalle.efectoPago]}</Text>
            </View>
          </View>
          {detalle.anotacion ? (
            <View style={estilos.anotacion}>
              <Text style={estilos.etiqueta}>Anotación</Text>
              <Text style={estilos.textoAnotacion}>{detalle.anotacion}</Text>
            </View>
          ) : null}
          {detalle.registradoPor ? (
            <Text style={estilos.pie}>
              Registrado por {detalle.registradoPor}
              {detalle.registradoEn ? ` · ${dia}/${mes}/${anio} ${hora(detalle.registradoEn)}` : ''}
            </Text>
          ) : null}
          {detalle.cambios.map((cambio) => (
            <Text key={`${cambio.campo}-${cambio.fecha}`} style={estilos.pie}>
              {describirCambio(cambio)}
            </Text>
          ))}
          <BotonPrincipal variante="contorno" etiqueta="Cerrar" onPresionar={onCerrar} />
        </ScrollView>
      </View>
    </Modal>
  );
}

function Fila({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <View style={estilos.fila}>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>
      <Text style={estilos.valor}>{valor}</Text>
    </View>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: COLORES_ASISTENCIA.fondoOscuro },
  hoja: {
    backgroundColor: COLORES.superficie,
    borderTopLeftRadius: RADIOS.encabezado,
    borderTopRightRadius: RADIOS.encabezado,
    maxHeight: '75%',
    paddingTop: 8,
  },
  agarradera: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORES.borde,
    marginBottom: 8,
  },
  contenido: { paddingHorizontal: 24, paddingBottom: 32, gap: 12 },
  cabecera: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titulo: { ...TIPOGRAFIA.titulo3, color: COLORES.texto },
  chip: { borderRadius: RADIOS.pildora, paddingHorizontal: 12, paddingVertical: 4 },
  textoChip: { ...TIPOGRAFIA.etiqueta },
  fila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  etiqueta: { ...TIPOGRAFIA.leyenda, color: COLORES.textoSutil },
  valor: { ...TIPOGRAFIA.etiqueta, color: COLORES.texto },
  valorConInsignia: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  insignia: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORES_ASISTENCIA.insignia,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signo: {
    fontSize: 10,
    lineHeight: 12,
    fontFamily: TIPOGRAFIA.etiqueta.fontFamily,
    color: COLORES_ASISTENCIA.insignia,
  },
  anotacion: {
    backgroundColor: COLORES.fondoEntrada,
    borderRadius: RADIOS.accion,
    padding: 12,
    gap: 4,
  },
  textoAnotacion: { ...TIPOGRAFIA.leyenda, color: COLORES.texto },
  pie: { ...TIPOGRAFIA.leyenda, fontSize: 12, color: COLORES.textoSutil },
});
