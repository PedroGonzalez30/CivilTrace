/**
 * @archivo HojaDetallesAsistencia.tsx
 * @proyecto Civil Trace
 * @descripcion Hoja inferior "Detalles de asistencia" (Figma SUP_DetallesAsistencia, 2272:250):
 *   tipo de jornada, motivo, efecto en el pago, anotaciones y edición de horas. Se abre al
 *   mantener presionado a un trabajador en el resumen del día.
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.1.0
 * @historial 23/11/2026 - Emilio Manuel Esquivel - El teclado ya no tapa las anotaciones
 * @requerimientos RF-60 Registrar retardo o salida anticipada, D-07
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001)
 */

// 1. Importaciones
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import BotonPrincipal from '@/componentes/BotonPrincipal';
import { IconoCalendario } from '@/componentes/Iconos';
import SelectorHora from '@/componentes/SelectorHora';
import { COLORES } from '@/constantes/colores';
import {
  COLORES_ASISTENCIA,
  ETIQUETAS_EFECTO_PAGO,
  ETIQUETAS_MOTIVO,
  ETIQUETAS_TIPO_JORNADA,
} from '@/constantes/textosAsistencia';
import { RADIOS, TIPOGRAFIA } from '@/constantes/tema';
import { useDetallesDia } from '@/hooks/useDetallesDia';
import type { SesionAutenticacion } from '@/tipos/autenticacion';
import type { EfectoPago, MotivoAsistencia, TipoJornada } from '@/tipos/asistencia';
import { formatearHoraCampo } from '@/utilidades/formatoHoras';
import { obtenerIniciales } from '@/utilidades/obtenerIniciales';

// 2. Tipos e interfaces
interface HojaDetallesAsistenciaProps {
  visible: boolean;
  sesion: SesionAutenticacion;
  obraId: string;
  trabajadorId: string;
  fecha: string;
  zonaHoraria: string;
  onCerrar: () => void;
  onGuardado: () => void;
  onVerCalendario: () => void;
}

// 3. Constantes del módulo
const TIPOS = Object.keys(ETIQUETAS_TIPO_JORNADA) as TipoJornada[];
const MOTIVOS = Object.keys(ETIQUETAS_MOTIVO) as MotivoAsistencia[];
const EFECTOS = Object.keys(ETIQUETAS_EFECTO_PAGO) as EfectoPago[];

