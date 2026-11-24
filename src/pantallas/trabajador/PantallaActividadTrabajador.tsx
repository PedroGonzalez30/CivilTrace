/**
 * @archivo PantallaActividadTrabajador.tsx
 * @proyecto Civil Trace
 * @descripcion Actividad del trabajador (Figma TRA-VERACTIVIDAD 58:592 y
 *   TRA-VERACTIVIDAD_EvidenciaAgregada 296:176): días restantes, instrucción, aviso de evidencia
 *   agregada o rechazada, botón para subir evidencia y sus evidencias con su estado (D-10).
 * @autor Emilio Manuel Esquivel
 * @fecha 24/11/2026
 * @version 1.0.0
 * @requerimientos CP11 Consultar actividades, CP12 Capturar evidencia fotográfica, D-10
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Creación (feature 003). Los "Pendientes" con
 *   casillas del Figma quedan fuera hasta confirmar P-06.
 */

// 1. Importaciones
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import EncabezadoApp from '@/componentes/EncabezadoApp';
import { IconoCheckCirculo, IconoChevronIzquierda, IconoMas } from '@/componentes/Iconos';
import ImagenEvidencia from '@/componentes/ImagenEvidencia';
import { ErrorApi } from '@/conexion/clienteApi';
import { COLORES } from '@/constantes/colores';
import { COLORES_ASISTENCIA } from '@/constantes/textosAsistencia';
import { RADIOS, SOMBRAS, TIPOGRAFIA } from '@/constantes/tema';
import { obtenerDetalleActividad } from '@/servicios/servicioActividades';
import type { ActividadDetalle, EstadoAvance } from '@/tipos/actividad';
import { calcularTextoRestante } from '@/utilidades/diasRestantes';

// 2. Tipos e interfaces
interface PantallaActividadTrabajadorProps {
  tokenAcceso: string;
  idObra: string;
  idActividad: string;
  evidenciaAgregada?: boolean;
  onRegresar: () => void;
  onSubirEvidencia: (nombreActividad: string) => void;
}

// 3. Constantes del módulo
const MENSAJE_ERROR = 'No se pudo cargar la actividad.';
const TEXTO_ESTADO: Record<EstadoAvance, string> = {
  PENDIENTE: 'Pendiente de revisión',
  APROBADO: 'Aprobada',
  RECHAZADO: 'Rechazada',
};

