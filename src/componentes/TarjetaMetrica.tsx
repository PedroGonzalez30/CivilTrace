/**
 * @archivo TarjetaMetrica.tsx
 * @proyecto Civil Trace
 * @descripcion Tarjeta de una métrica de desempeño (Figma DesempenoTrabajador-Dueño, 2273:219):
 *   título, valor grande, barra dividida por colores y leyenda.
 * @autor Emilio Manuel Esquivel
 * @fecha 25/11/2026
 * @version 1.0.0
 * @requerimientos RF-64 Mostrar métricas de desempeño (SRS V4.0; D-30)
 * @historial 25/11/2026 - Emilio Manuel Esquivel - Creación (feature 005)
 */

// 1. Importaciones
import { StyleSheet, Text, View } from 'react-native';

import { COLORES } from '@/constantes/colores';
import { RADIOS, SOMBRAS, TIPOGRAFIA } from '@/constantes/tema';

// 2. Tipos e interfaces
export interface SegmentoMetrica {
  cantidad: number;
  color: string;
  etiqueta: string;
}

interface TarjetaMetricaProps {
  titulo: string;
  valor: string;
  colorValor: string;
  segmentos: SegmentoMetrica[];
  /** Texto bajo la barra; si no se da, se usa la leyenda de los segmentos. */
  detalle?: string;
}

// 3. Constantes del módulo
const COLOR_BARRA_VACIA = '#e5e7eb';

// 4. Componente principal
export default function TarjetaMetrica({
  titulo,
  valor,
  colorValor,
  segmentos,
  detalle,
}: TarjetaMetricaProps) {
  const total = segmentos.reduce((suma, segmento) => suma + segmento.cantidad, 0);

  return (
    <View style={estilos.tarjeta} accessibilityLabel={`${titulo}: ${valor}`}>
      <View style={estilos.fila}>
        <Text style={estilos.titulo}>{titulo}</Text>
        <Text style={[estilos.valor, { color: colorValor }]}>{valor}</Text>
      </View>
      <View style={estilos.barra}>
        {total === 0 ? (
          <View style={[estilos.segmento, { flex: 1, backgroundColor: COLOR_BARRA_VACIA }]} />
        ) : (
          segmentos
            .filter((segmento) => segmento.cantidad > 0)
            .map((segmento) => (
              <View
                key={segmento.etiqueta}
                style={[
                  estilos.segmento,
                  { flex: segmento.cantidad, backgroundColor: segmento.color },
                ]}
              />
            ))
        )}
      </View>
      {detalle ? (
        <Text style={estilos.detalle}>{detalle}</Text>
      ) : (
        <View style={estilos.leyenda}>
          {segmentos.map((segmento) => (
            <View key={segmento.etiqueta} style={estilos.elementoLeyenda}>
              <View style={[estilos.punto, { backgroundColor: segmento.color }]} />
              <Text style={estilos.detalle}>
                {segmento.cantidad} {segmento.etiqueta}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  tarjeta: {
    backgroundColor: COLORES.superficie,
    borderRadius: RADIOS.tarjeta,
    padding: 16,
    gap: 10,
    ...SOMBRAS.tarjeta,
  },
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titulo: {
    ...TIPOGRAFIA.titulo4,
    color: COLORES.texto,
  },
  valor: {
    ...TIPOGRAFIA.titulo2,
  },
  barra: {
    flexDirection: 'row',
    height: 10,
    borderRadius: RADIOS.pildora,
    overflow: 'hidden',
    gap: 2,
  },
  segmento: {
    height: '100%',
  },
  leyenda: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 14,
    rowGap: 4,
  },
  elementoLeyenda: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  punto: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  detalle: {
    ...TIPOGRAFIA.leyenda,
    color: COLORES.textoAtenuado,
  },
});
