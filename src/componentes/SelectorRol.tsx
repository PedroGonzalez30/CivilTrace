/**
 * @archivo SelectorRol.tsx
 * @proyecto Civil Trace
 * @descripcion Lista desplegable para elegir una opción (se usa para elegir el rol al registrarse).
 * @autor POR_COMPLETAR
 * @fecha POR_COMPLETAR
 * @version 1.0.0
 */

// 1. Importaciones
import { type ComponentRef, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import IconoFlecha from '@/componentes/IconoFlecha';
import { COLORES } from '@/constantes/colores';
import { RADIOS, SOMBRAS, TAMANOS, TIPOGRAFIA } from '@/constantes/tema';

// 2. Tipos e interfaces
interface SelectorRolProps<T extends string> {
  etiqueta: string;
  valor: T | null;
  textoMarcador: string;
  opciones: readonly T[];
  error?: string;
  onSeleccionar: (opcion: T) => void;
}

interface Ancla {
  x: number;
  y: number;
  ancho: number;
  alto: number;
}

// 4. Componente principal
export default function SelectorRol<T extends string>({
  etiqueta,
  valor,
  textoMarcador,
  opciones,
  error,
  onSeleccionar,
}: SelectorRolProps<T>) {
  const referenciaDisparador = useRef<ComponentRef<typeof View>>(null);
  const [ancla, setAncla] = useState<Ancla | null>(null);

  const manejarApertura = () => {
    referenciaDisparador.current?.measureInWindow((x, y, ancho, alto) =>
      setAncla({ x, y, ancho, alto }),
    );
  };

  const manejarCierre = () => setAncla(null);

  const manejarSeleccion = (opcion: T) => {
    setAncla(null);
    onSeleccionar(opcion);
  };

  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>
      <View ref={referenciaDisparador} collapsable={false}>
        <Pressable style={estilos.disparador} onPress={manejarApertura}>
          <Text style={estilos.textoDisparador}>{valor ?? textoMarcador}</Text>
          <IconoFlecha direccion={ancla ? 'arriba' : 'abajo'} />
        </Pressable>
      </View>
      {error ? <Text style={estilos.error}>{error}</Text> : null}
      <Modal
        transparent
        visible={ancla !== null}
        statusBarTranslucent
        animationType="none"
        onRequestClose={manejarCierre}
      >
        <Pressable style={estilos.fondo} onPress={manejarCierre}>
          {ancla ? (
            <View
              style={[
                estilos.sombraOpciones,
                { top: ancla.y + ancla.alto, left: ancla.x, width: ancla.ancho },
              ]}
            >
              <View style={estilos.opciones}>
                {opciones.map((opcion, indice) => (
                  <View key={opcion}>
                    {indice > 0 && <View style={estilos.divisor} />}
                    <Pressable style={estilos.opcion} onPress={() => manejarSeleccion(opcion)}>
                      {({ pressed }) => (
                        <Text style={pressed ? estilos.textoOpcionPresionada : estilos.textoOpcion}>
                          {opcion}
                        </Text>
                      )}
                    </Pressable>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </Pressable>
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
  disparador: {
    height: TAMANOS.entrada,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: COLORES.superficie,
    borderRadius: RADIOS.tarjeta,
    ...SOMBRAS.tarjeta,
  },
  textoDisparador: {
    flex: 1,
    ...TIPOGRAFIA.entrada,
    color: COLORES.textoAtenuado,
  },
  error: {
    ...TIPOGRAFIA.leyenda,
    color: COLORES.error,
  },
  fondo: {
    flex: 1,
  },
  sombraOpciones: {
    position: 'absolute',
    borderRadius: RADIOS.tarjeta,
    backgroundColor: COLORES.superficie,
    ...SOMBRAS.desplegable,
  },
  opciones: {
    overflow: 'hidden',
    borderRadius: RADIOS.tarjeta,
  },
  opcion: {
    height: TAMANOS.opcion,
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: COLORES.superficie,
  },
  textoOpcion: {
    ...TIPOGRAFIA.entrada,
    color: COLORES.texto,
  },
  textoOpcionPresionada: {
    ...TIPOGRAFIA.etiqueta,
    color: COLORES.texto,
  },
  divisor: {
    height: 1,
    backgroundColor: COLORES.divisor,
  },
});