// 4. Componente principal
export default function PantallaActividadTrabajador({
  tokenAcceso,
  idObra,
  idActividad,
  evidenciaAgregada = false,
  onRegresar,
  onSubirEvidencia,
}: PantallaActividadTrabajadorProps) {
  const [actividad, setActividad] = useState<ActividadDetalle | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setError(null);
    try {
      setActividad(await obtenerDetalleActividad(tokenAcceso, idObra, idActividad));
    } catch (falla) {
      setError(falla instanceof ErrorApi ? falla.message : MENSAJE_ERROR);
    }
  }, [tokenAcceso, idObra, idActividad]);

  useFocusEffect(
    useCallback(() => {
      void cargar();
    }, [cargar]),
  );

  const restante = actividad ? calcularTextoRestante(actividad.fechaEntrega) : null;
  const ultima = actividad?.avances.at(-1) ?? null;
  const rechazoReciente = ultima?.estado === 'RECHAZADO' ? ultima : null;
  const puedeSubir = actividad?.estado === 'ACTIVA';

  return (
    <View style={estilos.contenedor}>
      <EncabezadoApp />
      <ScrollView contentContainerStyle={estilos.contenido}>
        <View style={estilos.tarjeta}>
          <Pressable style={estilos.regresar} onPress={onRegresar} accessibilityLabel="Regresar">
            <IconoChevronIzquierda tamano={20} color={COLORES.textoAtenuado} />
          </Pressable>
          {error ? <Text style={estilos.error}>{error}</Text> : null}
          {!actividad && !error ? <ActivityIndicator color={COLORES_ASISTENCIA.azul} /> : null}
          {actividad ? (
            <>
              <Text style={estilos.titulo}>{actividad.nombre}</Text>
              <View style={estilos.filaFechas}>
                {actividad.estado === 'TERMINADA' ? (
                  <Text style={[estilos.chip, estilos.chipVerde]}>Terminada</Text>
                ) : restante?.texto ? (
                  <Text style={[estilos.chip, restante.esVencida && estilos.chipRojo]}>
                    {restante.texto}
                  </Text>
                ) : null}
                <Text style={estilos.leyenda}>Entrega: {actividad.fechaEntrega}</Text>
              </View>

              <Text style={estilos.etiqueta}>Instrucción</Text>
              <Text style={estilos.texto}>
                {actividad.descripcion || 'Tu supervisor no agregó instrucciones.'}
              </Text>

              {evidenciaAgregada ? (
                <View style={estilos.avisoExito}>
                  <IconoCheckCirculo tamano={16} />
                  <Text style={estilos.textoExito}>Evidencia agregada correctamente</Text>
                </View>
              ) : null}
              {actividad.enRevision ? (
                <Text style={estilos.avisoRevision}>
                  Tu entrega está en revisión. Te avisaremos aquí cuando el supervisor la revise.
                </Text>
              ) : null}
              {rechazoReciente ? (
                <View style={estilos.avisoRechazo}>
                  <Text style={estilos.tituloRechazo}>El supervisor rechazó tu evidencia</Text>
                  {rechazoReciente.observacion ? (
                    <Text style={estilos.texto}>{rechazoReciente.observacion}</Text>
                  ) : null}
                  <Text style={estilos.leyenda}>Corrige y sube una nueva evidencia.</Text>
                </View>
              ) : null}

              {puedeSubir ? (
                <Pressable
                  style={estilos.boton}
                  onPress={() => onSubirEvidencia(actividad.nombre)}
                  accessibilityRole="button"
                >
                  <Text style={estilos.textoBoton}>Subir evidencia fotográfica</Text>
                  <View style={estilos.mas}>
                    <IconoMas tamano={16} />
                  </View>
                </Pressable>
              ) : null}

              <Text style={estilos.etiqueta}>Mis evidencias</Text>
              {actividad.avances.length === 0 ? (
                <Text style={estilos.leyenda}>Aún no has subido evidencias.</Text>
              ) : (
                actividad.avances.map((avance) => (
                  <View key={avance.id} style={estilos.evidencia}>
                    <View style={estilos.miniatura}>
                      <ImagenEvidencia
                        tokenAcceso={tokenAcceso}
                        idObra={idObra}
                        idActividad={idActividad}
                        idAvance={avance.id}
                      />
                    </View>
                    <View style={estilos.datosEvidencia}>
                      <Text style={estilos.texto}>
                        {avance.tipo === 'TERMINADO' ? 'Entrega final' : 'Avance diario'}
                      </Text>
                      <Text style={estilos.leyenda}>{avance.fechaRegistro}</Text>
                      <Text
                        style={[
                          estilos.estado,
                          avance.estado === 'APROBADO' && estilos.estadoAprobado,
                          avance.estado === 'RECHAZADO' && estilos.estadoRechazado,
                        ]}
                      >
                        {TEXTO_ESTADO[avance.estado]}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: COLORES.pantalla },
  contenido: { padding: 18, paddingBottom: 40 },
  tarjeta: {
    backgroundColor: COLORES.superficie,
    borderRadius: RADIOS.tarjeta,
    padding: 18,
    gap: 10,
    ...SOMBRAS.tarjeta,
  },
  regresar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORES.superficie,
    alignItems: 'center',
    justifyContent: 'center',
    ...SOMBRAS.tarjeta,
  },
  titulo: { ...TIPOGRAFIA.titulo2, color: COLORES.texto, textAlign: 'center' },
  filaFechas: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  chip: {
    ...TIPOGRAFIA.leyenda,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: RADIOS.accion,
    overflow: 'hidden',
    backgroundColor: COLORES_ASISTENCIA.chipPendienteFondo,
    color: COLORES_ASISTENCIA.chipPendienteTexto,
  },
  chipRojo: { backgroundColor: COLORES_ASISTENCIA.alertaFondo, color: COLORES.error },
  chipVerde: { backgroundColor: COLORES.exitoFondo, color: COLORES_ASISTENCIA.verdeTexto },
  etiqueta: { ...TIPOGRAFIA.leyenda, color: COLORES.textoSutil, marginTop: 4 },
  texto: { ...TIPOGRAFIA.subtitulo, color: COLORES.texto },
  leyenda: { ...TIPOGRAFIA.leyenda, color: COLORES.textoAtenuado },
  error: { ...TIPOGRAFIA.leyenda, color: COLORES.error },
  avisoExito: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: RADIOS.accion,
    borderWidth: 1,
    borderColor: COLORES_ASISTENCIA.verdeTexto,
    backgroundColor: COLORES.exitoFondo,
  },
  textoExito: { ...TIPOGRAFIA.etiqueta, color: COLORES_ASISTENCIA.verdeTexto },
  avisoRevision: {
    ...TIPOGRAFIA.leyenda,
    padding: 10,
    borderRadius: RADIOS.accion,
    overflow: 'hidden',
    backgroundColor: COLORES_ASISTENCIA.chipPendienteFondo,
    color: COLORES_ASISTENCIA.chipPendienteTexto,
  },
  avisoRechazo: {
    gap: 4,
    padding: 12,
    borderRadius: RADIOS.accion,
    backgroundColor: COLORES_ASISTENCIA.alertaFondo,
  },
  tituloRechazo: { ...TIPOGRAFIA.etiqueta, color: COLORES_ASISTENCIA.rojoTexto },
  boton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: RADIOS.accion,
    borderWidth: 1,
    borderColor: COLORES_ASISTENCIA.bordeChip,
    backgroundColor: COLORES.pantalla,
  },
  textoBoton: { ...TIPOGRAFIA.etiqueta, color: COLORES.texto },
  mas: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORES_ASISTENCIA.azul,
  },
  evidencia: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  miniatura: { width: 72 },
  datosEvidencia: { flex: 1, gap: 2 },
  estado: { ...TIPOGRAFIA.leyenda, color: COLORES_ASISTENCIA.chipPendienteTexto },
  estadoAprobado: { color: COLORES_ASISTENCIA.verdeTexto },
  estadoRechazado: { color: COLORES_ASISTENCIA.rojoTexto },
});
