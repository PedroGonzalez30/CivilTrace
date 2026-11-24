/**
 * @archivo SelectorOpcion.tsx
 * @proyecto Civil Trace
 * @descripcion Campo que abre una lista para elegir una opción (se usa para el supervisor).
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 16/11/2026
 * @version 1.0.0
 */

// 1. Importaciones
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import IconoFlecha from '@/componentes/IconoFlecha';
import { IconoCheck } from '@/componentes/Iconos';
import { COLORES } from '@/constantes/colores';
import { RADIOS, SOMBRAS, TAMANOS, TIPOGRAFIA } from '@/constantes/tema';

// 2. Tipos e interfaces
export interface OpcionSelector {
  id: string;
  etiqueta: string;
}

interface SelectorOpcionProps {
  etiqueta: string;
  valor: string;
  textoMarcador: string;
  opciones: OpcionSelector[];
  error?: string;
  onSeleccionar: (idOpcion: string) => void;
}

// 3. Constantes del módulo
const TAMANO_ICONO_CHECK = 16;

// 4. Componente principal
export default function SelectorOpcion({
  etiqueta,
  valor,
  textoMarcador,
  opciones,
  error,
  onSeleccionar,
}: SelectorOpcionProps) {
  const [estaAbierto, setEstaAbierto] = useState(false);
  // El id vacío es la opción "ninguno": se muestra el marcador, no su etiqueta.
  const opcionActual = valor ? opciones.find((opcion) => opcion.id === valor) : undefined;

  const manejarApertura = () => setEstaAbierto(true);
  const manejarCierre = () => setEstaAbierto(false);

  const manejarSeleccion = (idOpcion: string) => {
    setEstaAbierto(false);
    onSeleccionar(idOpcion);
  };

  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>
      <Pressable style={[estilos.caja, error ? estilos.cajaError : null]} onPress={manejarApertura}>
        <Text style={estilos.texto} numberOfLines={1}>
          {opcionActual?.etiqueta ?? textoMarcador}
        </Text>
        <IconoFlecha direccion={estaAbierto ? 'arriba' : 'abajo'} />
      </Pressable>
      {error ? <Text style={estilos.error}>{error}</Text> : null}
      <Modal
        transparent
        visible={estaAbierto}
        statusBarTranslucent
        animationType="none"
        onRequestClose={manejarCierre}
      >
        <View style={estilos.superposicion}>
          <Pressable style={StyleSheet.absoluteFill} onPress={manejarCierre} />
          <View style={estilos.tarjeta}>
            <Text style={estilos.titulo}>{etiqueta}</Text>
            <ScrollView style={estilos.lista}>
              {opciones.map((opcion, indice) => (
                <View key={`${indice}-${opcion.id}`}>
                  {indice > 0 && <View style={estilos.divisor} />}
                  <Pressable style={estilos.opcion} onPress={() => manejarSeleccion(opcion.id)}>
                    <Text
                      style={opcion.id === valor ? estilos.textoSeleccionado : estilos.textoOpcion}
                    >
                      {opcion.etiqueta}
                    </Text>
                    {opcion.id === valor ? (
                      <IconoCheck tamano={TAMANO_ICONO_CHECK} color={COLORES.marca} />
                    ) : null}
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  contenedor: {
    gap: 8,
  },
  etiqueta: {
    ...TIPOGRAFIA.etiqueta,
    color: COLORES.texto,
  },
  caja: {
    height: TAMANOS.entrada,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: 16,
    backgroundColor: COLORES.fondoEntrada,
    borderWidth: 1,
    borderColor: COLORES.borde,
    borderRadius: RADIOS.entrada,
  },
  cajaError: {
    borderColor: COLORES.error,
  },
  texto: {
    flex: 1,
    ...TIPOGRAFIA.entrada,
    color: COLORES.textoAtenuado,
  },
  error: {
    ...TIPOGRAFIA.leyenda,
    color: COLORES.error,
  },
  superposicion: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 23,
    backgroundColor: COLORES.superposicion,
  },
  tarjeta: {
    gap: 12,
    padding: 20,
    backgroundColor: COLORES.superficie,
    borderWidth: 1,
    borderColor: COLORES.bordeModal,
    borderRadius: RADIOS.modal,
    ...SOMBRAS.modal,
  },
  titulo: {
    ...TIPOGRAFIA.titulo3,
    color: COLORES.texto,
  },
  lista: {
    maxHeight: TAMANOS.listaSeleccion,
  },
  opcion: {
    height: TAMANOS.opcion,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textoOpcion: {
    ...TIPOGRAFIA.entrada,
    color: COLORES.texto,
  },
  textoSeleccionado: {
    ...TIPOGRAFIA.etiqueta,
    color: COLORES.marca,
  },
  divisor: {
    height: 1,
    backgroundColor: COLORES.divisor,
  },
});
