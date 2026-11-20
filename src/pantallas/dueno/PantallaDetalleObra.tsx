/**
 * @archivo PantallaDetalleObra.tsx
 * @proyecto Civil Trace
 * @descripcion Pantalla con el detalle de una obra y los accesos a sus actividades y reportes.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 20/11/2026
 * @version 1.2.0
 * @requerimientos RF-47 Consultar detalle de obra
 */

import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  BotonPrincipal,
  CampoEtiquetado,
  EncabezadoApp,
  IconoFlechaIzquierda,
  TarjetaFormulario,
} from '@/componentes';
import { COLORES } from '@/constantes/colores';
import { RADIOS, SOMBRAS, TAMANOS, TIPOGRAFIA } from '@/constantes/tema';
import type { Obra } from '@/tipos/obra';

interface PantallaDetalleObraProps {
  obra: Obra;
  onRegresar: () => void;
  onAbrirActividades: (idObra: string) => void;
  onAbrirReportes: (idObra: string) => void;
}

export default function PantallaDetalleObra({
  obra,
  onRegresar,
  onAbrirActividades,
  onAbrirReportes,
}: PantallaDetalleObraProps) {
  return (
    <View style={estilos.contenedor}>
      <EncabezadoApp />
      <ScrollView contentContainerStyle={estilos.contenido}>
        <View style={estilos.bloqueTitulo}>
          <Pressable style={estilos.regresar} onPress={onRegresar}>
            <IconoFlechaIzquierda />
          </Pressable>
          <Text style={estilos.titulo}>{obra.nombre}</Text>
          <Text style={estilos.subtitulo}>Detalle de obra</Text>
        </View>
        <View style={estilos.tarjetas}>
          <TarjetaFormulario estilo={estilos.tarjeta}>
            <CampoEtiquetado etiqueta="Descripción" valor={obra.descripcion} />
          </TarjetaFormulario>
          <TarjetaFormulario estilo={estilos.tarjeta}>
            <CampoEtiquetado etiqueta="Dirección" valor={obra.direccion} />
          </TarjetaFormulario>
          <TarjetaFormulario estilo={estilos.tarjeta}>
            <CampoEtiquetado etiqueta="Fecha de inicio" valor={obra.fechaInicio} />
          </TarjetaFormulario>
          <TarjetaFormulario estilo={estilos.tarjeta}>
            <CampoEtiquetado etiqueta="Fecha de fin" valor={obra.fechaFinal} />
          </TarjetaFormulario>
          <View style={estilos.fila}>
            <TarjetaFormulario estilo={[estilos.tarjeta, estilos.mitad]}>
              <CampoEtiquetado etiqueta="Supervisores" valor={obra.supervisor} />
            </TarjetaFormulario>
            <TarjetaFormulario estilo={[estilos.tarjeta, estilos.mitad]}>
              <CampoEtiquetado etiqueta="Cliente" valor={obra.cliente} />
            </TarjetaFormulario>
          </View>
        </View>
        <View style={estilos.acciones}>
          <Text style={estilos.tituloAcciones}>Acciones</Text>
          <Text style={estilos.textoAcciones}>Gestiona el proceso de la obra</Text>
          <View style={estilos.botones}>
            <BotonPrincipal
              estilo={estilos.mitad}
              variante="marca"
              etiqueta="Actividades de la obra"
              onPresionar={() => onAbrirActividades(obra.id)}
            />
            <BotonPrincipal
              estilo={estilos.mitad}
              variante="marca"
              etiqueta="Reportes de la obra"
              onPresionar={() => onAbrirReportes(obra.id)}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: COLORES.pantalla,
  },
  contenido: {
    paddingBottom: 24,
  },
  bloqueTitulo: {
    height: 94,
    alignItems: 'center',
    paddingTop: 9,
  },
  regresar: {
    position: 'absolute',
    top: 15,
    left: 13,
    width: TAMANOS.botonRegresar,
    height: TAMANOS.botonRegresar,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIOS.pildora,
    backgroundColor: COLORES.superficie,
    ...SOMBRAS.botonRegresar,
  },
  titulo: {
    ...TIPOGRAFIA.titulo1,
    color: COLORES.texto,
  },
  subtitulo: {
    marginTop: -6,
    ...TIPOGRAFIA.leyenda,
    color: COLORES.textoAtenuado,
  },
  tarjetas: {
    gap: 9,
    paddingHorizontal: 16,
  },
  tarjeta: {
    gap: 0,
    padding: 16,
  },
  fila: {
    flexDirection: 'row',
    gap: 16,
  },
  mitad: {
    flex: 1,
  },
  acciones: {
    marginTop: 18,
    paddingHorizontal: 16,
  },
  tituloAcciones: {
    paddingLeft: 3,
    ...TIPOGRAFIA.titulo3,
    color: COLORES.texto,
  },
  textoAcciones: {
    marginTop: 11,
    paddingLeft: 3,
    ...TIPOGRAFIA.leyenda,
    color: COLORES.textoAtenuado,
  },
  botones: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
});
