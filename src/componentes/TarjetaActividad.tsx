/**
 * @archivo TarjetaActividad.tsx
 * @proyecto Civil Trace
 * @descripcion Tarjeta que muestra una actividad activa o terminada dentro de una obra.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 20/11/2026
 * @version 1.0.0
 */

// 1. Importaciones
import { Pressable, StyleSheet, Text, View } from 'react-native';

import TarjetaFormulario from '@/componentes/TarjetaFormulario';
import { COLORES } from '@/constantes/colores';
import { TIPOGRAFIA } from '@/constantes/tema';
import type { ActividadResumen } from '@/tipos/actividad';

// 2. Tipos e interfaces
interface TarjetaActividadProps {
  actividad: ActividadResumen;
  onPresionar: (idActividad: string) => void;
}

// 3. Constantes del módulo
const MS_POR_DIA = 1000 * 60 * 60 * 24;
const ETIQUETA_RESPONSABLE = 'Responsable: ';
const ETIQUETA_ENTREGA = 'Entrega: ';
const ETIQUETA_TERMINADA = 'Terminada: ';

// 4. Funciones auxiliares
function calcularTextoRestante(fechaEntregaLocal: string): { texto: string; esVencida: boolean } {
  const partes = fechaEntregaLocal.split('/');
  if (partes.length !== 3) {
    return { texto: '', esVencida: false };
  }
  const dia = Number(partes[0]);
  const mes = Number(partes[1]);
  const anio = Number(partes[2]);
  if (!dia || !mes || !anio) {
    return { texto: '', esVencida: false };
  }

  const hoy = new Date();
  const inicioHoyUtc = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const entregaUtc = Date.UTC(anio, mes - 1, dia);
  const dias = Math.round((entregaUtc - inicioHoyUtc) / MS_POR_DIA);

  if (dias < 0) {
    const absDias = Math.abs(dias);
    return {
      texto: absDias === 1 ? 'Vencida hace 1 día' : `Vencida hace ${absDias} días`,
      esVencida: true,
    };
  }
  if (dias === 0) {
    return { texto: 'Vence hoy', esVencida: false };
  }
  if (dias === 1) {
    return { texto: '1 día restante', esVencida: false };
  }
  return { texto: `${dias} días restantes`, esVencida: false };
}

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
  restanteVencida: {
    color: COLORES.error,
  },
  lineaFecha: {
    ...TIPOGRAFIA.leyenda,
    color: COLORES.textoAtenuado,
  },
});
