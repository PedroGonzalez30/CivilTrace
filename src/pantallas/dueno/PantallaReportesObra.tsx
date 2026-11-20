/**
 * @archivo PantallaReportesObra.tsx
 * @proyecto Civil Trace
 * @descripcion Pantalla de reportes de una obra: filtro por fecha, vista previa del historial
 *              de entregables por actividad y generación de reporte PDF real.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 20/11/2026
 * @version 1.0.0
 */

import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  BotonPrincipal,
  EncabezadoApp,
  IconoFlechaIzquierda,
  TarjetaFormulario,
} from '@/componentes';
import { COLORES } from '@/constantes/colores';
import { RADIOS, SOMBRAS, TAMANOS, TIPOGRAFIA } from '@/constantes/tema';
import {
  cargarDatosReporteObra,
  generarYCompartirPdfReporte,
  type DatosReporteObra,
} from '@/servicios/servicioReportes';
import type { Obra } from '@/tipos/obra';
import { aplicarMascaraFecha } from '@/utilidades/formatearFecha';

interface PantallaReportesObraProps {
  tokenAcceso: string;
  obra: Obra;
  onRegresar: () => void;
}

export default function PantallaReportesObra({
  tokenAcceso,
  obra,
  onRegresar,
}: PantallaReportesObraProps) {
  const [fechaInicio, setFechaInicio] = useState(obra.fechaInicio);
  const [fechaFin, setFechaFin] = useState(obra.fechaFinal);
  const [fechaInicioBorrador, setFechaInicioBorrador] = useState(obra.fechaInicio);
  const [fechaFinBorrador, setFechaFinBorrador] = useState(obra.fechaFinal);
  const [filtroVisible, setFiltroVisible] = useState(false);
  const [vistaPreviaVisible, setVistaPreviaVisible] = useState(false);

  const [reporte, setReporte] = useState<DatosReporteObra | null>(null);
  const [cargando, setCargando] = useState(true);
  const [generandoPdf, setGenerandoPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarReporte = useCallback(
    async (inicio: string, fin: string) => {
      setCargando(true);
      setError(null);
      try {
        const datos = await cargarDatosReporteObra(tokenAcceso, obra, inicio, fin);
        setReporte(datos);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar el reporte de la obra.');
      } finally {
        setCargando(false);
      }
    },
    [tokenAcceso, obra],
  );

  useEffect(() => {
    void cargarReporte(fechaInicio, fechaFin);
  }, [cargarReporte, fechaInicio, fechaFin]);

  const manejarGenerarPdf = async () => {
    if (!reporte) {
      return;
    }
    setGenerandoPdf(true);
    try {
      await generarYCompartirPdfReporte(reporte);
    } catch {
      Alert.alert('Error', 'No se pudo generar el archivo PDF del reporte.');
    } finally {
      setGenerandoPdf(false);
    }
  };

  const manejarAplicarFiltro = () => {
    setFechaInicio(fechaInicioBorrador);
    setFechaFin(fechaFinBorrador);
    setFiltroVisible(false);
  };

  return (
    <View style={estilos.contenedor}>
      <EncabezadoApp />
      <ScrollView contentContainerStyle={estilos.contenido} showsVerticalScrollIndicator={false}>
        <View style={estilos.bloqueTitulo}>
          <Pressable style={estilos.regresar} onPress={onRegresar} accessibilityLabel="Regresar">
            <IconoFlechaIzquierda />
          </Pressable>
          <Text style={estilos.titulo}>Reportes</Text>
          <Text style={estilos.subtitulo}>Historial de avances y entregables — {obra.nombre}</Text>
        </View>

        <View style={estilos.barraAcciones}>
          <BotonPrincipal
            estilo={estilos.botonAccion}
            variante="marca"
            etiqueta={generandoPdf ? 'Generando PDF...' : 'PDF'}
            onPresionar={manejarGenerarPdf}
            deshabilitado={cargando || generandoPdf || !reporte}
          />
          <BotonPrincipal
            estilo={estilos.botonAccion}
            variante="secundario"
            etiqueta="Vista previa"
            onPresionar={() => setVistaPreviaVisible(true)}
            deshabilitado={cargando || !reporte}
          />
          <Pressable
            style={estilos.botonFiltro}
            onPress={() => {
              setFechaInicioBorrador(fechaInicio);
              setFechaFinBorrador(fechaFin);
              setFiltroVisible(true);
            }}
          >
            <Text style={estilos.textoFiltro}>Filtro</Text>
          </Pressable>
        </View>

        {cargando ? (
          <View style={estilos.centro}>
            <ActivityIndicator color={COLORES.marca} />
          </View>
        ) : error ? (
          <TarjetaFormulario estilo={estilos.tarjetaMensaje}>
            <Text style={estilos.textoError}>{error}</Text>
            <Pressable onPress={() => void cargarReporte(fechaInicio, fechaFin)}>
              <Text style={estilos.enlaceReintentar}>Reintentar</Text>
            </Pressable>
          </TarjetaFormulario>
        ) : reporte && reporte.actividades.length > 0 ? (
          <View style={estilos.lista}>
            {reporte.actividades.map((actividad) => {
              const totalEntregables = actividad.avances.length;
              return (
                <TarjetaFormulario key={actividad.id} estilo={estilos.tarjetaReporte}>
                  <View style={estilos.filaEncabezadoTarjeta}>
                    <Text style={estilos.nombreActividad}>{actividad.nombre}</Text>
                    <View style={estilos.insigniaEstado}>
                      <Text style={estilos.textoInsigniaEstado}>{actividad.estado}</Text>
                    </View>
                  </View>
                  <Text style={estilos.metaTexto}>
                    Responsable: {actividad.responsable} · Entregables: {totalEntregables}
                  </Text>
                  <Text style={estilos.metaTexto}>
                    Periodo: {reporte.fechaInicioFiltro} — {reporte.fechaFinFiltro}
                  </Text>
                  <View style={estilos.accionesTarjeta}>
                    <Pressable
                      style={estilos.enlaceAccion}
                      onPress={() => setVistaPreviaVisible(true)}
                    >
                      <Text style={estilos.textoEnlaceAccion}>Ver vista previa</Text>
                    </Pressable>
                    <Pressable
                      style={estilos.enlaceAccion}
                      onPress={() => void manejarGenerarPdf()}
                    >
                      <Text style={estilos.textoEnlaceAccion}>Generar PDF</Text>
                    </Pressable>
                  </View>
                </TarjetaFormulario>
              );
            })}
          </View>
        ) : (
          <TarjetaFormulario estilo={estilos.tarjetaMensaje}>
            <Text style={estilos.textoVacio}>
              No se encontraron avances en el rango de fechas seleccionado.
            </Text>
          </TarjetaFormulario>
        )}
      </ScrollView>

      <Modal
        visible={filtroVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFiltroVisible(false)}
      >
        <View style={estilos.modalFondo}>
          <View style={estilos.modalCaja}>
            <View style={estilos.modalEncabezado}>
              <Text style={estilos.modalTitulo}>Filtrar por fecha</Text>
              <Pressable onPress={() => setFiltroVisible(false)}>
                <Text style={estilos.cerrarX}>✕</Text>
              </Pressable>
            </View>
            <View style={estilos.filaFechas}>
              <View style={estilos.campoFecha}>
                <Text style={estilos.etiquetaCampo}>Inicio</Text>
                <TextInput
                  style={estilos.entradaFecha}
                  value={fechaInicioBorrador}
                  onChangeText={(texto) => setFechaInicioBorrador(aplicarMascaraFecha(texto))}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor={COLORES.marcador}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>
              <View style={estilos.campoFecha}>
                <Text style={estilos.etiquetaCampo}>Final</Text>
                <TextInput
                  style={estilos.entradaFecha}
                  value={fechaFinBorrador}
                  onChangeText={(texto) => setFechaFinBorrador(aplicarMascaraFecha(texto))}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor={COLORES.marcador}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>
            </View>
            <BotonPrincipal
              variante="marca"
              etiqueta="Aceptar"
              onPresionar={manejarAplicarFiltro}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={vistaPreviaVisible}
        animationType="slide"
        onRequestClose={() => setVistaPreviaVisible(false)}
      >
        <View style={estilos.vistaPreviaContenedor}>
          <EncabezadoApp />
          <View style={estilos.vistaPreviaHeader}>
            <View>
              <Text style={estilos.vistaPreviaTitulo}>Reporte de avances</Text>
              <Text style={estilos.vistaPreviaSubtitulo}>
                {obra.nombre} · {reporte?.fechaInicioFiltro ?? fechaInicio} —{' '}
                {reporte?.fechaFinFiltro ?? fechaFin}
              </Text>
            </View>
            <Pressable onPress={() => setVistaPreviaVisible(false)}>
              <Text style={estilos.cerrarX}>✕</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={estilos.vistaPreviaScroll}>
            {reporte?.actividades.map((actividad) => (
              <TarjetaFormulario key={actividad.id} estilo={estilos.bloqueActividadPreview}>
                <Text style={estilos.nombreActividad}>{actividad.nombre}</Text>
                <Text style={estilos.metaTexto}>
                  Responsable de actividad: {actividad.responsable} · Supervisor:{' '}
                  {actividad.supervisor}
                </Text>

                {actividad.avances.length === 0 ? (
                  <Text style={estilos.textoVacio}>Sin entregables registrados.</Text>
                ) : (
                  actividad.avances.map((avance, idx) => (
                    <View key={avance.id} style={estilos.tarjetaEntregable}>
                      <View style={estilos.filaEntregable}>
                        <Text style={estilos.tituloEntregable}>Entregable #{idx + 1}</Text>
                        <Text style={estilos.fechaEntregable}>{avance.fechaRegistro}</Text>
                      </View>
                      <Text style={estilos.responsableEntregable}>
                        Subido por: {avance.registradoPor}
                      </Text>
                      <Text style={estilos.descripcionEntregable}>
                        {avance.comentario || 'Sin descripción registrada.'}
                      </Text>
                      {avance.fotoDataUri ? (
                        <Image
                          source={{ uri: avance.fotoDataUri }}
                          style={estilos.fotoEntregable}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={estilos.sinFotoCaja}>
                          <Text style={estilos.textoVacio}>
                            {avance.tieneFoto
                              ? 'Fotografía no disponible sin conexión o sesión válida'
                              : 'Sin fotografía registrada en este día'}
                          </Text>
                        </View>
                      )}
                    </View>
                  ))
                )}
              </TarjetaFormulario>
            ))}
          </ScrollView>

          <View style={estilos.pieVistaPrevia}>
            <BotonPrincipal
              variante="marca"
              etiqueta={generandoPdf ? 'Generando PDF...' : 'Descargar / Compartir PDF'}
              onPresionar={manejarGenerarPdf}
              deshabilitado={generandoPdf || !reporte}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: COLORES.pantalla,
  },
  contenido: {
    paddingBottom: 28,
  },
  bloqueTitulo: {
    alignItems: 'center',
    paddingTop: 14,
    paddingHorizontal: 56,
    paddingBottom: 14,
  },
  regresar: {
    position: 'absolute',
    top: 15,
    left: 16,
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
    textAlign: 'center',
  },
  subtitulo: {
    marginTop: 4,
    ...TIPOGRAFIA.leyenda,
    color: COLORES.textoAtenuado,
    textAlign: 'center',
  },
  barraAcciones: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  botonAccion: {
    flex: 1,
  },
  botonFiltro: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: RADIOS.accion,
    backgroundColor: COLORES.superficie,
    borderWidth: 1,
    borderColor: COLORES.borde,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoFiltro: {
    ...TIPOGRAFIA.etiqueta,
    color: COLORES.texto,
  },
  lista: {
    gap: 12,
    paddingHorizontal: 16,
  },
  tarjetaReporte: {
    padding: 16,
    gap: 6,
  },
  filaEncabezadoTarjeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  nombreActividad: {
    flex: 1,
    ...TIPOGRAFIA.titulo4,
    color: COLORES.texto,
  },
  insigniaEstado: {
    backgroundColor: COLORES.exitoFondo,
    borderColor: COLORES.exitoBorde,
    borderWidth: 1,
    borderRadius: RADIOS.pildora,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  textoInsigniaEstado: {
    ...TIPOGRAFIA.etiqueta,
    color: COLORES.exitoTexto,
  },
  metaTexto: {
    ...TIPOGRAFIA.leyenda,
    color: COLORES.textoAtenuado,
  },
  accionesTarjeta: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  enlaceAccion: {
    paddingVertical: 4,
  },
  textoEnlaceAccion: {
    ...TIPOGRAFIA.etiqueta,
    color: COLORES.marca,
  },
  centro: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  tarjetaMensaje: {
    marginHorizontal: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  textoVacio: {
    ...TIPOGRAFIA.leyenda,
    color: COLORES.textoAtenuado,
    textAlign: 'center',
  },
  textoError: {
    ...TIPOGRAFIA.leyenda,
    color: COLORES.error,
    textAlign: 'center',
  },
  enlaceReintentar: {
    ...TIPOGRAFIA.etiqueta,
    color: COLORES.marca,
  },
  modalFondo: {
    flex: 1,
    backgroundColor: COLORES.superposicion,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCaja: {
    backgroundColor: COLORES.superficie,
    borderRadius: RADIOS.tarjeta,
    borderWidth: 1,
    borderColor: COLORES.bordeModal,
    padding: 18,
    gap: 14,
  },
  modalEncabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitulo: {
    ...TIPOGRAFIA.titulo3,
    color: COLORES.texto,
  },
  cerrarX: {
    ...TIPOGRAFIA.titulo4,
    color: COLORES.textoSutil,
    paddingHorizontal: 6,
  },
  filaFechas: {
    flexDirection: 'row',
    gap: 12,
  },
  campoFecha: {
    flex: 1,
    gap: 6,
  },
  etiquetaCampo: {
    ...TIPOGRAFIA.etiqueta,
    color: COLORES.texto,
  },
  entradaFecha: {
    backgroundColor: COLORES.fondoEntrada,
    borderWidth: 1,
    borderColor: COLORES.borde,
    borderRadius: RADIOS.accion,
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...TIPOGRAFIA.valorCampo,
    color: COLORES.texto,
  },
  vistaPreviaContenedor: {
    flex: 1,
    backgroundColor: COLORES.pantalla,
  },
  vistaPreviaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORES.superficie,
    borderBottomWidth: 1,
    borderBottomColor: COLORES.borde,
  },
  vistaPreviaTitulo: {
    ...TIPOGRAFIA.titulo3,
    color: COLORES.texto,
  },
  vistaPreviaSubtitulo: {
    ...TIPOGRAFIA.leyenda,
    color: COLORES.textoAtenuado,
  },
  vistaPreviaScroll: {
    padding: 16,
    gap: 14,
  },
  bloqueActividadPreview: {
    padding: 14,
    gap: 10,
  },
  tarjetaEntregable: {
    backgroundColor: COLORES.fondoFila,
    borderWidth: 1,
    borderColor: COLORES.borde,
    borderRadius: RADIOS.accion,
    padding: 12,
    gap: 4,
  },
  filaEntregable: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tituloEntregable: {
    ...TIPOGRAFIA.etiqueta,
    color: COLORES.marca,
  },
  fechaEntregable: {
    ...TIPOGRAFIA.leyenda,
    color: COLORES.textoAtenuado,
  },
  responsableEntregable: {
    ...TIPOGRAFIA.etiqueta,
    color: COLORES.texto,
  },
  descripcionEntregable: {
    ...TIPOGRAFIA.leyenda,
    color: COLORES.texto,
  },
  fotoEntregable: {
    width: '100%',
    height: 180,
    borderRadius: RADIOS.accion,
    marginTop: 6,
    backgroundColor: COLORES.fondoEntrada,
  },
  sinFotoCaja: {
    height: 90,
    borderRadius: RADIOS.accion,
    borderWidth: 1,
    borderColor: COLORES.borde,
    backgroundColor: COLORES.fondoEntrada,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    paddingHorizontal: 12,
  },
  pieVistaPrevia: {
    padding: 16,
    backgroundColor: COLORES.superficie,
    borderTopWidth: 1,
    borderTopColor: COLORES.borde,
  },
});
