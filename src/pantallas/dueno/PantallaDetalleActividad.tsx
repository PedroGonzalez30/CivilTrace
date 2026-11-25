/**
 * @archivo PantallaDetalleActividad.tsx
 * @proyecto Civil Trace
 * @descripcion Muestra los datos de una actividad activa o terminada y su historial de avances.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 20/11/2026
 * @version 1.2.0
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Estado y motivo de rechazo por evidencia, botón
 *   "Revisar" en las pendientes y "+" para subir evidencia (supervisor), recarga al volver a la
 *   pantalla (feature 003, D-10)
 *   24/11/2026 - Emilio Manuel Esquivel - Aviso y sin "Revisar" si la actividad ya la aceptó el
 *   cliente (feature 004, RF-17 Bloquear entrega aceptada, D-31)
 */

// 1. Importaciones
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  EncabezadoApp,
  IconoCheckCirculo,
  IconoFlechaIzquierda,
  ImagenEvidencia,
  TarjetaFormulario,
} from '@/componentes';
import BotonFlotante from '@/componentes/BotonFlotante';
import TextoUbicacion from '@/componentes/TextoUbicacion';
import { ErrorApi } from '@/conexion/clienteApi';
import { COLORES } from '@/constantes/colores';
import { COLORES_ASISTENCIA } from '@/constantes/textosAsistencia';
import { RADIOS, SOMBRAS, TAMANOS, TIPOGRAFIA } from '@/constantes/tema';
import { obtenerDetalleActividad } from '@/servicios/servicioActividades';
import type { ActividadDetalle, EstadoAvance } from '@/tipos/actividad';

// 2. Tipos e interfaces
interface PantallaDetalleActividadProps {
  tokenAcceso: string;
  idObra: string;
  idActividad: string;
  onRegresar: () => void;
  // Supervisor (feature 003): subir su evidencia y revisar las pendientes.
  onSubirEvidencia?: (nombreActividad: string) => void;
  onRevisarAvance?: (idAvance: string) => void;
}

// 3. Constantes del módulo
const SUBTITULO_ACTIVA = 'Avances de actividad activa';
const SUBTITULO_TERMINADA = 'Avances de actividad terminada';
const AVISO_BLOQUEADA = 'El cliente aceptó esta actividad: ya no se puede modificar.';
const ETIQUETA_RESPONSABLE = 'Responsable';
const ETIQUETA_SUPERVISOR = 'Supervisor';
const ETIQUETA_ESTADO = 'Estado';
const ETIQUETA_ENTREGA = 'Entrega';
const TITULO_AVANCE = 'Avance';
const TITULO_HISTORIAL = 'Historial de avance';
const MENSAJE_SIN_AVANCES = 'Aún no hay avances registrados en esta actividad.';
const MENSAJE_ERROR_CARGA = 'No se pudo cargar el detalle de la actividad.';
const ETIQUETA_REINTENTAR = 'Reintentar';

// 4. Funciones auxiliares
function etiquetaEstadoAvance(estado: EstadoAvance): { texto: string; esAprobado: boolean } {
  if (estado === 'PENDIENTE') {
    return { texto: 'Pendiente', esAprobado: false };
  }
  if (estado === 'RECHAZADO') {
    return { texto: 'Rechazado', esAprobado: false };
  }
  return { texto: 'Aprobado', esAprobado: true };
}

