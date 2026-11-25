/**
 * @archivo PantallaPersonalObra.tsx
 * @proyecto Civil Trace
 * @descripcion Lista de trabajadores de una obra para que el supervisor abra el desempeño de cada
 *   uno (retroalimentación del equipo: el mismo botón Personal que tiene el dueño).
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
import { IconoChevronDerecha, IconoChevronIzquierda } from '@/componentes/Iconos';
import { ErrorApi } from '@/conexion/clienteApi';
import { COLORES } from '@/constantes/colores';
import { RADIOS, SOMBRAS, TIPOGRAFIA } from '@/constantes/tema';
import { obtenerResumenDia } from '@/servicios/servicioAsistencia';
import type { TrabajadorResumen } from '@/tipos/asistencia';
import { obtenerIniciales } from '@/utilidades/obtenerIniciales';

// 2. Tipos e interfaces
interface PantallaPersonalObraProps {
  tokenAcceso: string;
  obraId: string;
  obraNombre: string;
  onElegir: (trabajador: TrabajadorResumen) => void;
  onRegresar: () => void;
}

// 4. Componente principal
export default function PantallaPersonalObra({
  tokenAcceso,
  obraId,
  obraNombre,
  onElegir,
  onRegresar,
}: PantallaPersonalObraProps) {
  const [trabajadores, setTrabajadores] = useState<TrabajadorResumen[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setError(null);
    try {
      setTrabajadores((await obtenerResumenDia(tokenAcceso, obraId)).trabajadores);
    } catch (errorCarga) {
      setError(
        errorCarga instanceof ErrorApi ? errorCarga.message : 'No se pudo cargar el personal.',
      );
    }
  }, [tokenAcceso, obraId]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  return (
    <View style={estilos.contenedor}>
      <EncabezadoApp />
      <ScrollView contentContainerStyle={estilos.contenido}>
        <View style={estilos.encabezado}>
          <Pressable style={estilos.regresar} onPress={onRegresar} accessibilityLabel="Regresar">
            <IconoChevronIzquierda tamano={20} color={COLORES.textoAtenuado} />
          </Pressable>
          <View style={estilos.textosEncabezado}>
            <Text style={estilos.titulo}>Personal</Text>
            <Text style={estilos.subtitulo}>
              {obraNombre} · Toca a un trabajador para ver su desempeño
            </Text>
          </View>
        </View>
        {error ? (
          <View style={estilos.centro}>
            <Text style={estilos.error}>{error}</Text>
            <Pressable onPress={() => void cargar()}>
              <Text style={estilos.enlace}>Reintentar</Text>
            </Pressable>
          </View>
        ) : !trabajadores ? (
          <ActivityIndicator color={COLORES.marca} />
        ) : trabajadores.length === 0 ? (
          <Text style={estilos.vacio}>Esta obra aún no tiene trabajadores asignados.</Text>
        ) : (
          trabajadores.map((trabajador) => (
            <Pressable
              key={trabajador.id}
              style={estilos.fila}
              onPress={() => onElegir(trabajador)}
              accessibilityRole="button"
              accessibilityLabel={`Ver desempeño de ${trabajador.nombre}`}
            >
              <View style={estilos.avatar}>
                <Text style={estilos.iniciales}>{obtenerIniciales(trabajador.nombre)}</Text>
              </View>
              <View style={estilos.textosFila}>
                <Text style={estilos.nombre}>{trabajador.nombre}</Text>
                <Text style={estilos.oficio}>{trabajador.oficio ?? 'Trabajador'}</Text>
              </View>
              <IconoChevronDerecha />
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: COLORES.pantalla },
  contenido: { padding: 16, gap: 12, paddingBottom: 32 },
  encabezado: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  regresar: {
    width: 40,
    height: 40,
    borderRadius: RADIOS.pildora,
    backgroundColor: COLORES.superficie,
    alignItems: 'center',
    justifyContent: 'center',
    ...SOMBRAS.botonRegresar,
  },
  textosEncabezado: { flex: 1 },
  titulo: { ...TIPOGRAFIA.titulo1, color: COLORES.texto },
  subtitulo: { ...TIPOGRAFIA.leyenda, color: COLORES.textoAtenuado },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: COLORES.superficie,
    borderRadius: RADIOS.tarjeta,
    ...SOMBRAS.tarjeta,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORES.fondoAvatar,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iniciales: { ...TIPOGRAFIA.etiqueta, color: COLORES.textoSutil },
  textosFila: { flex: 1 },
  nombre: { ...TIPOGRAFIA.etiqueta, color: COLORES.texto },
  oficio: { ...TIPOGRAFIA.leyenda, color: COLORES.textoAtenuado },
  centro: { alignItems: 'center', gap: 8, paddingVertical: 24 },
  error: { ...TIPOGRAFIA.leyenda, color: COLORES.error, textAlign: 'center' },
  enlace: { ...TIPOGRAFIA.etiqueta, color: COLORES.marca },
  vacio: { ...TIPOGRAFIA.leyenda, color: COLORES.textoAtenuado, textAlign: 'center' },
});
