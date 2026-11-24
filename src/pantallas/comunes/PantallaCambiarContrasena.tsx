/**
 * @archivo PantallaCambiarContrasena.tsx
 * @proyecto Civil Trace
 * @descripcion Pantalla para cambiar la contraseña. Es común: la usan dueño, supervisor y
 *              trabajador desde su perfil.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 19/11/2026
 * @version 1.0.0
 */

// 1. Importaciones
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  BotonPrincipal,
  CampoTexto,
  EncabezadoApp,
  EncabezadoPantalla,
  IconoFlechaIzquierda,
  ModalExito,
  TarjetaFormulario,
} from '@/componentes';
import type { CampoTextoRef } from '@/componentes';
import { COLORES } from '@/constantes/colores';
import { RADIOS, TIPOGRAFIA } from '@/constantes/tema';
import { TEXTOS_CAMBIAR_CONTRASENA as TEXTOS } from '@/constantes/textos';
import { useFormulario } from '@/hooks/useFormulario';
import { cambiarContrasena } from '@/servicios/servicioAutenticacion';
import type { SesionAutenticacion } from '@/tipos/autenticacion';
import {
  CAMPOS_CAMBIO_CONTRASENA,
  validarCambioContrasena,
} from '@/utilidades/validacionAutenticacion';

// 2. Tipos e interfaces
interface PantallaCambiarContrasenaProps {
  sesion: SesionAutenticacion;
  onRegresar: () => void;
}

// 3. Constantes del módulo
const TAMANO_ICONO_VOLVER = 18;

// 4. Componente principal
export default function PantallaCambiarContrasena({
  sesion,
  onRegresar,
}: PantallaCambiarContrasenaProps) {
  const referenciaNueva = useRef<CampoTextoRef>(null);
  const referenciaConfirmacion = useRef<CampoTextoRef>(null);
  const [esModalVisible, setEsModalVisible] = useState(false);

  const formulario = useFormulario({
    campos: CAMPOS_CAMBIO_CONTRASENA,
    valoresIniciales: { contrasenaActual: '', contrasenaNueva: '', confirmacion: '' },
    validar: validarCambioContrasena,
    onEnviar: async (valores) => {
      await cambiarContrasena(
        sesion.token,
        sesion.tokenRefresco,
        valores.contrasenaActual,
        valores.contrasenaNueva,
      );
      setEsModalVisible(true);
    },
  });

  const manejarCerrarModal = () => {
    setEsModalVisible(false);
    formulario.reiniciar();
    onRegresar();
  };

  return (
    <View style={estilos.contenedor}>
      <EncabezadoApp />
      {/* En Android de borde a borde el sistema ya no sube la pantalla: se hace aquí (D-27). */}
      <KeyboardAvoidingView style={estilos.teclado} behavior="padding">
        <ScrollView
          contentContainerStyle={estilos.contenido}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable style={estilos.volver} onPress={onRegresar} hitSlop={8}>
            <IconoFlechaIzquierda tamano={TAMANO_ICONO_VOLVER} color={COLORES.marca} />
            <Text style={estilos.textoVolver}>{TEXTOS.volver}</Text>
          </Pressable>
          <EncabezadoPantalla titulo={TEXTOS.titulo} subtitulo={TEXTOS.subtitulo} />
          <TarjetaFormulario estilo={estilos.tarjeta}>
            <CampoTexto
              etiqueta={TEXTOS.etiquetaActual}
              textoMarcador={TEXTOS.marcadorActual}
              valor={formulario.valores.contrasenaActual}
              error={formulario.obtenerError('contrasenaActual')}
              puedeAlternarVisibilidad
              autoCapitalize="none"
              autoComplete="current-password"
              returnKeyType="next"
              onCambiarTexto={formulario.manejarCambio('contrasenaActual')}
              onPerderFoco={formulario.manejarPerdidaFoco('contrasenaActual')}
              onEnviar={() => referenciaNueva.current?.focus()}
            />
            <CampoTexto
              etiqueta={TEXTOS.etiquetaNueva}
              textoMarcador={TEXTOS.marcadorNueva}
              valor={formulario.valores.contrasenaNueva}
              error={formulario.obtenerError('contrasenaNueva')}
              referenciaEntrada={referenciaNueva}
              puedeAlternarVisibilidad
              autoCapitalize="none"
              autoComplete="new-password"
              returnKeyType="next"
              onCambiarTexto={formulario.manejarCambio('contrasenaNueva')}
              onPerderFoco={formulario.manejarPerdidaFoco('contrasenaNueva')}
              onEnviar={() => referenciaConfirmacion.current?.focus()}
            />
            {/* Reglas que también valida la API */}
            <View style={estilos.requisitos}>
              <Text style={estilos.tituloRequisitos}>{TEXTOS.tituloRequisitos}</Text>
              <View>
                {TEXTOS.requisitos.map((requisito) => (
                  <Text key={requisito} style={estilos.textoRequisito}>
                    • {requisito}
                  </Text>
                ))}
              </View>
            </View>
            <CampoTexto
              etiqueta={TEXTOS.etiquetaConfirmacion}
              textoMarcador={TEXTOS.marcadorConfirmacion}
              valor={formulario.valores.confirmacion}
              error={formulario.obtenerError('confirmacion')}
              referenciaEntrada={referenciaConfirmacion}
              puedeAlternarVisibilidad
              autoCapitalize="none"
              autoComplete="new-password"
              returnKeyType="done"
              onCambiarTexto={formulario.manejarCambio('confirmacion')}
              onPerderFoco={formulario.manejarPerdidaFoco('confirmacion')}
              onEnviar={formulario.manejarEnvio}
            />
          </TarjetaFormulario>
          {formulario.errorEnvio ? (
            <Text style={estilos.error}>{formulario.errorEnvio}</Text>
          ) : null}
          <BotonPrincipal
            etiqueta={TEXTOS.etiquetaBoton}
            estaCargando={formulario.estaEnviando}
            onPresionar={formulario.manejarEnvio}
          />
        </ScrollView>
      </KeyboardAvoidingView>
      {esModalVisible ? (
        <ModalExito
          titulo={TEXTOS.exitoTitulo}
          descripcion={TEXTOS.exitoDescripcion}
          etiquetaBoton={TEXTOS.etiquetaAceptar}
          onCerrar={manejarCerrarModal}
          onAceptar={manejarCerrarModal}
        />
      ) : null}
    </View>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  teclado: { flex: 1 },
  contenedor: {
    flex: 1,
    backgroundColor: COLORES.pantalla,
  },
  contenido: {
    gap: 16,
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 24,
  },
  volver: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    height: 24,
  },
  textoVolver: {
    ...TIPOGRAFIA.enlace,
    color: COLORES.marca,
  },
  tarjeta: {
    gap: 16,
    padding: 16,
  },
  requisitos: {
    gap: 4,
    padding: 12,
    backgroundColor: COLORES.fondo,
    borderRadius: RADIOS.mosaico,
  },
  tituloRequisitos: {
    ...TIPOGRAFIA.etiqueta,
    color: COLORES.texto,
  },
  textoRequisito: {
    ...TIPOGRAFIA.leyenda,
    color: COLORES.textoAtenuado,
  },
  error: {
    ...TIPOGRAFIA.leyenda,
    textAlign: 'center',
    color: COLORES.error,
  },
});
