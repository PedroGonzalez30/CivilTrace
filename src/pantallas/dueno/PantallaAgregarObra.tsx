/**
 * @archivo PantallaAgregarObra.tsx
 * @proyecto Civil Trace
 * @descripcion Formulario con el que el dueño crea una nueva obra; al terminar muestra
 *              el modal de confirmación.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 16/11/2026
 * @version 1.1.0
 */

// 1. Importaciones
import { useState } from 'react';
import {
  type KeyboardTypeOptions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BotonPrincipal,
  CampoTexto,
  EncabezadoApp,
  ModalObraCreada,
  TarjetaFormulario,
} from '@/componentes';
import { ErrorApi } from '@/conexion/clienteApi';
import { COLORES } from '@/constantes/colores';
import { TIPOGRAFIA } from '@/constantes/tema';
import { TEXTOS_AGREGAR_OBRA } from '@/constantes/textos';
import type { DatosNuevaObra } from '@/tipos/obra';
import { type ErroresObra, validarObra } from '@/utilidades/validacionObra';

// 2. Tipos e interfaces
interface PantallaAgregarObraProps {
  onAgregar: (datos: DatosNuevaObra) => Promise<void>;
  onIrAlPanelPrincipal: () => void;
}

interface ConfiguracionCampo {
  clave: keyof DatosNuevaObra;
  etiqueta: string;
  textoMarcador: string;
  teclado?: KeyboardTypeOptions;
  esMultilinea?: boolean;
}

// 3. Constantes del módulo
const ESPACIO_INFERIOR_BASE = 24;

const VALORES_INICIALES: DatosNuevaObra = {
  nombre: '',
  cliente: '',
  correoCliente: '',
  direccion: '',
  fechaInicio: '',
  fechaFin: '',
  supervisor: '',
};

const CAMPOS: ConfiguracionCampo[] = [
  { clave: 'nombre', etiqueta: 'Nombre de la obra', textoMarcador: 'Construcción de casa' },
  { clave: 'cliente', etiqueta: 'Nombre del cliente', textoMarcador: 'Ramón' },
  {
    clave: 'correoCliente',
    etiqueta: 'Correo del cliente',
    textoMarcador: 'ramon@ejemplo.com',
    teclado: 'email-address',
  },
  {
    clave: 'direccion',
    etiqueta: 'Dirección',
    textoMarcador: 'Calle Ficticia #123, Colonia San Miguel',
    esMultilinea: true,
  },
  {
    clave: 'fechaInicio',
    etiqueta: 'Fecha de inicio',
    textoMarcador: '02/04/2024',
    teclado: 'numbers-and-punctuation',
  },
  {
    clave: 'fechaFin',
    etiqueta: 'Fecha de fin',
    textoMarcador: '02/04/2025',
    teclado: 'numbers-and-punctuation',
  },
  { clave: 'supervisor', etiqueta: 'Supervisor', textoMarcador: 'María Castro' },
];

// 4. Componente principal
export default function PantallaAgregarObra({
  onAgregar,
  onIrAlPanelPrincipal,
}: PantallaAgregarObraProps) {
  const margenesSeguros = useSafeAreaInsets();
  const [valores, setValores] = useState<DatosNuevaObra>(VALORES_INICIALES);
  const [errores, setErrores] = useState<ErroresObra>({});
  const [estaEnviando, setEstaEnviando] = useState(false);
  const [esModalVisible, setEsModalVisible] = useState(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const manejarCambio = (clave: keyof DatosNuevaObra) => (texto: string) => {
    setValores((anteriores) => ({ ...anteriores, [clave]: texto }));
    setErrores((anteriores) => ({ ...anteriores, [clave]: undefined }));
    setMensajeError(null);
  };

  const manejarAgregar = async () => {
    const erroresValidacion = validarObra(valores);
    setErrores(erroresValidacion);
    if (Object.keys(erroresValidacion).length > 0) {
      return;
    }

    setEstaEnviando(true);
    setMensajeError(null);
    try {
      await onAgregar(valores);
      setEsModalVisible(true);
    } catch (error) {
      // Los mensajes de ErrorApi ya vienen en español; cualquier otro error es genérico.
      setMensajeError(error instanceof ErrorApi ? error.message : TEXTOS_AGREGAR_OBRA.errorEnvio);
    } finally {
      setEstaEnviando(false);
    }
  };

  const manejarCerrarModal = () => {
    setEsModalVisible(false);
  };

  return (
    <View style={estilos.contenedor}>
      <EncabezadoApp />
      <KeyboardAvoidingView
        style={estilos.flexible}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            estilos.contenido,
            { paddingBottom: ESPACIO_INFERIOR_BASE + margenesSeguros.bottom },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={estilos.encabezado}>
            <Text style={estilos.titulo}>{TEXTOS_AGREGAR_OBRA.titulo}</Text>
            <Text style={estilos.subtitulo}>{TEXTOS_AGREGAR_OBRA.subtitulo}</Text>
          </View>
          <TarjetaFormulario estilo={estilos.tarjeta}>
            {CAMPOS.map((campo) => (
              <CampoTexto
                key={campo.clave}
                etiqueta={campo.etiqueta}
                textoMarcador={campo.textoMarcador}
                valor={valores[campo.clave]}
                error={errores[campo.clave]}
                keyboardType={campo.teclado}
                esMultilinea={campo.esMultilinea}
                editable={!estaEnviando}
                autoCapitalize={campo.clave === 'correoCliente' ? 'none' : 'sentences'}
                onCambiarTexto={manejarCambio(campo.clave)}
              />
            ))}
            {mensajeError ? <Text style={estilos.error}>{mensajeError}</Text> : null}
            <BotonPrincipal
              etiqueta={TEXTOS_AGREGAR_OBRA.etiquetaBoton}
              estaCargando={estaEnviando}
              onPresionar={manejarAgregar}
              estilo={estilos.boton}
            />
          </TarjetaFormulario>
        </ScrollView>
      </KeyboardAvoidingView>
      {esModalVisible ? (
        <ModalObraCreada
          datos={valores}
          onCerrar={manejarCerrarModal}
          onIrAlPanelPrincipal={onIrAlPanelPrincipal}
        />
      ) : null}
    </View>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: COLORES.fondo,
  },
  flexible: {
    flex: 1,
  },
  contenido: {
    paddingTop: 13,
    paddingHorizontal: 27,
  },
  encabezado: {
    gap: 8,
  },
  titulo: {
    ...TIPOGRAFIA.titulo1,
    color: COLORES.texto,
  },
  subtitulo: {
    ...TIPOGRAFIA.subtituloPantalla,
    color: COLORES.textoSecundario,
  },
  tarjeta: {
    gap: 8,
    marginTop: 14,
  },
  boton: {
    marginTop: 9,
  },
  error: {
    ...TIPOGRAFIA.leyenda,
    color: COLORES.error,
  },
});