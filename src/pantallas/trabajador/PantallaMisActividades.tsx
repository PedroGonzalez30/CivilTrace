/**
 * @archivo PantallaMisActividades.tsx
 * @proyecto Civil Trace
 * @descripcion Inicio del trabajador (Figma TRA VER ACTIVIDADES, 58:344): sus actividades activas
 *   en todas sus obras, con los días restantes y un "+" para subir evidencia.
 * @autor Emilio Manuel Esquivel
 * @fecha 24/11/2026
 * @version 1.0.0
 * @requerimientos CP11 Consultar actividades, CP12 Capturar evidencia fotográfica
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Creación (feature 003)
 */

// 1. Importaciones
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import EncabezadoApp from '@/componentes/EncabezadoApp';
import { IconoMas } from '@/componentes/Iconos';
import { ErrorApi } from '@/conexion/clienteApi';
import { COLORES } from '@/constantes/colores';
import { COLORES_ASISTENCIA } from '@/constantes/textosAsistencia';
import { RADIOS, SOMBRAS, TIPOGRAFIA } from '@/constantes/tema';
import { obtenerMisActividades } from '@/servicios/servicioActividades';
import type { MiActividad } from '@/tipos/actividad';
import type { SesionAutenticacion } from '@/tipos/autenticacion';
import { calcularTextoRestante } from '@/utilidades/diasRestantes';

// 2. Tipos e interfaces
interface PantallaMisActividadesProps {
  sesion: SesionAutenticacion;
  onAbrirActividad: (actividad: MiActividad) => void;
  onSubirEvidencia: (actividad: MiActividad) => void;
}

// 3. Constantes del módulo
const MENSAJE_ERROR = 'No se pudieron cargar tus actividades.';
const MENSAJE_SIN_ACTIVIDADES = 'No tienes actividades pendientes. ¡Buen trabajo!';

// 4. Componente principal
export default function PantallaMisActividades({
  sesion,
  onAbrirActividad,
  onSubirEvidencia,
}: PantallaMisActividadesProps) {
  const [actividades, setActividades] = useState<MiActividad[] | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      setActividades(await obtenerMisActividades(sesion.token));
    } catch (falla) {
      setError(falla instanceof ErrorApi ? falla.message : MENSAJE_ERROR);
    } finally {
      setCargando(false);
    }
  }, [sesion.token]);

  // Se recarga cada vez que se vuelve a la pestaña (por ejemplo, después de subir evidencia).
  useFocusEffect(
    useCallback(() => {
      void cargar();
    }, [cargar]),
  );

  return (
    <View style={estilos.contenedor}>
      <EncabezadoApp />
      <ScrollView
        contentContainerStyle={estilos.contenido}
        refreshControl={<RefreshControl refreshing={cargando} onRefresh={() => void cargar()} />}
      >
        <Text style={estilos.titulo}>{sesion.usuario.empresa ?? 'Mis actividades'}</Text>
        <Text style={estilos.subtitulo}>
          Revisa tus actividades de hoy y comparte tus evidencias
        </Text>
        <View style={estilos.tarjeta}>
          <Text style={estilos.tituloTarjeta}>Actividades</Text>
          <Text style={estilos.leyenda}>Estas son tus actividades de hoy</Text>
          {error ? <Text style={estilos.error}>{error}</Text> : null}
          {actividades === null && !error ? (
            <ActivityIndicator color={COLORES_ASISTENCIA.azul} />
          ) : null}
          {actividades?.length === 0 ? (
            <Text style={estilos.leyenda}>{MENSAJE_SIN_ACTIVIDADES}</Text>
          ) : null}
          {actividades?.map((actividad) => {
            const restante = calcularTextoRestante(actividad.fechaEntrega);
            return (
              <Pressable
                key={actividad.id}
                style={estilos.item}
                onPress={() => onAbrirActividad(actividad)}
                accessibilityRole="button"
              >
                <View style={estilos.datos}>
                  <Text style={estilos.nombre}>{actividad.nombre}</Text>
                  <Text style={estilos.obra}>{actividad.obraNombre}</Text>
                  {actividad.enRevision ? (
                    <Text style={estilos.enRevision}>Entrega en revisión</Text>
                  ) : restante.texto ? (
                    <Text style={[estilos.restante, restante.esVencida && estilos.vencida]}>
                      {restante.texto}
                    </Text>
                  ) : null}
                  <Text style={estilos.leyenda}>Entrega: {actividad.fechaEntrega}</Text>
                </View>
                <Pressable
                  style={estilos.mas}
                  onPress={() => onSubirEvidencia(actividad)}
                  accessibilityRole="button"
                  accessibilityLabel={`Subir evidencia de ${actividad.nombre}`}
                  hitSlop={8}
                >
                  <IconoMas tamano={16} />
                </Pressable>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: COLORES.pantalla },
  contenido: { padding: 18, gap: 8, paddingBottom: 40 },
  titulo: { ...TIPOGRAFIA.titulo1, color: COLORES.texto },
  subtitulo: { ...TIPOGRAFIA.subtitulo, color: COLORES.textoAtenuado, marginBottom: 6 },
  tarjeta: {
    backgroundColor: COLORES.superficie,
    borderRadius: RADIOS.tarjeta,
    padding: 16,
    gap: 12,
    ...SOMBRAS.tarjeta,
  },
  tituloTarjeta: { ...TIPOGRAFIA.titulo4, color: COLORES.texto },
  leyenda: { ...TIPOGRAFIA.leyenda, color: COLORES.textoAtenuado },
  error: { ...TIPOGRAFIA.leyenda, color: COLORES.error },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: RADIOS.accion,
    borderWidth: 1,
    borderColor: COLORES_ASISTENCIA.bordeChip,
    backgroundColor: COLORES.pantalla,
  },
  datos: { flex: 1, gap: 4 },
  nombre: { ...TIPOGRAFIA.etiqueta, color: COLORES.texto },
  obra: { ...TIPOGRAFIA.leyenda, color: COLORES.textoSutil },
  restante: { ...TIPOGRAFIA.leyenda, color: COLORES_ASISTENCIA.naranjaTexto },
  vencida: { color: COLORES.error },
  enRevision: { ...TIPOGRAFIA.leyenda, color: COLORES_ASISTENCIA.chipPendienteTexto },
  mas: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORES_ASISTENCIA.azul,
  },
});
