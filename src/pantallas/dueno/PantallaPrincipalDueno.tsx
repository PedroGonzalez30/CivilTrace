/**
 * @archivo PantallaPrincipalDueno.tsx
 * @proyecto Civil Trace
 * @descripcion Pantalla principal del dueño: bienvenida, códigos de acceso y lista de obras.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 15/11/2026
 * @version 1.0.0
 * @requerimientos RF-44 Mostrar obras
 */

// 1. Importaciones
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  EncabezadoApp,
  IconoArchivoTexto,
  IconoMas,
  TarjetaAccion,
  TarjetaCodigoAcceso,
  TarjetaFormulario,
  TarjetaObra,
} from '@/componentes';
import { COLORES } from '@/constantes/colores';
import { RADIOS, SOMBRAS, TAMANOS, TIPOGRAFIA } from '@/constantes/tema';
import { CODIGOS_ACCESO } from '@/simulados/obras';
import type { Obra } from '@/tipos/obra';

// 2. Tipos e interfaces
interface PantallaPrincipalDuenoProps {
  nombreEmpresa?: string;
  obras: Obra[];
  onAbrirObra: (idObra: string) => void;
}

// 3. Constantes del módulo
const TAMANO_ICONO_BOTON_FLOTANTE = 24;

// TODO(Equipo): conectar la lógica real de estas acciones.
const manejarNuevaObra = () => {};
const manejarCompartirCodigoAcceso = () => {};
const manejarCopiarCodigo = (_codigo: string) => {};

