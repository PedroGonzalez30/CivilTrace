/**
 * @archivo PantallaDesempeno.tsx
 * @proyecto Civil Trace
 * @descripcion Desempeño de un trabajador (Figma DesempenoTrabajador-Dueño, 2273:219): periodo
 *   Semana / Mes / Todo y las tarjetas Asistencia, Evidencias aceptadas, Actividades entregadas y
 *   Actividades aprobadas (D-30). La abren el dueño desde Personal y el supervisor desde Asistencia.
 * @autor Emilio Manuel Esquivel
 * @fecha 25/11/2026
 * @version 1.0.0
 * @requerimientos RF-64 Mostrar métricas de desempeño (SRS V4.0; D-30)
 * @historial 25/11/2026 - Emilio Manuel Esquivel - Creación (feature 005)
 */

// 1. Importaciones
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import EncabezadoApp from '@/componentes/EncabezadoApp';
import { IconoChevronIzquierda } from '@/componentes/Iconos';
import TarjetaMetrica from '@/componentes/TarjetaMetrica';
import { ErrorApi } from '@/conexion/clienteApi';
import { COLORES } from '@/constantes/colores';
import { RADIOS, SOMBRAS, TIPOGRAFIA } from '@/constantes/tema';
import { COLORES_ASISTENCIA } from '@/constantes/textosAsistencia';
import { obtenerDesempeno } from '@/servicios/servicioDesempeno';
import type { Desempeno, PeriodoDesempeno } from '@/tipos/desempeno';
import { obtenerIniciales } from '@/utilidades/obtenerIniciales';

// 2. Tipos e interfaces
interface PantallaDesempenoProps {
  tokenAcceso: string;
  trabajadorId: string;
  /** Texto bajo el oficio, por ejemplo el nombre de la obra. */
  contexto?: string;
  onRegresar: () => void;
}

// 3. Constantes del módulo
const PERIODOS: { valor: PeriodoDesempeno; etiqueta: string }[] = [
  { valor: 'SEMANA', etiqueta: 'Semana' },
  { valor: 'MES', etiqueta: 'Mes' },
  { valor: 'TODO', etiqueta: 'Todo' },
];
const VERDE = '#22c55e';
const NARANJA = '#f59e0b';
const ROJO = '#ef4444';
const AZUL = COLORES_ASISTENCIA.azul;
const SIN_DATOS = 'Sin datos';

// 4. Componente principal
function formatearPorcentaje(valor: number | null): string {
  return valor === null ? SIN_DATOS : `${valor}%`;
}

function plural(cantidad: number, singular: string, varios: string): string {
  return `${cantidad} ${cantidad === 1 ? singular : varios}`;
}

