/**
 * @archivo PantallaPersonal.tsx
 * @proyecto Civil Trace
 * @descripcion Pestaña Personal del dueño: lista de supervisores y trabajadores de la empresa,
 *              con la opción de eliminarlos.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 19/11/2026
 * @version 1.1.0
 * @historial 19/11/2026 - Pedro González - Lista de personal y eliminación según el diseño.
 */

// 1. Importaciones
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  AvisoExito,
  EncabezadoApp,
  ModalEliminarPersonal,
  SeccionPersonal,
  TarjetaFormulario,
} from '@/componentes';
import { ErrorApi } from '@/conexion/clienteApi';
import { COLORES } from '@/constantes/colores';
import { TIPOGRAFIA } from '@/constantes/tema';
import { TEXTOS_PERSONAL } from '@/constantes/textos';
import { usePersonalEmpresa } from '@/hooks/usePersonalEmpresa';
import { eliminarPersonal } from '@/servicios/servicioEmpresa';
import type { PersonaEmpresa } from '@/tipos/personal';

// 2. Tipos e interfaces
interface PantallaPersonalProps {
  tokenAcceso: string;
}

// 3. Constantes del módulo
const DURACION_AVISO_MS = 3000;

// 4. Componente principal
export default function PantallaPersonal({ tokenAcceso }: PantallaPersonalProps) {
  const { personal, error, reintentar, quitarPersona } = usePersonalEmpresa(tokenAcceso);
  const [personaPorEliminar, setPersonaPorEliminar] = useState<PersonaEmpresa | null>(null);
  const [estaEliminando, setEstaEliminando] = useState(false);
  const [seElimino, setSeElimino] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);

  // Oculta el aviso de éxito a los 3 segundos.
  useEffect(() => {
    if (!seElimino) {
      return undefined;
    }
    const temporizador = setTimeout(() => setSeElimino(false), DURACION_AVISO_MS);
    return () => clearTimeout(temporizador);
  }, [seElimino]);

  const manejarPedirEliminar = (persona: PersonaEmpresa) => {
    setSeElimino(false);
    setErrorEliminar(null);
    setPersonaPorEliminar(persona);
  };

  const manejarCancelar = () => {
    if (!estaEliminando) {
      setPersonaPorEliminar(null);
    }
  };

  const manejarConfirmar = async () => {
    if (!personaPorEliminar) {
      return;
    }

    setEstaEliminando(true);
    try {
      await eliminarPersonal(tokenAcceso, personaPorEliminar.id);
      quitarPersona(personaPorEliminar.id);
      setSeElimino(true);
    } catch (falla: unknown) {
      setErrorEliminar(falla instanceof ErrorApi ? falla.message : TEXTOS_PERSONAL.errorEliminar);
    } finally {
      setEstaEliminando(false);
      setPersonaPorEliminar(null);
    }
  };

  return (
    <View style={estilos.contenedor}>
      <EncabezadoApp />
      <ScrollView contentContainerStyle={estilos.contenido}>
        <View>
          <Text style={estilos.titulo}>{TEXTOS_PERSONAL.titulo}</Text>
          <Text style={estilos.subtitulo}>{TEXTOS_PERSONAL.subtitulo}</Text>
        </View>
        {personal ? (
          <TarjetaFormulario estilo={estilos.tarjeta}>
            {seElimino ? (
              <View style={estilos.aviso}>
                <AvisoExito mensaje={TEXTOS_PERSONAL.exito} />
              </View>
            ) : null}
            {errorEliminar ? <Text style={estilos.error}>{errorEliminar}</Text> : null}
            <SeccionPersonal
              titulo={TEXTOS_PERSONAL.supervisores}
              subtituloPersonas={TEXTOS_PERSONAL.rolSupervisor}
              textoVacio={TEXTOS_PERSONAL.vacioSupervisores}
              personas={personal.supervisores}
              onEliminar={manejarPedirEliminar}
            />
            <View style={estilos.divisor} />
            <SeccionPersonal
              titulo={TEXTOS_PERSONAL.trabajadores}
              subtituloPersonas={TEXTOS_PERSONAL.rolTrabajador}
              textoVacio={TEXTOS_PERSONAL.vacioTrabajadores}
              personas={personal.trabajadores}
              onEliminar={manejarPedirEliminar}
            />
          </TarjetaFormulario>
        ) : (
          <View style={estilos.centro}>
            {error ? (
              <>
                <Text style={estilos.error}>{error}</Text>
                <Pressable onPress={reintentar}>
                  <Text style={estilos.reintentar}>{TEXTOS_PERSONAL.reintentar}</Text>
                </Pressable>
              </>
            ) : (
              <ActivityIndicator color={COLORES.marca} />
            )}
          </View>
        )}
      </ScrollView>
      <ModalEliminarPersonal
        esVisible={personaPorEliminar !== null}
        estaCargando={estaEliminando}
        onCancelar={manejarCancelar}
        onAceptar={manejarConfirmar}
      />
    </View>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: COLORES.pantalla,
  },
  contenido: {
    gap: 20,
    padding: 24,
  },
  titulo: {
    ...TIPOGRAFIA.titulo1,
    color: COLORES.texto,
  },
  subtitulo: {
    marginTop: 5,
    ...TIPOGRAFIA.subtitulo,
    color: COLORES.textoAtenuado,
  },
  tarjeta: {
    gap: 0,
    padding: 20,
  },
  aviso: {
    marginBottom: 16,
  },
  divisor: {
    height: 1,
    marginTop: 32,
    marginBottom: 10,
    backgroundColor: COLORES.fondoAvatar,
  },
  centro: {
    alignItems: 'center',
    gap: 8,
    paddingTop: 24,
  },
  error: {
    ...TIPOGRAFIA.leyenda,
    textAlign: 'center',
    color: COLORES.error,
  },
  reintentar: {
    ...TIPOGRAFIA.etiqueta,
    color: COLORES.marca,
  },
});