// 4. Componente principal
export default function PantallaPrincipalDueno({
  nombreEmpresa,
  obras,
  onAbrirObra,
}: PantallaPrincipalDuenoProps) {
  const estaVacio = obras.length === 0;
  const nombreMostrado = nombreEmpresa?.trim() || 'Todo Concreto';

  return (
    <View style={estilos.contenedor}>
      <EncabezadoApp />
      {estaVacio ? (
        <ScrollView contentContainerStyle={estilos.contenidoVacio}>
          <Text style={estilos.tituloBienvenida}>Bienvenido a {nombreMostrado}</Text>
          <Text style={estilos.subtituloBienvenida}>
            Gestiona tus obras, equipos y seguimiento desde un solo lugar.
          </Text>
          <TarjetaFormulario estilo={estilos.tarjetaPrincipal}>
            <View>
              <Text style={estilos.tituloSeccion}>Resumen</Text>
              <Text style={estilos.textoResumen}>
                No hay obras activas todavía. Crea la primera para comenzar a registrar avances.
              </Text>
            </View>
            <View style={estilos.acciones}>
              <TarjetaAccion
                estilo={estilos.accion}
                Icono={IconoMas}
                titulo="Nueva obra"
                subtitulo="Crea la primera obra"
                onPresionar={manejarNuevaObra}
              />
              <TarjetaAccion
                estilo={estilos.accion}
                Icono={IconoArchivoTexto}
                titulo="Acceso a la obra"
                subtitulo="Comparte el código de la obra."
                onPresionar={manejarCompartirCodigoAcceso}
              />
            </View>
            <View style={estilos.codigos}>
              <Text style={estilos.tituloSeccion}>Códigos de acceso</Text>
              <View style={estilos.listaCodigos}>
                <TarjetaCodigoAcceso
                  titulo="Código de acceso para trabajadores"
                  descripcion="Los trabajadores necesitan este código para acceder a la empresa."
                  codigo={CODIGOS_ACCESO.trabajadores}
                  onCopiar={() => manejarCopiarCodigo(CODIGOS_ACCESO.trabajadores)}
                />
                <TarjetaCodigoAcceso
                  titulo="Código de acceso para supervisores"
                  descripcion="Los supervisores necesitan este código para acceder a la empresa."
                  codigo={CODIGOS_ACCESO.supervisores}
                  onCopiar={() => manejarCopiarCodigo(CODIGOS_ACCESO.supervisores)}
                />
              </View>
            </View>
            <View style={estilos.nota}>
              <Text style={estilos.tituloNota}>¿Dónde encontrarlos y regenerarlos?</Text>
              <Text style={estilos.textoNota}>
                En el menú de tres líneas de arriba, entra en «Código de la empresa». Allí puedes
                consultar y regenerar ambos códigos cuando lo necesites.
              </Text>
            </View>
          </TarjetaFormulario>
        </ScrollView>
      ) : (
        <>
          <ScrollView contentContainerStyle={estilos.contenidoConObras}>
            <TarjetaFormulario estilo={estilos.portada}>
              <Text style={estilos.leyendaPortada}>Bienvenido de nuevo</Text>
              <Text style={estilos.tituloPortada}>{nombreMostrado}</Text>
              <Text style={estilos.textoPortada}>
                Gestiona tus obras, equipos y seguimiento desde un solo lugar.
              </Text>
            </TarjetaFormulario>
            <View style={estilos.lista}>
              {obras.map((obra) => (
                <TarjetaObra key={obra.id} obra={obra} onPresionar={onAbrirObra} />
              ))}
            </View>
          </ScrollView>
          <Pressable style={estilos.botonFlotante} onPress={manejarNuevaObra}>
            <IconoMas tamano={TAMANO_ICONO_BOTON_FLOTANTE} />
          </Pressable>
        </>
      )}
    </View>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: COLORES.pantalla,
  },
  contenidoVacio: {
    paddingTop: 24,
    paddingBottom: 24,
  },
  tituloBienvenida: {
    paddingHorizontal: 24,
    ...TIPOGRAFIA.titulo1,
    color: COLORES.texto,
  },
  subtituloBienvenida: {
    marginTop: 12,
    paddingHorizontal: 24,
    ...TIPOGRAFIA.subtitulo,
    color: COLORES.textoAtenuado,
  },
  tarjetaPrincipal: {
    gap: 0,
    marginTop: 10,
    marginHorizontal: 16,
    padding: 16,
  },
  tituloSeccion: {
    ...TIPOGRAFIA.titulo3,
    color: COLORES.texto,
  },
  textoResumen: {
    marginTop: 3,
    ...TIPOGRAFIA.subtitulo,
    color: COLORES.textoAtenuado,
  },
  acciones: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
  },
  accion: {
    flex: 1,
  },
  codigos: {
    marginTop: 8,
  },
  listaCodigos: {
    gap: 12,
    marginTop: 9,
  },
  nota: {
    gap: 6,
    marginTop: 25,
    padding: 12,
  },
  tituloNota: {
    ...TIPOGRAFIA.etiqueta,
    color: COLORES.texto,
  },
  textoNota: {
    ...TIPOGRAFIA.leyenda,
    color: COLORES.textoAtenuado,
  },
  contenidoConObras: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: TAMANOS.botonFlotante + 48,
  },
  portada: {
    gap: 6,
    paddingTop: 20,
    paddingBottom: 22,
    paddingHorizontal: 20,
    ...SOMBRAS.desplegable,
  },
  leyendaPortada: {
    ...TIPOGRAFIA.leyenda,
    color: COLORES.textoSutil,
  },
  tituloPortada: {
    ...TIPOGRAFIA.tituloPortada,
    color: COLORES.texto,
  },
  textoPortada: {
    ...TIPOGRAFIA.leyenda,
    color: COLORES.textoAtenuado,
  },
  lista: {
    gap: 36,
    marginTop: 41,
  },
  botonFlotante: {
    position: 'absolute',
    right: 24,
    bottom: 19,
    width: TAMANOS.botonFlotante,
    height: TAMANOS.botonFlotante,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIOS.pildora,
    backgroundColor: COLORES.marca,
    ...SOMBRAS.botonFlotante,
  },
});