export default function PantallaDesempeno({
  tokenAcceso,
  trabajadorId,
  contexto,
  onRegresar,
}: PantallaDesempenoProps) {
  const [periodo, setPeriodo] = useState<PeriodoDesempeno>('MES');
  const [datos, setDatos] = useState<Desempeno | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      setDatos(await obtenerDesempeno(tokenAcceso, trabajadorId, periodo));
    } catch (errorCarga) {
      setError(
        errorCarga instanceof ErrorApi ? errorCarga.message : 'No se pudo cargar el desempeño.',
      );
    } finally {
      setCargando(false);
    }
  }, [tokenAcceso, trabajadorId, periodo]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const asistencia = datos?.asistencia;
  const parciales = asistencia
    ? asistencia.retardos + asistencia.mediasJornadas + asistencia.salidasTempranas
    : 0;

  return (
    <View style={estilos.contenedor}>
      <EncabezadoApp />
      <ScrollView contentContainerStyle={estilos.contenido}>
        <View style={estilos.encabezado}>
          <Pressable style={estilos.regresar} onPress={onRegresar} accessibilityLabel="Regresar">
            <IconoChevronIzquierda tamano={20} color={COLORES.textoAtenuado} />
          </Pressable>
          <Text style={estilos.titulo}>Desempeño</Text>
        </View>

        {datos ? (
          <View style={estilos.persona}>
            <View style={estilos.avatar}>
              <Text style={estilos.iniciales}>{obtenerIniciales(datos.trabajador.nombre)}</Text>
            </View>
            <View style={estilos.textosPersona}>
              <Text style={estilos.nombre}>{datos.trabajador.nombre}</Text>
              <Text style={estilos.oficio}>
                {[datos.trabajador.oficio, contexto].filter(Boolean).join(' · ') || 'Trabajador'}
              </Text>
            </View>
          </View>
        ) : null}

        <View style={estilos.periodos} accessibilityRole="tablist">
          {PERIODOS.map((opcion) => (
            <Pressable
              key={opcion.valor}
              accessibilityRole="tab"
              accessibilityState={{ selected: periodo === opcion.valor }}
              style={[estilos.periodo, periodo === opcion.valor && estilos.periodoActivo]}
              onPress={() => setPeriodo(opcion.valor)}
            >
              <Text style={[estilos.textoPeriodo, periodo === opcion.valor && estilos.textoActivo]}>
                {opcion.etiqueta}
              </Text>
            </Pressable>
          ))}
        </View>

        {cargando && !datos ? (
          <ActivityIndicator color={COLORES.marca} />
        ) : error ? (
          <View style={estilos.centro}>
            <Text style={estilos.error}>{error}</Text>
            <Pressable onPress={() => void cargar()}>
              <Text style={estilos.enlace}>Reintentar</Text>
            </Pressable>
          </View>
        ) : datos && asistencia ? (
          <View style={estilos.tarjetas}>
            <TarjetaMetrica
              titulo="Asistencia"
              valor={formatearPorcentaje(asistencia.porcentaje)}
              colorValor={COLORES_ASISTENCIA.verdeTexto}
              segmentos={[
                { cantidad: asistencia.completos, color: VERDE, etiqueta: 'completos' },
                { cantidad: parciales, color: NARANJA, etiqueta: 'parciales' },
                { cantidad: asistencia.faltas, color: ROJO, etiqueta: 'faltas' },
              ]}
              detalle={`${asistencia.completos} de ${asistencia.total} días completos · ${plural(parciales, 'retardo o media jornada', 'retardos o medias jornadas')} · ${plural(asistencia.faltas, 'falta', 'faltas')}`}
            />
            <TarjetaMetrica
              titulo="Evidencias aceptadas"
              valor={formatearPorcentaje(datos.evidencias.porcentaje)}
              colorValor={AZUL}
              segmentos={[
                { cantidad: datos.evidencias.aprobadas, color: AZUL, etiqueta: 'aceptadas' },
                { cantidad: datos.evidencias.rechazadas, color: ROJO, etiqueta: 'rechazadas' },
              ]}
            />
            <TarjetaMetrica
              titulo="Actividades entregadas"
              valor={String(datos.actividadesEntregadas.total)}
              colorValor={COLORES.texto}
              segmentos={[
                {
                  cantidad: datos.actividadesEntregadas.antes,
                  color: VERDE,
                  etiqueta: 'antes de la fecha',
                },
                {
                  cantidad: datos.actividadesEntregadas.mismoDia,
                  color: AZUL,
                  etiqueta: 'el mismo día',
                },
                {
                  cantidad: datos.actividadesEntregadas.conRetraso,
                  color: NARANJA,
                  etiqueta: 'con retraso',
                },
              ]}
            />
            <TarjetaMetrica
              titulo="Actividades aprobadas"
              valor={formatearPorcentaje(datos.actividadesAprobadas.porcentaje)}
              colorValor={COLORES_ASISTENCIA.verdeTexto}
              segmentos={[
                {
                  cantidad: datos.actividadesAprobadas.aprobadas,
                  color: VERDE,
                  etiqueta: 'aprobadas',
                },
                {
                  cantidad: datos.actividadesAprobadas.rechazadas,
                  color: ROJO,
                  etiqueta: 'rechazadas',
                },
              ]}
            />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: COLORES.pantalla },
  contenido: { padding: 16, gap: 14, paddingBottom: 32 },
  encabezado: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  regresar: {
    width: 40,
    height: 40,
    borderRadius: RADIOS.pildora,
    backgroundColor: COLORES.superficie,
    alignItems: 'center',
    justifyContent: 'center',
    ...SOMBRAS.botonRegresar,
  },
  titulo: { ...TIPOGRAFIA.titulo1, color: COLORES.texto },
  persona: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORES.superficie,
    borderRadius: RADIOS.tarjeta,
    padding: 16,
    ...SOMBRAS.tarjeta,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORES_ASISTENCIA.azulSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iniciales: { ...TIPOGRAFIA.etiqueta, color: AZUL },
  textosPersona: { flex: 1 },
  nombre: { ...TIPOGRAFIA.titulo3, color: COLORES.texto },
  oficio: { ...TIPOGRAFIA.leyenda, color: COLORES.textoAtenuado },
  periodos: {
    flexDirection: 'row',
    backgroundColor: COLORES.borde,
    borderRadius: RADIOS.accion,
    padding: 4,
  },
  periodo: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: RADIOS.mosaico },
  periodoActivo: { backgroundColor: COLORES.superficie },
  textoPeriodo: { ...TIPOGRAFIA.etiqueta, color: COLORES.textoAtenuado },
  textoActivo: { color: COLORES.texto },
  tarjetas: { gap: 14 },
  centro: { alignItems: 'center', gap: 8, paddingVertical: 24 },
  error: { ...TIPOGRAFIA.leyenda, color: COLORES.error, textAlign: 'center' },
  enlace: { ...TIPOGRAFIA.etiqueta, color: COLORES.marca },
});
