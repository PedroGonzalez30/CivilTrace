/**
 * @archivo TarjetaEntrega.tsx
 * @proyecto Civil Trace
 * @descripcion Tarjeta de una entrega enviada al cliente en la pantalla de reportes: periodo,
 *   estado, respuesta del cliente y botones para descargar el reporte o generar el acta.
 * @autor Emilio Manuel Esquivel
 * @fecha 24/11/2026
 * @version 1.0.0
 * @requerimientos RF-13 Enviar entrega al cliente, RF-15 Registrar observaciones del cliente,
 *   RF-16 Generar acta de entrega-recepción
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Creación (feature 004)
 */

// 1. Importaciones
import { Pressable, StyleSheet, Text, View } from 'react-native';

import TarjetaFormulario from '@/componentes/TarjetaFormulario';
import { COLORES } from '@/constantes/colores';
import { RADIOS, TIPOGRAFIA } from '@/constantes/tema';
import type { DocumentoEntrega, Entrega, EstadoEntrega } from '@/tipos/entrega';

// 2. Tipos e interfaces
interface TarjetaEntregaProps {
  entrega: Entrega;
  estaDescargando: boolean;
  onDescargar: (documento: DocumentoEntrega) => void;
}

// 3. Constantes del módulo
const ETIQUETAS_ESTADO: Record<EstadoEntrega, string> = {
  ENVIADA: 'Enviada',
  ACEPTADA: 'Aceptada',
  CON_OBSERVACIONES: 'Con observaciones',
};

// 4. Componente principal
export default function TarjetaEntrega({
  entrega,
  estaDescargando,
  onDescargar,
}: TarjetaEntregaProps) {
  const estiloInsignia =
    entrega.estado === 'ACEPTADA'
      ? estilos.insigniaAceptada
      : entrega.estado === 'CON_OBSERVACIONES'
        ? estilos.insigniaObservaciones
        : estilos.insigniaEnviada;

  return (
    <TarjetaFormulario estilo={estilos.tarjeta}>
      <View style={estilos.filaEncabezado}>
        <Text style={estilos.periodo}>
          {entrega.fechaInicio} — {entrega.fechaFin}
        </Text>
        <View style={[estilos.insignia, estiloInsignia]}>
          <Text style={estilos.textoInsignia}>{ETIQUETAS_ESTADO[entrega.estado]}</Text>
        </View>
      </View>
      <Text style={estilos.meta}>
        {entrega.actividades} actividades · {entrega.fotos} fotografías
        {entrega.enviadaPor ? ` · Envió: ${entrega.enviadaPor}` : ''}
      </Text>
      {entrega.nombreCliente ? (
        <Text style={estilos.meta}>
          {entrega.estado === 'ACEPTADA' ? 'Aceptó' : 'Respondió'}: {entrega.nombreCliente}
        </Text>
      ) : null}
      {entrega.observaciones ? (
        <View style={estilos.cajaObservaciones}>
          <Text style={estilos.etiquetaObservaciones}>Observaciones del cliente</Text>
          <Text style={estilos.textoObservaciones}>{entrega.observaciones}</Text>
        </View>
      ) : null}
      <View style={estilos.acciones}>
        <Pressable
          disabled={estaDescargando}
          onPress={() => onDescargar('reporte')}
          accessibilityRole="button"
        >
          <Text style={estilos.enlace}>Descargar reporte</Text>
        </Pressable>
        {entrega.tieneActa ? (
          <Pressable
            disabled={estaDescargando}
            onPress={() => onDescargar('acta')}
            accessibilityRole="button"
          >
            <Text style={estilos.enlace}>Generar acta</Text>
          </Pressable>
        ) : null}
      </View>
    </TarjetaFormulario>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  tarjeta: {
    padding: 16,
    gap: 6,
  },
  filaEncabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  periodo: {
    flex: 1,
    ...TIPOGRAFIA.titulo4,
    color: COLORES.texto,
  },
  insignia: {
    borderWidth: 1,
    borderRadius: RADIOS.pildora,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  insigniaEnviada: {
    backgroundColor: COLORES.fondoEntrada,
    borderColor: COLORES.borde,
  },
  insigniaAceptada: {
    backgroundColor: COLORES.exitoFondo,
    borderColor: COLORES.exitoBorde,
  },
  insigniaObservaciones: {
    backgroundColor: COLORES.fondoFila,
    borderColor: COLORES.error,
  },
  textoInsignia: {
    ...TIPOGRAFIA.etiqueta,
    color: COLORES.texto,
  },
  meta: {
    ...TIPOGRAFIA.leyenda,
    color: COLORES.textoAtenuado,
  },
  cajaObservaciones: {
    marginTop: 4,
    padding: 10,
    borderRadius: RADIOS.accion,
    backgroundColor: COLORES.fondoFila,
    gap: 2,
  },
  etiquetaObservaciones: {
    ...TIPOGRAFIA.etiqueta,
    color: COLORES.error,
  },
  textoObservaciones: {
    ...TIPOGRAFIA.leyenda,
    color: COLORES.texto,
  },
  acciones: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  enlace: {
    ...TIPOGRAFIA.etiqueta,
    color: COLORES.marca,
  },
});
