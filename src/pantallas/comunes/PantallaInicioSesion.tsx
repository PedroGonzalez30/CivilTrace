/**
 * @archivo PantallaInicioSesion.tsx
 * @proyecto Civil Trace
 * @descripcion Pantalla donde el usuario inicia sesión con su correo y contraseña.
 * @autor POR_COMPLETAR
 * @fecha POR_COMPLETAR
 * @version 1.1.0
 */

// 1. Importaciones
import { useEffect, useRef, useState } from 'react';
import {
  BackHandler,
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
  EncabezadoPantalla,
  ModalEmpresa,
  TarjetaFormulario,
} from '@/componentes';
import type { CampoTextoRef } from '@/componentes';
import { ErrorApi } from '@/conexion/clienteApi';
import { COLORES } from '@/constantes/colores';
import { TAMANOS, TIPOGRAFIA } from '@/constantes/tema';
import { TEXTOS_INICIO_SESION, TEXTOS_MODAL_CODIGO_EMPRESA } from '@/constantes/textos';
import { useFormulario } from '@/hooks/useFormulario';
import { iniciarSesion, unirseAEmpresa } from '@/servicios/servicioAutenticacion';
import { guardarSesion } from '@/servicios/servicioSesion';
import type { SesionAutenticacion } from '@/tipos/autenticacion';
import { CAMPOS_INICIO_SESION, validarInicioSesion } from '@/utilidades/validacionAutenticacion';

// 2. Tipos e interfaces
interface PantallaInicioSesionProps {
  onInicioExitoso?: (sesion: SesionAutenticacion) => void;
  onOlvideContrasena?: () => void;
  onIrARegistro?: () => void;
}

// 3. Constantes del módulo
const ESPACIO_INFERIOR_BASE = 24;
// La API responde 403 en el login cuando la contraseña es correcta pero la cuenta no tiene empresa.
const CODIGO_SIN_EMPRESA = 403;
const MENSAJE_CODIGO_REQUERIDO = 'El código de la empresa es requerido';
const MENSAJE_ERROR_INESPERADO = 'Ocurrió un error inesperado';

