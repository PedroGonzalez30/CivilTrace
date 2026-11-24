/**
 * @archivo PantallaAgregarObra.tsx
 * @proyecto Civil Trace
 * @descripcion Formulario con el que el dueño crea una nueva obra, con su supervisor y sus
 *              trabajadores; al terminar muestra el modal de confirmación.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 16/11/2026
 * @version 1.2.0
 */

// 1. Importaciones
import { useState } from 'react';
import {
  type KeyboardTypeOptions,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BotonPrincipal,
  CampoTexto,
  CampoTrabajadores,
  EncabezadoApp,
  ModalObraCreada,
  type OpcionSelector,
  SelectorOpcion,
  TarjetaFormulario,
} from '@/componentes';
import { ErrorApi } from '@/conexion/clienteApi';
import { COLORES } from '@/constantes/colores';
import { TIPOGRAFIA } from '@/constantes/tema';
import { TEXTOS_AGREGAR_OBRA } from '@/constantes/textos';
import { usePersonalEmpresa } from '@/hooks/usePersonalEmpresa';
import type { DatosNuevaObra } from '@/tipos/obra';
import { aplicarMascaraFecha } from '@/utilidades/formatearFecha';
import { type ErroresObra, validarObra } from '@/utilidades/validacionObra';

// 2. Tipos e interfaces
interface PantallaAgregarObraProps {
  tokenAcceso: string;
  onAgregar: (datos: DatosNuevaObra) => Promise<void>;
  onIrAlPanelPrincipal: () => void;
}

type CampoTextoObra =
  'nombre' | 'descripcion' | 'cliente' | 'correoCliente' | 'direccion' | 'fechaInicio' | 'fechaFin';

interface ConfiguracionCampo {
  clave: CampoTextoObra;
  etiqueta: string;
  textoMarcador: string;
  teclado?: KeyboardTypeOptions;
  esMultilinea?: boolean;
  esFecha?: boolean;
}

// 3. Constantes del módulo
const ESPACIO_INFERIOR_BASE = 24;
const NOMBRE_SIN_SUPERVISOR = '—';

const VALORES_INICIALES: DatosNuevaObra = {
  nombre: '',
  descripcion: '',
  cliente: '',
  correoCliente: '',
  direccion: '',
  fechaInicio: '',
  fechaFin: '',
  supervisorId: '',
  trabajadoresIds: [],
};

const CAMPOS: ConfiguracionCampo[] = [
  { clave: 'nombre', etiqueta: 'Nombre de la obra', textoMarcador: 'Construcción de casa' },
  {
    clave: 'descripcion',
    etiqueta: 'Descripción',
    textoMarcador: 'Casa de dos plantas con cochera',
    esMultilinea: true,
  },
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
    teclado: 'number-pad',
    esFecha: true,
  },
  {
    clave: 'fechaFin',
    etiqueta: 'Fecha de fin',
    textoMarcador: '02/04/2025',
    teclado: 'number-pad',
    esFecha: true,
  },
];

// 4. Componente principal
export default function PantallaAgregarObra({
  tokenAcceso,
  onAgregar,
  onIrAlPanelPrincipal,
}: PantallaAgregarObraProps) {
  const margenesSeguros = useSafeAreaInsets();
  const consultaPersonal = usePersonalEmpresa(tokenAcceso);
  const [valores, setValores] = useState<DatosNuevaObra>(VALORES_INICIALES);
  const [errores, setErrores] = useState<ErroresObra>({});
  const [estaEnviando, setEstaEnviando] = useState(false);
  const [esModalVisible, setEsModalVisible] = useState(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const supervisores = consultaPersonal.personal?.supervisores ?? [];
  const trabajadores = consultaPersonal.personal?.trabajadores ?? [];
  // Sin opción "Sin supervisor": la obra lo necesita para registrar asistencia (D-24).
  const opcionesSupervisor: OpcionSelector[] = supervisores.map((supervisor) => ({
    id: supervisor.id,
    etiqueta: supervisor.nombre,
  }));
  const faltanSupervisores = consultaPersonal.personal !== null && supervisores.length === 0;
  const nombreSupervisor =
    supervisores.find((supervisor) => supervisor.id === valores.supervisorId)?.nombre ??
    NOMBRE_SIN_SUPERVISOR;

  const manejarCambioTexto =
    (clave: CampoTextoObra, esFecha = false) =>
    (texto: string) => {
      setValores((anteriores) => ({
        ...anteriores,
        [clave]: esFecha ? aplicarMascaraFecha(texto) : texto,
      }));
      setErrores((anteriores) => ({ ...anteriores, [clave]: undefined }));
      setMensajeError(null);
    };

  const manejarCambioSupervisor = (idSupervisor: string) => {
    setValores((anteriores) => ({ ...anteriores, supervisorId: idSupervisor }));
    setErrores((anteriores) => ({ ...anteriores, supervisorId: undefined }));
  };

  const manejarCambioTrabajadores = (idsTrabajadores: string[]) => {
    setValores((anteriores) => ({ ...anteriores, trabajadoresIds: idsTrabajadores }));
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

  return (
    <View style={estilos.contenedor}>
      <EncabezadoApp />
      <KeyboardAvoidingView
        style={estilos.flexible}
        // En Android de borde a borde la ventana ya no se ajusta sola al teclado (D-27).
        behavior="padding"
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
                onCambiarTexto={manejarCambioTexto(campo.clave, campo.esFecha)}
              />
            ))}
            <SelectorOpcion
              etiqueta="Supervisor"
              valor={valores.supervisorId}
              textoMarcador="Selecciona un supervisor"
              opciones={opcionesSupervisor}
              error={errores.supervisorId}
              onSeleccionar={manejarCambioSupervisor}
            />
            {faltanSupervisores ? (
              <Text style={estilos.ayuda}>{TEXTOS_AGREGAR_OBRA.sinSupervisores}</Text>
            ) : null}
            <CampoTrabajadores
              trabajadores={trabajadores}
              seleccionados={valores.trabajadoresIds}
              onCambiar={manejarCambioTrabajadores}
            />
            {consultaPersonal.error ? (
              <Pressable onPress={consultaPersonal.reintentar}>
                <Text style={estilos.error}>{consultaPersonal.error} Toca para reintentar.</Text>
              </Pressable>
            ) : null}
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
          nombreSupervisor={nombreSupervisor}
          onCerrar={() => setEsModalVisible(false)}
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
  ayuda: {
    ...TIPOGRAFIA.leyenda,
    color: COLORES.textoSutil,
  },
  error: {
    ...TIPOGRAFIA.leyenda,
    color: COLORES.error,
  },
});