// 5. Componente principal
export default function PantallaDetalleActividad({
  tokenAcceso,
  idObra,
  idActividad,
  onRegresar,
  onSubirEvidencia,
  onRevisarAvance,
}: PantallaDetalleActividadProps) {
  const [detalle, setDetalle] = useState<ActividadDetalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setError(null);

    obtenerDetalleActividad(tokenAcceso, idObra, idActividad)
      .then((datos) => {
        if (!cancelado) {
          setDetalle(datos);
        }
      })
      .catch((falla: unknown) => {
        if (!cancelado) {
          setError(falla instanceof ErrorApi ? falla.message : MENSAJE_ERROR_CARGA);
        }
      })
      .finally(() => {
        if (!cancelado) {
          setCargando(false);
        }
      });

    return () => {
      cancelado = true;
    };
  }, [tokenAcceso, idObra, idActividad, intento]);

  // Al volver de subir o revisar una evidencia se recarga la cronología.
  // La primera vez ya carga el efecto de arriba; solo se recarga al regresar.
  const yaEnfocada = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (yaEnfocada.current) {
        setIntento((anterior) => anterior + 1);
      }
      yaEnfocada.current = true;
    }, []),
  );

  const esTerminada = detalle?.estado === 'TERMINADA';
  const subtitulo = esTerminada ? SUBTITULO_TERMINADA : SUBTITULO_ACTIVA;
  const estadoAvance = detalle
    ? etiquetaEstadoAvance(detalle.avances[0]?.estado ?? 'APROBADO')
    : null;

  return (
    <View style={estilos.contenedor}>
      <EncabezadoApp />
      <ScrollView contentContainerStyle={estilos.contenido} showsVerticalScrollIndicator={false}>
        <View style={estilos.bloqueTitulo}>
          <Pressable style={estilos.regresar} onPress={onRegresar} accessibilityLabel="Regresar">
            <IconoFlechaIzquierda />
          </Pressable>
          <Text style={estilos.titulo}>{detalle?.nombre ?? ''}</Text>
          {detalle ? <Text style={estilos.subtitulo}>{subtitulo}</Text> : null}
          {detalle?.bloqueada ? (
            <Text style={estilos.avisoBloqueada}>{AVISO_BLOQUEADA}</Text>
          ) : null}
        </View>

        {cargando && !detalle ? (
          <View style={estilos.centro}>
            <ActivityIndicator color={COLORES.marca} />
          </View>
        ) : error ? (
          <TarjetaFormulario estilo={estilos.tarjetaMensaje}>
            <Text style={estilos.textoError}>{error}</Text>
            <Pressable onPress={() => setIntento((anterior) => anterior + 1)}>
              <Text style={estilos.enlaceReintentar}>{ETIQUETA_REINTENTAR}</Text>
            </Pressable>
          </TarjetaFormulario>
        ) : detalle ? (
          <View style={estilos.secciones}>
            <View style={estilos.filaDato}>
              <View style={estilos.insigniaDato}>
                <Text style={estilos.textoInsignia}>{ETIQUETA_RESPONSABLE}</Text>
              </View>
              <Text style={estilos.valorDato}>{detalle.responsable}</Text>
            </View>

            <View style={estilos.filaDato}>
              <View style={estilos.insigniaDato}>
                <Text style={estilos.textoInsignia}>{ETIQUETA_SUPERVISOR}</Text>
              </View>
              <Text style={estilos.valorDato}>{detalle.supervisor}</Text>
            </View>

            {esTerminada && estadoAvance ? (
              <View style={estilos.filaDato}>
                <View style={estilos.insigniaDato}>
                  <Text style={estilos.textoInsignia}>{ETIQUETA_ESTADO}</Text>
                </View>
                <View style={estilos.estadoDerecha}>
                  <Text
                    style={[
                      estilos.valorEstado,
                      estadoAvance.esAprobado ? estilos.estadoAprobado : estilos.estadoNormal,
                    ]}
                  >
                    {estadoAvance.texto}
                  </Text>
                  {estadoAvance.esAprobado ? <IconoCheckCirculo tamano={18} /> : null}
                </View>
              </View>
            ) : null}

            <View style={estilos.filaDato}>
              <View style={estilos.insigniaDato}>
                <Text style={estilos.textoInsignia}>{ETIQUETA_ENTREGA}</Text>
              </View>
              <Text style={estilos.valorDato}>{detalle.fechaEntrega}</Text>
            </View>

            <TarjetaFormulario estilo={estilos.tarjetaAvances}>
              <Text style={estilos.tituloAvances}>
                {esTerminada ? TITULO_HISTORIAL : TITULO_AVANCE}
              </Text>
              {detalle.avances.length === 0 ? (
                <Text style={estilos.textoVacio}>{MENSAJE_SIN_AVANCES}</Text>
              ) : (
                detalle.avances.map((avance) => (
                  <View key={avance.id} style={estilos.bloqueAvance}>
                    {esTerminada ? (
                      <Text style={estilos.etiquetaAvanceSecundaria}>{TITULO_AVANCE}</Text>
                    ) : null}
                    <View style={estilos.filaAvance}>
                      <Text style={estilos.fechaAvance}>
                        {avance.fechaRegistro}
                        {avance.tipo === 'TERMINADO' ? ' · Entrega final' : ''}
                      </Text>
                      <Text
                        style={[
                          estilos.chipAvance,
                          avance.estado === 'PENDIENTE' && estilos.chipPendiente,
                          avance.estado === 'RECHAZADO' && estilos.chipRechazado,
                        ]}
                      >
                        {etiquetaEstadoAvance(avance.estado).texto}
                      </Text>
                    </View>
                    <TextoUbicacion datos={avance} />
                    {avance.estado === 'RECHAZADO' && avance.observacion ? (
                      <Text style={estilos.motivoRechazo}>Motivo: {avance.observacion}</Text>
                    ) : null}
                    {avance.estado === 'PENDIENTE' && onRevisarAvance && !detalle.bloqueada ? (
                      <Pressable
                        style={estilos.botonRevisar}
                        onPress={() => onRevisarAvance(avance.id)}
                        accessibilityRole="button"
                      >
                        <Text style={estilos.textoRevisar}>Revisar</Text>
                      </Pressable>
                    ) : null}
                    {avance.comentario ? (
                      <Text style={estilos.comentarioAvance}>{avance.comentario}</Text>
                    ) : null}
                    {avance.tieneFoto ? (
                      <ImagenEvidencia
                        tokenAcceso={tokenAcceso}
                        idObra={idObra}
                        idActividad={idActividad}
                        idAvance={avance.id}
                      />
                    ) : null}
                  </View>
                ))
              )}
            </TarjetaFormulario>
          </View>
        ) : null}
      </ScrollView>
      {onSubirEvidencia && detalle && !esTerminada ? (
        <BotonFlotante
          etiqueta="Subir evidencia"
          onPresionar={() => onSubirEvidencia(detalle.nombre)}
        />
      ) : null}
    </View>
  );
}

