/**
 * @archivo ModalTrabajadores.tsx
 * @proyecto Civil Trace
 * @descripcion Ventana con una lista de casillas para elegir los trabajadores de una obra.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 16/11/2026
 * @version 1.0.0
 */

// 1. Importaciones
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import BotonPrincipal from '@/componentes/BotonPrincipal';
import { IconoCheck } from '@/componentes/Iconos';
import { COLORES } from '@/constantes/colores';
import { RADIOS, SOMBRAS, TAMANOS, TIPOGRAFIA } from '@/constantes/tema';
import { TEXTOS_ASIGNAR_TRABAJADORES } from '@/constantes/textos';
import type { PersonaEmpresa } from '@/tipos/personal';

// 2. Tipos e interfaces
interface ModalTrabajadoresProps {
  esVisible: boolean;
  trabajadores: PersonaEmpresa[];
  seleccionados: string[];
  onConfirmar: (idsSeleccionados: string[]) => void;
  onCerrar: () => void;
}

interface CasillaProps {
  texto: string;
  estaMarcada: boolean;
  esNegrita?: boolean;
  onPresionar: () => void;
}

// 3. Constantes del módulo
const TAMANO_ICONO_CASILLA = 14;

// 4. Componentes
function Casilla({ texto, estaMarcada, esNegrita = false, onPresionar }: CasillaProps) {
  return (
    <Pressable style={estilos.fila} onPress={onPresionar}>
      <View style={[estilos.casilla, estaMarcada ? estilos.casillaMarcada : null]}>
        {estaMarcada ? <IconoCheck tamano={TAMANO_ICONO_CASILLA} /> : null}
      </View>
      <Text style={esNegrita ? estilos.textoNegrita : estilos.texto}>{texto}</Text>
    </Pressable>
  );
}

export default function ModalTrabajadores({
  esVisible,
  trabajadores,
  seleccionados,
  onConfirmar,
  onCerrar,
}: ModalTrabajadoresProps) {
  // Se trabaja sobre un borrador: si cierran sin pulsar "Listo", no se pierde la selección previa.
  const [borrador, setBorrador] = useState<string[]>(seleccionados);

  useEffect(() => {
    if (esVisible) {
      setBorrador(seleccionados);
    }
  }, [esVisible, seleccionados]);

  const estanTodos = trabajadores.length > 0 && borrador.length === trabajadores.length;

  const manejarAlternar = (idTrabajador: string) => {
    setBorrador((anterior) =>
      anterior.includes(idTrabajador)
        ? anterior.filter((id) => id !== idTrabajador)
        : [...anterior, idTrabajador],
    );
  };

  const manejarAlternarTodos = () => {
    setBorrador(estanTodos ? [] : trabajadores.map((trabajador) => trabajador.id));
  };

  const manejarConfirmar = () => onConfirmar(borrador);

  return (
    <Modal
      transparent
      visible={esVisible}
      statusBarTranslucent
      animationType="none"
      onRequestClose={onCerrar}
    >
      <View style={estilos.superposicion}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCerrar} />
        <View style={estilos.tarjeta}>
          <View style={estilos.encabezado}>
            <Text style={estilos.titulo}>{TEXTOS_ASIGNAR_TRABAJADORES.titulo}</Text>
            <Text style={estilos.descripcion}>{TEXTOS_ASIGNAR_TRABAJADORES.descripcion}</Text>
          </View>
          {trabajadores.length === 0 ? (
            <Text style={estilos.descripcion}>{TEXTOS_ASIGNAR_TRABAJADORES.vacio}</Text>
          ) : (
            <ScrollView style={estilos.lista}>
              <Casilla
                texto={TEXTOS_ASIGNAR_TRABAJADORES.seleccionarTodos}
                estaMarcada={estanTodos}
                esNegrita
                onPresionar={manejarAlternarTodos}
              />
              {trabajadores.map((trabajador) => (
                <Casilla
                  key={trabajador.id}
                  texto={trabajador.nombre}
                  estaMarcada={borrador.includes(trabajador.id)}
                  onPresionar={() => manejarAlternar(trabajador.id)}
                />
              ))}
            </ScrollView>
          )}
          <BotonPrincipal
            etiqueta={TEXTOS_ASIGNAR_TRABAJADORES.etiquetaBoton}
            onPresionar={manejarConfirmar}
          />
        </View>
      </View>
    </Modal>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  superposicion: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 23,
    backgroundColor: COLORES.superposicion,
  },
  tarjeta: {
    gap: 16,
    padding: 20,
    backgroundColor: COLORES.superficie,
    borderWidth: 1,
    borderColor: COLORES.bordeModal,
    borderRadius: RADIOS.modal,
    ...SOMBRAS.modal,
  },
  encabezado: {
    gap: 4,
  },
  titulo: {
    ...TIPOGRAFIA.titulo3,
    color: COLORES.texto,
  },
  descripcion: {
    ...TIPOGRAFIA.leyenda,
    color: COLORES.textoSutil,
  },
  lista: {
    maxHeight: TAMANOS.listaSeleccion,
  },
  fila: {
    height: TAMANOS.opcion,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  casilla: {
    width: TAMANOS.casilla,
    height: TAMANOS.casilla,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORES.textoTenue,
    borderRadius: RADIOS.casilla,
  },
  casillaMarcada: {
    borderColor: COLORES.marca,
    backgroundColor: COLORES.marca,
  },
  texto: {
    flex: 1,
    ...TIPOGRAFIA.entrada,
    color: COLORES.texto,
  },
  textoNegrita: {
    flex: 1,
    ...TIPOGRAFIA.etiqueta,
    color: COLORES.texto,
  },
});
