/**
 * @archivo PantallaRevisarAvance.tsx
 * @proyecto Civil Trace
 * @descripcion El supervisor revisa una evidencia pendiente (Figma "Supervisor · Revisar avance"
 *   2138:577): ve la evidencia anterior y la nueva, escribe observaciones y aprueba o rechaza. Al
 *   rechazar el motivo es obligatorio (D-10). Después muestra la confirmación (2142:182 aprobada,
 *   2142:393 rechazada).
 * @autor Emilio Manuel Esquivel
 * @fecha 24/11/2026
 * @version 1.0.0
 * @requerimientos CP14 Revisar evidencias y verificar actividad, D-10
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Creación (feature 003)
 */

// 1. Importaciones
import { type ReactNode, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import BotonPrincipal from '@/componentes/BotonPrincipal';
import EncabezadoApp from '@/componentes/EncabezadoApp';
import { IconoCheck, IconoChevronIzquierda } from '@/componentes/Iconos';
import ImagenEvidencia from '@/componentes/ImagenEvidencia';
import { ErrorApi } from '@/conexion/clienteApi';
import { COLORES } from '@/constantes/colores';
import { COLORES_ASISTENCIA } from '@/constantes/textosAsistencia';
import { RADIOS, SOMBRAS, TIPOGRAFIA } from '@/constantes/tema';
import { obtenerDetalleActividad, revisarAvance } from '@/servicios/servicioActividades';
import type {
  ActividadDetalle,
  AvanceActividad,
  DecisionRevision,
  ResultadoRevision,
} from '@/tipos/actividad';

// 2. Tipos e interfaces
interface PantallaRevisarAvanceProps {
  tokenAcceso: string;
  idObra: string;
  idActividad: string;
  idAvance: string;
  onRegresar: () => void;
  onTerminar: () => void;
}

// 3. Constantes del módulo
const LONGITUD_MAXIMA_OBSERVACION = 500;
const MENSAJE_MOTIVO = 'Indica el motivo del rechazo';
const MENSAJE_ERROR = 'No se pudo guardar la revisión. Intenta de nuevo.';
const MENSAJE_ERROR_CARGA = 'No se pudo cargar la evidencia.';

// 4. Componente principal
export default function PantallaRevisarAvance({
  tokenAcceso,
  idObra,
  idActividad,
  idAvance,
  onRegresar,
  onTerminar,
}: PantallaRevisarAvanceProps) {
  const [actividad, setActividad] = useState<ActividadDetalle | null>(null);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [observacion, setObservacion] = useState('');
  const [guardando, setGuardando] = useState<DecisionRevision | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ResultadoRevision | null>(null);

  useEffect(() => {
    let cancelado = false;
    obtenerDetalleActividad(tokenAcceso, idObra, idActividad)
      .then((datos) => {
        if (!cancelado) {
          setActividad(datos);
        }
      })
      .catch((falla: unknown) => {
        if (!cancelado) {
          setErrorCarga(falla instanceof ErrorApi ? falla.message : MENSAJE_ERROR_CARGA);
        }
      });
    return () => {
      cancelado = true;
    };
  }, [tokenAcceso, idObra, idActividad]);

  const avance = actividad?.avances.find((elemento) => elemento.id === idAvance) ?? null;
  // La evidencia anterior es la última ya aprobada antes de la que se revisa.
  const anterior = actividad && avance ? buscarAnterior(actividad.avances, avance) : null;

  const decidir = async (decision: DecisionRevision) => {
    if (decision === 'RECHAZAR' && !observacion.trim()) {
      setError(MENSAJE_MOTIVO);
      return;
    }
    setGuardando(decision);
    setError(null);
    try {
      setResultado(
        await revisarAvance(tokenAcceso, idObra, idActividad, idAvance, decision, observacion),
      );
    } catch (falla) {
      setError(falla instanceof ErrorApi ? falla.message : MENSAJE_ERROR);
    } finally {
      setGuardando(null);
    }
  };

  if (resultado) {
    return (
      <Confirmacion
        tokenAcceso={tokenAcceso}
        idObra={idObra}
        resultado={resultado}
        onRegresar={onTerminar}
      />
    );
  }

  return (
    <View style={estilos.contenedor}>
      <EncabezadoApp />
      <KeyboardAvoidingView style={estilos.teclado} behavior="padding">
        <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
          <Encabezado titulo="Revisar avance" onRegresar={onRegresar} />
          {errorCarga ? <Text style={estilos.error}>{errorCarga}</Text> : null}
          {!actividad && !errorCarga ? <ActivityIndicator color={COLORES_ASISTENCIA.azul} /> : null}
          {actividad && !avance ? (
            <Text style={estilos.error}>Esta evidencia ya no está disponible.</Text>
          ) : null}
          {actividad && avance ? (
            <>
              <TarjetaActividadRevision
                actividad={actividad}
                avance={avance}
                insignia={
                  avance.estado === 'PENDIENTE' ? (
                    <Insignia texto="Pendiente de aprobación" tono="pendiente" />
                  ) : (
                    <Insignia
                      texto={avance.estado === 'APROBADO' ? 'Aprobada' : 'Rechazada'}
                      tono={avance.estado === 'APROBADO' ? 'aprobada' : 'rechazada'}
                    />
                  )
                }
              />
              <View style={estilos.tarjeta}>
                <View style={estilos.filaEntre}>
                  <Text style={estilos.subtitulo}>Evidencia del avance</Text>
                  <Text style={estilos.leyenda}>{avance.fechaRegistro}</Text>
                </View>
                <View style={estilos.filaFotos}>
                  {anterior ? (
                    <View style={estilos.columnaFoto}>
                      <ImagenEvidencia
                        tokenAcceso={tokenAcceso}
                        idObra={idObra}
                        idActividad={idActividad}
                        idAvance={anterior.id}
                      />
                      <Text style={estilos.leyenda}>Anterior · {anterior.fechaRegistro}</Text>
                    </View>
                  ) : null}
                  <View style={estilos.columnaFoto}>
                    <ImagenEvidencia
                      tokenAcceso={tokenAcceso}
                      idObra={idObra}
                      idActividad={idActividad}
                      idAvance={avance.id}
                    />
                    <Text style={estilos.leyendaAzul}>En revisión · {avance.fechaRegistro}</Text>
                  </View>
                </View>
                {avance.comentario ? (
                  <Text style={estilos.comentario}>“{avance.comentario}”</Text>
                ) : null}
                <Text style={estilos.leyenda}>
                  {avance.tipo === 'TERMINADO'
                    ? 'El responsable indica que terminó la actividad.'
                    : 'Avance diario.'}
                </Text>
              </View>

              <View style={estilos.filaEntre}>
                <Text style={estilos.subtitulo}>Observaciones</Text>
                <Text style={estilos.leyenda}>
                  {observacion.length}/{LONGITUD_MAXIMA_OBSERVACION}
                </Text>
              </View>
              <TextInput
                style={estilos.observacion}
                value={observacion}
                onChangeText={(texto) => {
                  setObservacion(texto);
                  setError(null);
                }}
                placeholder="Escribe tus comentarios sobre el avance..."
                placeholderTextColor={COLORES.marcador}
                multiline
                maxLength={LONGITUD_MAXIMA_OBSERVACION}
              />
              <Text style={estilos.leyenda}>Si rechazas el avance, indica el motivo.</Text>
              {error ? <Text style={estilos.error}>{error}</Text> : null}

              {avance.estado === 'PENDIENTE' ? (
                <View style={estilos.filaBotones}>
                  <Pressable
                    style={estilos.botonRechazar}
                    onPress={() => void decidir('RECHAZAR')}
                    disabled={guardando !== null}
                    accessibilityRole="button"
                  >
                    {guardando === 'RECHAZAR' ? (
                      <ActivityIndicator color={COLORES.error} />
                    ) : (
                      <Text style={estilos.textoRechazar}>Rechazar</Text>
                    )}
                  </Pressable>
                  <BotonPrincipal
                    etiqueta="Aprobar"
                    onPresionar={() => void decidir('APROBAR')}
                    estaCargando={guardando === 'APROBAR'}
                    estilo={estilos.botonMitad}
                  />
                </View>
              ) : null}
            </>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// 5. Componentes y funciones auxiliares
function buscarAnterior(avances: AvanceActividad[], actual: AvanceActividad) {
  const indice = avances.findIndex((elemento) => elemento.id === actual.id);
  return (
    avances
      .slice(0, Math.max(indice, 0))
      .reverse()
      .find((elemento) => elemento.estado === 'APROBADO') ?? null
  );
}

function Encabezado({ titulo, onRegresar }: { titulo: string; onRegresar: () => void }) {
  return (
    <View style={estilos.encabezado}>
      <Pressable style={estilos.regresar} onPress={onRegresar} accessibilityLabel="Regresar">
        <IconoChevronIzquierda tamano={20} color={COLORES.textoAtenuado} />
      </Pressable>
      <View>
        <Text style={estilos.titulo}>{titulo}</Text>
        <Text style={estilos.leyenda}>Supervisor · Revisión de actividad</Text>
      </View>
    </View>
  );
}

type TonoInsignia = 'pendiente' | 'aprobada' | 'rechazada';

function Insignia({ texto, tono }: { texto: string; tono: TonoInsignia }) {
  return (
    <Text style={[estilos.insignia, estilos[`insignia_${tono}`]]} accessibilityLabel={texto}>
      {texto}
    </Text>
  );
}

function TarjetaActividadRevision({
  actividad,
  avance,
  insignia,
}: {
  actividad: ActividadDetalle;
  avance: AvanceActividad;
  insignia: ReactNode;
}) {
  return (
    <View style={estilos.tarjeta}>
      <View style={estilos.filaEntre}>
        <Text style={estilos.leyenda}>ACTIVIDAD</Text>
        {insignia}
      </View>
      <Text style={estilos.nombreActividad}>{actividad.nombre}</Text>
      <Fila etiqueta="Responsable" valor={actividad.responsable} />
      <Fila etiqueta="Supervisor" valor={actividad.supervisor} />
      <View style={[estilos.filaEntre, estilos.separador]}>
        <Text style={estilos.leyenda}>Entregada: {avance.fechaRegistro}</Text>
        <Text style={estilos.leyenda}>Entrega: {actividad.fechaEntrega}</Text>
      </View>
    </View>
  );
}

function Fila({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <View style={estilos.fila}>
      <Text style={estilos.etiquetaFila}>{etiqueta}</Text>
      <Text style={estilos.valorFila}>{valor}</Text>
    </View>
  );
}

function Confirmacion({
  tokenAcceso,
  idObra,
  resultado,
  onRegresar,
}: {
  tokenAcceso: string;
  idObra: string;
  resultado: ResultadoRevision;
  onRegresar: () => void;
}) {
  const aprobada = resultado.avance.estado === 'APROBADO';
  const { actividad, avance } = resultado;
  return (
    <View style={estilos.contenedor}>
      <EncabezadoApp />
      <ScrollView contentContainerStyle={estilos.contenido}>
        <Encabezado titulo="Confirmación" onRegresar={onRegresar} />
        <View style={[estilos.circulo, aprobada ? estilos.circuloOk : estilos.circuloMal]}>
          {aprobada ? (
            <IconoCheck tamano={30} color={COLORES_ASISTENCIA.verdeTexto} />
          ) : (
            <Text style={estilos.equis}>✕</Text>
          )}
        </View>
        <Text style={estilos.tituloConfirmacion}>
          {aprobada ? 'Actividad aprobada' : 'Actividad rechazada'}
        </Text>
        <Text style={estilos.textoConfirmacion}>
          Has {aprobada ? 'aprobado' : 'rechazado'} el avance de esta actividad. La revisión se
          guardó correctamente.
        </Text>
        <View style={estilos.tarjeta}>
          <View style={estilos.filaEntre}>
            <Text style={estilos.leyenda}>ACTIVIDAD</Text>
            <Insignia
              texto={aprobada ? 'Aprobada' : 'Rechazada'}
              tono={aprobada ? 'aprobada' : 'rechazada'}
            />
          </View>
          <Text style={estilos.nombreActividad}>{actividad.nombre}</Text>
          <Fila etiqueta="Responsable" valor={actividad.responsable} />
          <Fila etiqueta="Supervisor" valor={actividad.supervisor} />
          <View style={[estilos.filaFotos, estilos.separador]}>
            <View style={estilos.miniatura}>
              <ImagenEvidencia
                tokenAcceso={tokenAcceso}
                idObra={idObra}
                idActividad={actividad.id}
                idAvance={avance.id}
              />
            </View>
            <View style={estilos.columnaFoto}>
              <Text style={estilos.etiquetaFila}>Evidencia del avance</Text>
              <Text style={estilos.leyenda}>{avance.fechaRegistro}</Text>
              <Text style={aprobada ? estilos.textoAprobado : estilos.textoRechazado}>
                {aprobada ? 'Aprobado' : 'Rechazado'} por{' '}
                {avance.revisadoPor ?? actividad.supervisor}
              </Text>
            </View>
          </View>
        </View>
        {!aprobada && avance.observacion ? (
          <View style={estilos.motivo}>
            <Text style={estilos.tituloMotivo}>Motivo del rechazo</Text>
            <Text style={estilos.textoMotivo}>{avance.observacion}</Text>
          </View>
        ) : null}
        <BotonPrincipal etiqueta="Continuar" onPresionar={onRegresar} />
      </ScrollView>
    </View>
  );
}

// 6. Estilos
const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: COLORES.pantalla },
  teclado: { flex: 1 },
  contenido: { padding: 18, gap: 14, paddingBottom: 40 },
  encabezado: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  regresar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORES.superficie,
    alignItems: 'center',
    justifyContent: 'center',
    ...SOMBRAS.tarjeta,
  },
  titulo: { ...TIPOGRAFIA.titulo2, color: COLORES.texto },
  subtitulo: { ...TIPOGRAFIA.titulo4, color: COLORES.texto },
  tarjeta: {
    backgroundColor: COLORES.superficie,
    borderRadius: RADIOS.tarjeta,
    padding: 16,
    gap: 8,
    ...SOMBRAS.tarjeta,
  },
  filaEntre: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  separador: {
    borderTopWidth: 1,
    borderTopColor: COLORES_ASISTENCIA.bordeChip,
    paddingTop: 10,
    marginTop: 4,
  },
  nombreActividad: { ...TIPOGRAFIA.titulo3, color: COLORES.texto },
  fila: { flexDirection: 'row', gap: 12 },
  etiquetaFila: { ...TIPOGRAFIA.leyenda, color: COLORES.textoAtenuado, width: 96 },
  valorFila: { ...TIPOGRAFIA.etiqueta, color: COLORES.texto, flexShrink: 1 },
  leyenda: { ...TIPOGRAFIA.leyenda, color: COLORES.textoSutil },
  leyendaAzul: { ...TIPOGRAFIA.leyenda, color: COLORES_ASISTENCIA.azul },
  filaFotos: { flexDirection: 'row', gap: 12 },
  columnaFoto: { flex: 1, gap: 4 },
  miniatura: { width: 72 },
  comentario: { ...TIPOGRAFIA.subtitulo, color: COLORES.textoAtenuado, fontStyle: 'italic' },
  observacion: {
    minHeight: 90,
    padding: 12,
    borderRadius: RADIOS.accion,
    borderWidth: 1,
    borderColor: COLORES_ASISTENCIA.bordeChip,
    backgroundColor: COLORES.superficie,
    textAlignVertical: 'top',
    ...TIPOGRAFIA.subtitulo,
    color: COLORES.texto,
  },
  filaBotones: { flexDirection: 'row', gap: 12 },
  botonMitad: { flex: 1 },
  botonRechazar: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIOS.pildora,
    borderWidth: 1,
    borderColor: COLORES.error,
    backgroundColor: COLORES.superficie,
  },
  textoRechazar: { ...TIPOGRAFIA.etiqueta, color: COLORES.error },
  error: { ...TIPOGRAFIA.leyenda, color: COLORES.error },
  insignia: {
    ...TIPOGRAFIA.leyenda,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: RADIOS.pildora,
    overflow: 'hidden',
  },
  insignia_pendiente: {
    backgroundColor: COLORES_ASISTENCIA.chipPendienteFondo,
    color: COLORES_ASISTENCIA.chipPendienteTexto,
  },
  insignia_aprobada: { backgroundColor: COLORES.exitoFondo, color: COLORES_ASISTENCIA.verdeTexto },
  insignia_rechazada: {
    backgroundColor: COLORES_ASISTENCIA.alertaFondo,
    color: COLORES_ASISTENCIA.rojoTexto,
  },
  circulo: {
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circuloOk: { backgroundColor: COLORES.exitoFondo },
  circuloMal: { backgroundColor: COLORES_ASISTENCIA.alertaFondo },
  equis: { fontSize: 28, color: COLORES_ASISTENCIA.rojoTexto },
  tituloConfirmacion: { ...TIPOGRAFIA.titulo2, color: COLORES.texto, textAlign: 'center' },
  textoConfirmacion: { ...TIPOGRAFIA.leyenda, color: COLORES.textoSutil, textAlign: 'center' },
  textoAprobado: { ...TIPOGRAFIA.leyenda, color: COLORES_ASISTENCIA.verdeTexto },
  textoRechazado: { ...TIPOGRAFIA.leyenda, color: COLORES_ASISTENCIA.rojoTexto },
  motivo: {
    backgroundColor: COLORES_ASISTENCIA.alertaFondo,
    borderRadius: RADIOS.tarjeta,
    padding: 14,
    gap: 6,
  },
  tituloMotivo: { ...TIPOGRAFIA.etiqueta, color: COLORES_ASISTENCIA.rojoTexto },
  textoMotivo: { ...TIPOGRAFIA.subtitulo, color: COLORES.texto },
});