// 4. Componente principal
export default function HojaDetallesAsistencia(props: HojaDetallesAsistenciaProps) {
  const {
    visible,
    sesion,
    obraId,
    trabajadorId,
    fecha,
    zonaHoraria,
    onCerrar,
    onGuardado,
    onVerCalendario,
  } = props;
  const { detalle, formulario, guardando, error, cambiar, guardar } = useDetallesDia({
    tokenAcceso: sesion.token,
    obraId,
    trabajadorId,
    fecha,
    zonaHoraria,
  });
  const [editandoHoras, setEditandoHoras] = useState(false);

  const manejarGuardar = async () => {
    if (await guardar()) {
      onGuardado();
    }
  };

  const [anio, mes, dia] = fecha.split('-');
  const textoHora = (hora: string | null | undefined) =>
    hora ? formatearHoraCampo(hora).replace(/^0/, '') : '—';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCerrar}>
      {/* Sube la hoja sobre el teclado al escribir las anotaciones. */}
      <KeyboardAvoidingView style={estilos.teclado} behavior="padding">
        <Pressable style={estilos.fondo} onPress={onCerrar} accessibilityLabel="Cerrar detalles" />
        <View style={estilos.hoja}>
          <View style={estilos.agarradera} />
          {!detalle || !formulario ? (
            error ? (
              <Text style={estilos.error}>{error}</Text>
            ) : (
              <ActivityIndicator color={COLORES_ASISTENCIA.azul} />
            )
          ) : (
            <ScrollView
              contentContainerStyle={estilos.contenido}
              keyboardShouldPersistTaps="handled"
            >
              <View style={estilos.cabecera}>
                <View style={estilos.avatar}>
                  <Text style={estilos.iniciales}>
                    {obtenerIniciales(detalle.trabajador.nombre)}
                  </Text>
                </View>
                <View style={estilos.datos}>
                  <Text style={estilos.nombre}>{detalle.trabajador.nombre}</Text>
                  <Text style={estilos.subtitulo}>
                    {[detalle.trabajador.oficio, detalle.obra.nombre, `${dia}/${mes}/${anio}`]
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                </View>
                <Pressable
                  style={estilos.botonCalendario}
                  onPress={onVerCalendario}
                  accessibilityLabel="Ver calendario de asistencia"
                >
                  <IconoCalendario color={COLORES_ASISTENCIA.azul} />
                </Pressable>
              </View>

              <View style={estilos.horas}>
                <Text style={estilos.textoHoras}>
                  Entrada {textoHora(formulario.horaEntrada)} · Salida{' '}
                  {textoHora(formulario.horaSalida)}
                </Text>
                <Pressable onPress={() => setEditandoHoras((previo) => !previo)}>
                  <Text style={estilos.enlace}>Editar horas</Text>
                </Pressable>
              </View>
              {editandoHoras ? (
                <View style={estilos.filaHoras}>
                  <SelectorHora
                    etiqueta="Entrada"
                    valor={formulario.horaEntrada}
                    onCambiar={(hora) => cambiar({ horaEntrada: hora })}
                  />
                  <SelectorHora
                    etiqueta="Salida"
                    valor={formulario.horaSalida}
                    onCambiar={(hora) => cambiar({ horaSalida: hora })}
                  />
                </View>
              ) : null}

              <Text style={estilos.seccion}>Tipo de jornada</Text>
              <Chips
                opciones={TIPOS}
                etiquetas={ETIQUETAS_TIPO_JORNADA}
                grupo="Tipo de jornada"
                seleccion={formulario.tipoJornada}
                onElegir={(tipoJornada) => cambiar({ tipoJornada })}
              />
              <Text style={estilos.seccion}>Motivo</Text>
              <Chips
                opciones={MOTIVOS}
                etiquetas={ETIQUETAS_MOTIVO}
                grupo="Motivo"
                seleccion={formulario.motivo}
                // Tocar el motivo elegido lo quita: el motivo es opcional.
                onElegir={(motivo) =>
                  cambiar({ motivo: motivo === formulario.motivo ? null : motivo })
                }
              />
              <Text style={estilos.seccion}>Efecto en el pago</Text>
              <View style={estilos.segmento}>
                {EFECTOS.map((efecto) => (
                  <Pressable
                    key={efecto}
                    style={[
                      estilos.opcionSegmento,
                      formulario.efectoPago === efecto && estilos.opcionActiva,
                    ]}
                    onPress={() => cambiar({ efectoPago: efecto })}
                  >
                    <Text
                      style={[
                        estilos.textoSegmento,
                        formulario.efectoPago === efecto && estilos.textoActivo,
                      ]}
                    >
                      {ETIQUETAS_EFECTO_PAGO[efecto]}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Text style={estilos.seccion}>Anotaciones</Text>
              <TextInput
                style={estilos.anotacion}
                value={formulario.anotacion}
                onChangeText={(anotacion) => cambiar({ anotacion })}
                multiline
                accessibilityLabel="Anotaciones"
                placeholder="Escribe una observación"
                placeholderTextColor={COLORES.marcador}
              />
              <Text style={estilos.nota}>
                Se guarda quién hizo el cambio, la fecha, la hora y el valor anterior.
              </Text>
              {error ? <Text style={estilos.error}>{error}</Text> : null}
              <BotonPrincipal
                etiqueta="Guardar detalles"
                estaCargando={guardando}
                onPresionar={() => void manejarGuardar()}
                estilo={estilos.boton}
              />
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Chips<T extends string>({
  opciones,
  etiquetas,
  grupo,
  seleccion,
  onElegir,
}: {
  opciones: T[];
  etiquetas: Record<T, string>;
  grupo: string;
  seleccion: T | null;
  onElegir: (valor: T) => void;
}) {
  return (
    <View style={estilos.chips}>
      {opciones.map((opcion) => {
        const activa = seleccion === opcion;
        return (
          <Pressable
            key={opcion}
            style={[estilos.chip, activa && estilos.chipActivo]}
            onPress={() => onElegir(opcion)}
            accessibilityLabel={`${grupo}: ${etiquetas[opcion]}`}
            accessibilityState={{ selected: activa }}
          >
            <Text style={[estilos.textoChip, activa && estilos.textoChipActivo]}>
              {etiquetas[opcion]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  teclado: { flex: 1 },
  fondo: { flex: 1, backgroundColor: COLORES_ASISTENCIA.fondoOscuro },
  hoja: {
    backgroundColor: COLORES.superficie,
    borderTopLeftRadius: RADIOS.encabezado,
    borderTopRightRadius: RADIOS.encabezado,
    maxHeight: '88%',
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
  cabecera: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORES_ASISTENCIA.azulSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iniciales: { ...TIPOGRAFIA.etiqueta, color: COLORES_ASISTENCIA.azul },
  datos: { flex: 1 },
  nombre: { ...TIPOGRAFIA.titulo3, color: COLORES.texto },
  subtitulo: { ...TIPOGRAFIA.leyenda, color: COLORES.textoSutil },
  botonCalendario: {
    width: 44,
    height: 44,
    borderRadius: RADIOS.accion,
    backgroundColor: COLORES_ASISTENCIA.azulBoton,
    alignItems: 'center',
    justifyContent: 'center',
  },
  horas: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORES.fondoEntrada,
    borderRadius: RADIOS.accion,
    padding: 12,
  },
  textoHoras: { ...TIPOGRAFIA.etiqueta, color: COLORES.texto },
  enlace: { ...TIPOGRAFIA.leyenda, color: COLORES_ASISTENCIA.azul },
  filaHoras: { flexDirection: 'row', gap: 12 },
  seccion: { ...TIPOGRAFIA.etiqueta, color: COLORES.texto },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: COLORES_ASISTENCIA.bordeChip,
    borderRadius: RADIOS.pildora,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActivo: {
    backgroundColor: COLORES_ASISTENCIA.azulChip,
    borderColor: COLORES_ASISTENCIA.azul,
  },
  textoChip: { ...TIPOGRAFIA.leyenda, color: COLORES.textoAtenuado },
  textoChipActivo: { ...TIPOGRAFIA.etiqueta, color: COLORES_ASISTENCIA.azul },
  segmento: {
    flexDirection: 'row',
    backgroundColor: COLORES_ASISTENCIA.diaInactivo,
    borderRadius: RADIOS.accion,
    padding: 4,
  },
  opcionSegmento: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: RADIOS.accion,
  },
  opcionActiva: { backgroundColor: COLORES.superficie },
  textoSegmento: { ...TIPOGRAFIA.leyenda, color: COLORES.textoSutil },
  textoActivo: { ...TIPOGRAFIA.etiqueta, color: COLORES.texto },
  anotacion: {
    ...TIPOGRAFIA.subtitulo,
    minHeight: 72,
    borderWidth: 1,
    borderColor: COLORES.borde,
    borderRadius: RADIOS.accion,
    padding: 12,
    textAlignVertical: 'top',
    color: COLORES.texto,
  },
  nota: { ...TIPOGRAFIA.leyenda, fontSize: 12, color: COLORES.textoSutil },
  error: { ...TIPOGRAFIA.leyenda, color: COLORES.error, paddingHorizontal: 24 },
  boton: { backgroundColor: COLORES_ASISTENCIA.azul },
});
