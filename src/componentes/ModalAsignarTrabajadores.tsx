/**
 * @archivo ModalAsignarTrabajadores.tsx
 * @proyecto Civil Trace
 * @descripcion Ventana para ver los trabajadores de una obra y agregar otros de la empresa después
 *   de crearla. La usan el dueño y el supervisor de la obra desde el detalle de la obra.
 * @autor Emilio Manuel Esquivel
 * @fecha 25/11/2026
 * @version 1.0.0
 * @requerimientos RF-68 Asignar trabajadores a una obra (SRS v5.0)
 * @historial 25/11/2026 - Emilio Manuel Esquivel - Creación (feature 006)
 */

// 1. Importaciones
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import BotonPrincipal from '@/componentes/BotonPrincipal';
import { ErrorApi } from '@/conexion/clienteApi';
import { COLORES } from '@/constantes/colores';
import { RADIOS, TIPOGRAFIA } from '@/constantes/tema';
import {
  asignarTrabajadores,
  listarTrabajadoresDeObra,
  type TrabajadoresDeObra,
} from '@/servicios/servicioObras';

// 2. Tipos e interfaces
interface ModalAsignarTrabajadoresProps {
  visible: boolean;
  tokenAcceso: string;
  idObra: string;
  onCerrar: () => void;
}

// 4. Componente principal
export default function ModalAsignarTrabajadores({
  visible,
  tokenAcceso,
  idObra,
  onCerrar,
}: ModalAsignarTrabajadoresProps) {
  const [datos, setDatos] = useState<TrabajadoresDeObra | null>(null);
  const [elegidos, setElegidos] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setError(null);
    try {
      setDatos(await listarTrabajadoresDeObra(tokenAcceso, idObra));
    } catch (errorCarga) {
      setError(
        errorCarga instanceof ErrorApi ? errorCarga.message : 'No se pudo cargar el personal.',
      );
    }
  }, [tokenAcceso, idObra]);

  useEffect(() => {
    if (visible) {
      setElegidos([]);
      setAviso(null);
      void cargar();
    }
  }, [visible, cargar]);

  const alternar = (id: string) =>
    setElegidos((previos) =>
      previos.includes(id) ? previos.filter((elegido) => elegido !== id) : [...previos, id],
    );

  const manejarAgregar = async () => {
    setGuardando(true);
    setError(null);
    try {
      setDatos(await asignarTrabajadores(tokenAcceso, idObra, elegidos));
      setAviso(
        elegidos.length === 1
          ? 'Se agregó 1 trabajador.'
          : `Se agregaron ${elegidos.length} trabajadores.`,
      );
      setElegidos([]);
    } catch (errorGuardar) {
      setError(errorGuardar instanceof ErrorApi ? errorGuardar.message : 'No se pudo guardar.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCerrar}>
      <View style={estilos.fondo}>
        <View style={estilos.hoja}>
          <View style={estilos.encabezado}>
            <Text style={estilos.titulo}>Trabajadores de la obra</Text>
            <Pressable onPress={onCerrar} accessibilityLabel="Cerrar" hitSlop={12}>
              <Text style={estilos.cerrar}>✕</Text>
            </Pressable>
          </View>
          {!datos && !error ? (
            <ActivityIndicator color={COLORES.marca} />
          ) : (
            <ScrollView contentContainerStyle={estilos.lista}>
              <Text style={estilos.seccion}>Asignados ({datos?.asignados.length ?? 0})</Text>
              {datos?.asignados.length === 0 ? (
                <Text style={estilos.nota}>Todavía no hay trabajadores en esta obra.</Text>
              ) : (
                datos?.asignados.map((trabajador) => (
                  <Text key={trabajador.id} style={estilos.asignado}>
                    ✓ {trabajador.nombre}
                    {trabajador.oficio ? ` · ${trabajador.oficio}` : ''}
                  </Text>
                ))
              )}
              <Text style={estilos.seccion}>Agregar</Text>
              {datos?.disponibles.length === 0 ? (
                <Text style={estilos.nota}>
                  Todos los trabajadores de la empresa ya están aquí.
                </Text>
              ) : (
                datos?.disponibles.map((trabajador) => {
                  const estaElegido = elegidos.includes(trabajador.id);
                  return (
                    <Pressable
                      key={trabajador.id}
                      style={[estilos.opcion, estaElegido && estilos.opcionElegida]}
                      onPress={() => alternar(trabajador.id)}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: estaElegido }}
                      accessibilityLabel={trabajador.nombre}
                    >
                      <Text style={estilos.casilla}>{estaElegido ? '☑' : '☐'}</Text>
                      <Text style={estilos.nombre}>
                        {trabajador.nombre}
                        {trabajador.oficio ? ` · ${trabajador.oficio}` : ''}
                      </Text>
                    </Pressable>
                  );
                })
              )}
            </ScrollView>
          )}
          {error ? <Text style={estilos.error}>{error}</Text> : null}
          {aviso ? <Text style={estilos.aviso}>{aviso}</Text> : null}
          <BotonPrincipal
            etiqueta={elegidos.length > 0 ? `Agregar (${elegidos.length})` : 'Agregar'}
            estaCargando={guardando}
            deshabilitado={elegidos.length === 0}
            onPresionar={() => void manejarAgregar()}
          />
        </View>
      </View>
    </Modal>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: COLORES.superposicion, justifyContent: 'flex-end' },
  hoja: {
    maxHeight: '85%',
    backgroundColor: COLORES.superficie,
    borderTopLeftRadius: RADIOS.encabezado,
    borderTopRightRadius: RADIOS.encabezado,
    padding: 20,
    gap: 12,
  },
  encabezado: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titulo: { ...TIPOGRAFIA.titulo3, color: COLORES.texto },
  cerrar: { ...TIPOGRAFIA.titulo4, color: COLORES.textoSutil },
  lista: { gap: 8, paddingBottom: 8 },
  seccion: { ...TIPOGRAFIA.etiqueta, color: COLORES.texto, marginTop: 6 },
  nota: { ...TIPOGRAFIA.leyenda, color: COLORES.textoAtenuado },
  asignado: { ...TIPOGRAFIA.leyenda, color: COLORES.exitoTexto },
  opcion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: RADIOS.accion,
    borderWidth: 1,
    borderColor: COLORES.borde,
  },
  opcionElegida: { borderColor: COLORES.marca, backgroundColor: COLORES.fondoFila },
  casilla: { ...TIPOGRAFIA.titulo4, color: COLORES.marca },
  nombre: { ...TIPOGRAFIA.leyenda, color: COLORES.texto, flex: 1 },
  error: { ...TIPOGRAFIA.leyenda, color: COLORES.error },
  aviso: { ...TIPOGRAFIA.leyenda, color: COLORES.exitoTexto },
});