// 4. Componente principal
export default function PantallaInicioSesion({
  onInicioExitoso,
  onOlvideContrasena,
  onIrARegistro,
}: PantallaInicioSesionProps) {
  const margenesSeguros = useSafeAreaInsets();
  const referenciaContrasena = useRef<CampoTextoRef>(null);
  const [esModalVisible, setEsModalVisible] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [errorCodigo, setErrorCodigo] = useState<string | undefined>(undefined);
  const [estaUniendo, setEstaUniendo] = useState(false);

  const formulario = useFormulario({
    campos: CAMPOS_INICIO_SESION,
    valoresIniciales: { correo: '', contrasena: '' },
    validar: validarInicioSesion,
    onEnviar: async (valores) => {
      try {
        const sesion = await iniciarSesion(valores.correo.trim(), valores.contrasena);
        await guardarSesion(sesion);
        onInicioExitoso?.(sesion);
      } catch (error) {
        // Cuenta sin empresa: se pide el código de una empresa en lugar de mostrar un error.
        if (error instanceof ErrorApi && error.estado === CODIGO_SIN_EMPRESA) {
          setCodigo('');
          setErrorCodigo(undefined);
          setEsModalVisible(true);
          return;
        }
        throw error;
      }
    },
  });

  // En Android, el botón atrás cierra el modal del código.
  useEffect(() => {
    if (!esModalVisible) {
      return undefined;
    }
    const suscripcion = BackHandler.addEventListener('hardwareBackPress', () => {
      setEsModalVisible(false);
      return true;
    });
    return () => suscripcion.remove();
  }, [esModalVisible]);

  const manejarEnvioCorreo = () => {
    referenciaContrasena.current?.focus();
  };

  const manejarCambioCodigo = (texto: string) => {
    setCodigo(texto);
    setErrorCodigo(undefined);
  };

  const manejarEnviarCodigo = async () => {
    if (estaUniendo) {
      return;
    }
    if (!codigo.trim()) {
      setErrorCodigo(MENSAJE_CODIGO_REQUERIDO);
      return;
    }

    setEstaUniendo(true);
    try {
      const sesion = await unirseAEmpresa(
        formulario.valores.correo.trim(),
        formulario.valores.contrasena,
        codigo.trim(),
      );
      await guardarSesion(sesion);
      setEsModalVisible(false);
      onInicioExitoso?.(sesion);
    } catch (error) {
      setErrorCodigo(error instanceof Error ? error.message : MENSAJE_ERROR_INESPERADO);
    } finally {
      setEstaUniendo(false);
    }
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
          <EncabezadoPantalla titulo="Iniciar sesión" subtitulo="Inicia sesión para continuar." />
          <TarjetaFormulario estilo={estilos.tarjeta}>
            <CampoTexto
              etiqueta="Correo electrónico"
              textoMarcador={TEXTOS_INICIO_SESION.marcadorCorreo}
              valor={formulario.valores.correo}
              error={formulario.obtenerError('correo')}
              editable={!formulario.estaEnviando}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              returnKeyType="next"
              onCambiarTexto={formulario.manejarCambio('correo')}
              onPerderFoco={formulario.manejarPerdidaFoco('correo')}
              onEnviar={manejarEnvioCorreo}
            />
            <CampoTexto
              etiqueta="Contraseña"
              textoMarcador={TEXTOS_INICIO_SESION.marcadorContrasena}
              valor={formulario.valores.contrasena}
              error={formulario.obtenerError('contrasena')}
              editable={!formulario.estaEnviando}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              returnKeyType="done"
              referenciaEntrada={referenciaContrasena}
              onCambiarTexto={formulario.manejarCambio('contrasena')}
              onPerderFoco={formulario.manejarPerdidaFoco('contrasena')}
              onEnviar={formulario.manejarEnvio}
            />
            <Text style={estilos.olvido} onPress={onOlvideContrasena}>
              ¿Olvidaste tu contraseña?
            </Text>
          </TarjetaFormulario>
          {formulario.errorEnvio ? (
            <Text style={estilos.errorEnvio}>{formulario.errorEnvio}</Text>
          ) : null}
          <View style={estilos.acciones}>
            <BotonPrincipal
              etiqueta="Iniciar sesión"
              estaCargando={formulario.estaEnviando}
              onPresionar={formulario.manejarEnvio}
            />
            <BotonPrincipal
              etiqueta="Crear cuenta"
              variante="contorno"
              onPresionar={onIrARegistro}
            />
          </View>
          <Text style={estilos.pie}>
            ¿No tienes una cuenta?{' '}
            <Text style={estilos.enlacePie} onPress={onIrARegistro}>
              Regístrate aquí
            </Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
      {esModalVisible ? (
        <ModalEmpresa
          titulo={TEXTOS_MODAL_CODIGO_EMPRESA.titulo}
          descripcion={TEXTOS_MODAL_CODIGO_EMPRESA.descripcion}
          etiqueta={TEXTOS_MODAL_CODIGO_EMPRESA.etiqueta}
          textoMarcador={TEXTOS_MODAL_CODIGO_EMPRESA.textoMarcador}
          valor={codigo}
          error={errorCodigo}
          onCambiarTexto={manejarCambioCodigo}
          onEnviar={manejarEnviarCodigo}
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
    gap: 32,
    paddingTop: 10,
    paddingHorizontal: 24,
  },
  tarjeta: {
    minHeight: TAMANOS.tarjetaInicioSesion,
  },
  olvido: {
    alignSelf: 'center',
    ...TIPOGRAFIA.enlace,
    color: COLORES.primario,
  },
  errorEnvio: {
    textAlign: 'center',
    ...TIPOGRAFIA.leyenda,
    color: COLORES.error,
  },
  acciones: {
    gap: 16,
  },
  pie: {
    paddingTop: 24,
    textAlign: 'center',
    ...TIPOGRAFIA.leyenda,
    color: COLORES.textoAtenuado,
  },
  enlacePie: {
    ...TIPOGRAFIA.enlace,
    color: COLORES.primario,
  },
});
