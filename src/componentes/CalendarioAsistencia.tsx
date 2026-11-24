/**
 * @archivo CalendarioAsistencia.tsx
 * @proyecto Civil Trace
 * @descripcion Calendario mensual de asistencia (Figma SUP_CalendarioTrabajador 2272:354 y
 *   TRA-HIstorial asistencia 96:389): verde, naranja o rojo según el día, insignia $ en los días con
 *   descuento (D-13) y flechas para cambiar de mes.
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos RF-56 Mostrar días con descuento, RF-58 Mostrar calendario de asistencia, D-08
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001)
 */

// 1. Importaciones
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { IconoChevronDerecha, IconoChevronIzquierda } from '@/componentes/Iconos';
import { COLORES } from '@/constantes/colores';
import {
  COLORES_ASISTENCIA,
  COLORES_DIA,
  ETIQUETAS_TIPO_JORNADA,
  NOMBRES_MES,
} from '@/constantes/textosAsistencia';
import { RADIOS, TIPOGRAFIA } from '@/constantes/tema';
import type { DiaCalendario } from '@/tipos/asistencia';
import { formatearMes, moverMes } from '@/utilidades/formatoHoras';

// 2. Tipos e interfaces
interface CalendarioAsistenciaProps {
  mes: string;
  dias: DiaCalendario[];
  onCambiarMes: (mes: string) => void;
  onTocarDia: (dia: DiaCalendario) => void;
}

// 3. Constantes del módulo
const ENCABEZADOS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];
const DIAS_POR_SEMANA = 7;
const TAMANO_CELDA = 36;

// 4. Componente principal
export default function CalendarioAsistencia({
  mes,
  dias,
  onCambiarMes,
  onTocarDia,
}: CalendarioAsistenciaProps) {
  const [anio = 0, numeroMes = 1] = mes.split('-').map(Number);
  const primerDiaSemana = new Date(Date.UTC(anio, numeroMes - 1, 1)).getUTCDay();
  const diasEnMes = new Date(Date.UTC(anio, numeroMes, 0)).getUTCDate();
  const nombreMes = (NOMBRES_MES[numeroMes - 1] ?? '').toLowerCase();
  const porFecha = new Map(dias.map((dia) => [dia.fecha, dia]));
  const celdas = Math.ceil((primerDiaSemana + diasEnMes) / DIAS_POR_SEMANA) * DIAS_POR_SEMANA;

  return (
    <View style={estilos.contenedor}>
      <View style={estilos.cabecera}>
        <Pressable
          style={estilos.flecha}
          onPress={() => onCambiarMes(moverMes(mes, -1))}
          accessibilityLabel="Mes anterior"
        >
          <IconoChevronIzquierda color={COLORES.textoAtenuado} />
        </Pressable>
        <Text style={estilos.mes}>{formatearMes(mes)}</Text>
        <Pressable
          style={estilos.flecha}
          onPress={() => onCambiarMes(moverMes(mes, 1))}
          accessibilityLabel="Mes siguiente"
        >
          <IconoChevronDerecha color={COLORES.textoAtenuado} />
        </Pressable>
      </View>
      <View style={estilos.rejilla}>
        {ENCABEZADOS.map((encabezado) => (
          <Text key={encabezado} style={[estilos.celda, estilos.encabezado]}>
            {encabezado}
          </Text>
        ))}
        {Array.from({ length: celdas }, (_, indice) => {
          const numero = indice - primerDiaSemana + 1;
          if (numero < 1 || numero > diasEnMes) {
            return <View key={indice} style={estilos.celda} />;
          }
          const fecha = `${mes}-${String(numero).padStart(2, '0')}`;
          const dia = porFecha.get(fecha);
          const etiqueta = dia
            ? `${numero} de ${nombreMes}: ${ETIQUETAS_TIPO_JORNADA[dia.tipoJornada]}${dia.conDescuento ? ', con descuento' : ''}`
            : `${numero} de ${nombreMes}`;
          return (
            <Pressable
              key={indice}
              style={[estilos.celda, dia && { backgroundColor: COLORES_DIA[dia.color] }]}
              onPress={dia ? () => onTocarDia(dia) : undefined}
              disabled={!dia}
              accessibilityLabel={etiqueta}
            >
              <Text style={[estilos.numero, dia && estilos.numeroConColor]}>{numero}</Text>
              {dia?.conDescuento ? (
                <View style={estilos.insignia}>
                  <Text style={estilos.signo}>$</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
      <View style={estilos.leyenda}>
        <ElementoLeyenda color={COLORES_DIA.VERDE} texto="Asistencia" />
        <ElementoLeyenda color={COLORES_DIA.NARANJA} texto="Retardo / media" />
        <ElementoLeyenda color={COLORES_DIA.ROJO} texto="Falta" />
        <View style={estilos.elementoLeyenda}>
          <View style={[estilos.insignia, estilos.insigniaLeyenda]}>
            <Text style={estilos.signo}>$</Text>
          </View>
          <Text style={estilos.textoLeyenda}>Descuento</Text>
        </View>
      </View>
    </View>
  );
}

function ElementoLeyenda({ color, texto }: { color: string; texto: string }) {
  return (
    <View style={estilos.elementoLeyenda}>
      <View style={[estilos.punto, { backgroundColor: color }]} />
      <Text style={estilos.textoLeyenda}>{texto}</Text>
    </View>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  contenedor: { gap: 12 },
  cabecera: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  flecha: {
    width: 28,
    height: 28,
    borderWidth: 1,
    borderColor: '#7a8695',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mes: { ...TIPOGRAFIA.etiqueta, color: COLORES.texto },
  rejilla: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  celda: {
    width: `${100 / DIAS_POR_SEMANA}%`,
    height: TAMANO_CELDA,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIOS.casilla,
  },
  encabezado: {
    ...TIPOGRAFIA.leyenda,
    color: COLORES.textoSutil,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  numero: { ...TIPOGRAFIA.leyenda, color: COLORES.texto },
  numeroConColor: { color: COLORES.superficie, fontFamily: TIPOGRAFIA.etiqueta.fontFamily },
  insignia: {
    position: 'absolute',
    top: -4,
    right: 0,
    width: 15,
    height: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORES_ASISTENCIA.insignia,
    backgroundColor: COLORES.superficie,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insigniaLeyenda: { position: 'relative', top: 0 },
  signo: {
    fontSize: 10,
    lineHeight: 12,
    fontFamily: TIPOGRAFIA.etiqueta.fontFamily,
    color: COLORES_ASISTENCIA.insignia,
  },
  leyenda: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  elementoLeyenda: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  punto: { width: 10, height: 10, borderRadius: 5 },
  textoLeyenda: { ...TIPOGRAFIA.leyenda, fontSize: 12, color: COLORES.textoAtenuado },
});
