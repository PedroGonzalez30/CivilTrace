/**
 * @archivo PantallaRegistro.tsx
 * @proyecto Civil Trace
 * @descripcion Pantalla donde un usuario nuevo crea su cuenta y elige su rol y su empresa.
 * @autor POR_COMPLETAR
 * @fecha POR_COMPLETAR
 * @version 1.0.0
 * @historial 25/11/2026 - Emilio Manuel Esquivel - Reglas visibles, confirmar contraseña y sin
 *   autollenado (feature 006, D-12)
 */

// 1. Importaciones
import { useState } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BotonPrincipal,
  CampoTexto,
  EncabezadoApp,
  EncabezadoPantalla,
  ModalEmpresa,
  SelectorRol,
  TarjetaFormulario,
} from '@/componentes';
import { COLORES } from '@/constantes/colores';
import { ROLES_DISPONIBLES } from '@/constantes/roles';
import { TAMANOS, TIPOGRAFIA } from '@/constantes/tema';
import {
  TEXTOS_MODAL_CODIGO_EMPRESA,
  TEXTOS_MODAL_NOMBRE_EMPRESA,
  TEXTOS_REGISTRO,
} from '@/constantes/textos';
import { useFormulario } from '@/hooks/useFormulario';
import { registrar } from '@/servicios/servicioAutenticacion';
import { guardarSesion } from '@/servicios/servicioSesion';
import { RolUsuario, type SesionAutenticacion } from '@/tipos/autenticacion';
import { esRolValido } from '@/utilidades/esRolValido';
import {
  CAMPOS_REGISTRO,
  REGLAS_CONTRASENA,
  validarRegistro,
} from '@/utilidades/validacionAutenticacion';

// 2. Tipos e interfaces
interface PantallaRegistroProps {
  onRegistroExitoso?: (sesion: SesionAutenticacion) => void;
}

// 3. Constantes del módulo
const ESPACIO_INFERIOR_BASE = 24;