// 6. Estilos
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
    paddingBottom: 16,
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
    marginTop: 2,
    ...TIPOGRAFIA.leyenda,
    color: COLORES.textoAtenuado,
    textAlign: 'center',
  },
  secciones: {
    gap: 10,
    paddingHorizontal: 16,
  },
  filaDato: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORES.superficie,
    borderRadius: RADIOS.accion,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 12,
    ...SOMBRAS.tarjeta,
  },
  insigniaDato: {
    minWidth: 104,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: RADIOS.pildora,
    backgroundColor: COLORES.exitoFondo,
    borderWidth: 1,
    borderColor: COLORES.exitoBorde,
    alignItems: 'center',
  },
  textoInsignia: {
    ...TIPOGRAFIA.etiqueta,
    color: COLORES.exitoTexto,
  },
  valorDato: {
    flex: 1,
    ...TIPOGRAFIA.valorCampo,
    color: COLORES.texto,
  },
  estadoDerecha: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  valorEstado: {
    ...TIPOGRAFIA.valorCampo,
  },
  estadoAprobado: {
    color: COLORES.exitoTexto,
  },
  estadoNormal: {
    color: COLORES.texto,
  },
  tarjetaAvances: {
    marginTop: 4,
    padding: 16,
    gap: 14,
  },
  tituloAvances: {
    ...TIPOGRAFIA.titulo4,
    color: COLORES.texto,
  },
  bloqueAvance: {
    gap: 6,
  },
  etiquetaAvanceSecundaria: {
    ...TIPOGRAFIA.etiqueta,
    color: COLORES.texto,
  },
  fechaAvance: {
    ...TIPOGRAFIA.leyenda,
    color: COLORES.textoAtenuado,
  },
  filaAvance: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  chipAvance: {
    ...TIPOGRAFIA.leyenda,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: RADIOS.pildora,
    overflow: 'hidden',
    backgroundColor: COLORES.exitoFondo,
    color: COLORES_ASISTENCIA.verdeTexto,
  },
  chipPendiente: {
    backgroundColor: COLORES_ASISTENCIA.chipPendienteFondo,
    color: COLORES_ASISTENCIA.chipPendienteTexto,
  },
  chipRechazado: {
    backgroundColor: COLORES_ASISTENCIA.alertaFondo,
    color: COLORES_ASISTENCIA.rojoTexto,
  },
  motivoRechazo: {
    ...TIPOGRAFIA.leyenda,
    color: COLORES_ASISTENCIA.rojoTexto,
  },
  avisoBloqueada: {
    marginTop: 6,
    ...TIPOGRAFIA.leyenda,
    color: COLORES.exitoTexto,
    textAlign: 'center',
  },
  botonRevisar: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIOS.pildora,
    backgroundColor: COLORES_ASISTENCIA.azul,
  },
  textoRevisar: {
    ...TIPOGRAFIA.etiqueta,
    color: COLORES.superficie,
  },
  comentarioAvance: {
    ...TIPOGRAFIA.leyenda,
    color: COLORES.texto,
  },
  textoVacio: {
    ...TIPOGRAFIA.leyenda,
    color: COLORES.textoAtenuado,
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
  textoError: {
    ...TIPOGRAFIA.leyenda,
    color: COLORES.error,
    textAlign: 'center',
  },
  enlaceReintentar: {
    ...TIPOGRAFIA.etiqueta,
    color: COLORES.marca,
  },
});