// 4. Componente principal
export default function PantallaRegistro({ onRegistroExitoso }: PantallaRegistroProps) {
  const margenesSeguros = useSafeAreaInsets();
  const [esModalVisible, setEsModalVisible] = useState(false);
  const [errorModal, setErrorModal] = useState<string | undefined>(undefined);

  const formulario = useFormulario({
    campos: CAMPOS_REGISTRO,
    valoresIniciales: {
      nombre: '',
      correo: '',
      contrasena: '',
      confirmarContrasena: '',
      rol: '',
      empresa: '',
    },
    validar: validarRegistro,
    onEnviar: async (valores) => {
      if (!esRolValido(valores.rol)) {
        throw new Error('Selecciona un rol válido');
      }

      const sesion = await registrar({
        nombre: valores.nombre.trim(),
        correo: valores.correo.trim(),
        contrasena: valores.contrasena,
        rol: valores.rol,
        empresa: valores.empresa.trim(),
      });
      await guardarSesion(sesion);
      onRegistroExitoso?.(sesion);
    },
  });

  const textosModal =
    formulario.valores.rol === RolUsuario.DUENO
      ? TEXTOS_MODAL_NOMBRE_EMPRESA
      : TEXTOS_MODAL_CODIGO_EMPRESA;

  const manejarSeleccionRol = (opcion: string) => {
    formulario.manejarCambio('rol')(opcion);
    formulario.manejarCambio('empresa')('');
    setErrorModal(undefined);
    setEsModalVisible(true);
  };

  const manejarCambioEmpresa = (texto: string) => {
    formulario.manejarCambio('empresa')(texto);
    setErrorModal(undefined);
  };

  const manejarContinuarModal = () => {
    const error = validarRegistro(formulario.valores).empresa;
    if (error) {
      setErrorModal(error);
      return;
    }
    setEsModalVisible(false);
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
          <EncabezadoPantalla titulo="Registrar" subtitulo="Registra una cuenta para continuar." />
          <TarjetaFormulario estilo={estilos.tarjeta}>
            <CampoTexto
              etiqueta="Nombre"
              textoMarcador={TEXTOS_REGISTRO.marcadorNombre}
              valor={formulario.valores.nombre}
              error={formulario.obtenerError('nombre')}
              editable={!formulario.estaEnviando}
              autoCapitalize="words"
              autoComplete="name"
              onCambiarTexto={formulario.manejarCambio('nombre')}
              onPerderFoco={formulario.manejarPerdidaFoco('nombre')}
            />
            <CampoTexto
              etiqueta="Correo electrónico"
              textoMarcador={TEXTOS_REGISTRO.marcadorCorreo}
              valor={formulario.valores.correo}
              error={formulario.obtenerError('correo')}
              editable={!formulario.estaEnviando}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              onCambiarTexto={formulario.manejarCambio('correo')}
              onPerderFoco={formulario.manejarPerdidaFoco('correo')}
            />
            <CampoTexto
              etiqueta="Contraseña"
              textoMarcador={TEXTOS_REGISTRO.marcadorContrasena}
              valor={formulario.valores.contrasena}
              error={formulario.obtenerError('contrasena')}
              editable={!formulario.estaEnviando}
              secureTextEntry
              autoCapitalize="none"
              // Sin autollenado: el sistema llenaba el campo con una contraseña sugerida.
              autoComplete="off"
              textContentType="none"
              onCambiarTexto={formulario.manejarCambio('contrasena')}
              onPerderFoco={formulario.manejarPerdidaFoco('contrasena')}
            />
            <View style={estilos.reglas} accessibilityLabel="Requisitos de la contraseña">
              {REGLAS_CONTRASENA.map((regla) => {
                const cumple = regla.cumple(formulario.valores.contrasena);
                return (
                  <Text key={regla.texto} style={cumple ? estilos.reglaCumplida : estilos.regla}>
                    {cumple ? '✓' : '•'} {regla.texto}
                  </Text>
                );
              })}
            </View>
            <CampoTexto
              etiqueta="Confirmar contraseña"
              textoMarcador="Escribe otra vez tu contraseña"
              valor={formulario.valores.confirmarContrasena}
              error={formulario.obtenerError('confirmarContrasena')}
              editable={!formulario.estaEnviando}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="off"
              textContentType="none"
              onCambiarTexto={formulario.manejarCambio('confirmarContrasena')}
              onPerderFoco={formulario.manejarPerdidaFoco('confirmarContrasena')}
            />
            <SelectorRol
              etiqueta="Rol"
              valor={esRolValido(formulario.valores.rol) ? formulario.valores.rol : null}
              textoMarcador={TEXTOS_REGISTRO.marcadorRol}
              opciones={ROLES_DISPONIBLES}
              error={formulario.obtenerError('rol')}
              onSeleccionar={manejarSeleccionRol}
            />
          </TarjetaFormulario>
          {formulario.errorEnvio ? (
            <Text style={estilos.errorEnvio}>{formulario.errorEnvio}</Text>
          ) : null}
          <BotonPrincipal
            etiqueta="Crear cuenta"
            estaCargando={formulario.estaEnviando}
            onPresionar={formulario.manejarEnvio}
            estilo={estilos.boton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
      {esModalVisible ? (
        <ModalEmpresa
          titulo={textosModal.titulo}
          descripcion={textosModal.descripcion}
          etiqueta={textosModal.etiqueta}
          textoMarcador={textosModal.textoMarcador}
          valor={formulario.valores.empresa}
          error={errorModal}
          onCambiarTexto={manejarCambioEmpresa}
          onEnviar={manejarContinuarModal}
        />
      ) : null}
    </View>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  reglas: {
    gap: 2,
    marginTop: -6,
  },
  regla: {
    ...TIPOGRAFIA.leyenda,
    color: COLORES.textoAtenuado,
  },
  reglaCumplida: {
    ...TIPOGRAFIA.leyenda,
    color: COLORES.exitoTexto,
  },
  contenedor: {
    flex: 1,
    backgroundColor: COLORES.fondo,
  },
  flexible: {
    flex: 1,
  },
  contenido: {
    paddingTop: 15,
    paddingHorizontal: 24,
  },
  tarjeta: {
    minHeight: TAMANOS.tarjetaRegistro,
    marginTop: TAMANOS.tarjetaRegistroSuperior,
    marginHorizontal: -TAMANOS.sangriaTarjeta,
  },
  errorEnvio: {
    marginTop: 16,
    textAlign: 'center',
    ...TIPOGRAFIA.leyenda,
    color: COLORES.error,
  },
  boton: {
    marginTop: TAMANOS.botonRegistroSuperior,
  },
});
