/**
 * @archivo FormularioDatosEmpresa.tsx
 * @proyecto Civil Trace
 * @descripcion Tarjeta con el logotipo y los datos de la empresa. Empieza en modo lectura; con
 *              "Editar" se habilita y, antes de guardar, pide confirmación.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 20/11/2026
 * @version 1.0.0
 */

// 1. Importaciones
import * as SelectorImagenes from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import BotonPrincipal from '@/componentes/BotonPrincipal';
import CampoTexto from '@/componentes/CampoTexto';
import FotoPerfil from '@/componentes/FotoPerfil';
import { IconoUbicacion } from '@/componentes/Iconos';
import ModalEliminarPersonal from '@/componentes/ModalEliminarPersonal';
import TarjetaFormulario from '@/componentes/TarjetaFormulario';
import { ErrorApi } from '@/conexion/clienteApi';
import { COLORES } from '@/constantes/colores';
import { TAMANOS, TIPOGRAFIA } from '@/constantes/tema';
import { TEXTOS_DATOS_EMPRESA as TEXTOS } from '@/constantes/textos';
import { useFormulario } from '@/hooks/useFormulario';
import {
  actualizarDatosEmpresa,
  descargarLogoEmpresa,
  subirLogoEmpresa,
  type DatosEmpresa,
} from '@/servicios/servicioEmpresa';
import { CAMPOS_DATOS_EMPRESA, validarDatosEmpresa } from '@/utilidades/validacionAutenticacion';

// 2. Tipos e interfaces
interface FormularioDatosEmpresaProps {
  tokenAcceso: string;
  datos: DatosEmpresa;
  onGuardado: (nombre: string) => void;
  onAceptar: () => void;
}

interface LogoElegido {
  uri: string;
  tipo: string;
}

// 3. Constantes del módulo
const CALIDAD_LOGO = 0.7;
const TIPO_LOGO_POR_DEFECTO = 'image/jpeg';

// 4. Componente principal
export default function FormularioDatosEmpresa({
  tokenAcceso,
  datos,
  onGuardado,
  onAceptar,
}: FormularioDatosEmpresaProps) {
  const [estaEditando, setEstaEditando] = useState(false);
  const [esConfirmacionVisible, setEsConfirmacionVisible] = useState(false);
  const [estaGuardando, setEstaGuardando] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null);
  const [logoElegido, setLogoElegido] = useState<LogoElegido | null>(null);
  const [logoGuardadoUri, setLogoGuardadoUri] = useState<string | null>(null);

  // Validar abre la confirmación; el guardado real ocurre al aceptarla.
  const formulario = useFormulario({
    campos: CAMPOS_DATOS_EMPRESA,
    valoresIniciales: {
      nombre: datos.nombre,
      correo: datos.correo,
      descripcion: datos.descripcion,
      direccion: datos.direccion,
    },
    validar: validarDatosEmpresa,
    onEnviar: async () => {
      setErrorGuardado(null);
      setEsConfirmacionVisible(true);
    },
  });

  // Descarga el logotipo guardado al abrir la pantalla.
  useEffect(() => {
    if (!datos.tieneLogo) {
      return undefined;
    }
    let cancelado = false;
    descargarLogoEmpresa(tokenAcceso)
      .then((uri) => {
        if (!cancelado) {
          setLogoGuardadoUri(uri);
        }
      })
      .catch((falla: unknown) => {
        console.warn('Logotipo de la empresa:', falla);
      });
    return () => {
      cancelado = true;
    };
  }, [datos.tieneLogo, tokenAcceso]);

  const manejarElegirLogo = async () => {
    try {
      const resultado = await SelectorImagenes.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: CALIDAD_LOGO,
      });
      const elegida = resultado.assets?.[0];
      if (resultado.canceled || !elegida) {
        return;
      }
      setLogoElegido({ uri: elegida.uri, tipo: elegida.mimeType ?? TIPO_LOGO_POR_DEFECTO });
      setErrorGuardado(null);
    } catch {
      setErrorGuardado(TEXTOS.errorGaleria);
    }
  };

  const manejarCancelarConfirmacion = () => {
    if (!estaGuardando) {
      setEsConfirmacionVisible(false);
    }
  };

  const manejarConfirmar = async () => {
    const { nombre, correo, descripcion, direccion } = formulario.valores;
    setEstaGuardando(true);
    try {
      if (logoElegido) {
        await subirLogoEmpresa(tokenAcceso, logoElegido.uri, logoElegido.tipo);
        setLogoGuardadoUri(logoElegido.uri);
        setLogoElegido(null);
      }
      const actualizados = await actualizarDatosEmpresa(tokenAcceso, {
        nombre: nombre.trim(),
        correo: correo.trim(),
        descripcion: descripcion.trim(),
        direccion: direccion.trim(),
      });
      setEstaEditando(false);
      onGuardado(actualizados.nombre);
    } catch (falla: unknown) {
      setErrorGuardado(falla instanceof ErrorApi ? falla.message : TEXTOS.errorGuardar);
    } finally {
      setEstaGuardando(false);
      setEsConfirmacionVisible(false);
    }
  };

  const origenLogo = logoElegido
    ? { uri: logoElegido.uri }
    : logoGuardadoUri
      ? { uri: logoGuardadoUri }
      : null;

  return (
    <>
      <TarjetaFormulario estilo={estilos.tarjeta}>
        <FotoPerfil
          variante="logotipo"
          nombre={formulario.valores.nombre}
          origen={origenLogo}
          etiquetaAccion={TEXTOS.cambiarLogotipo}
          descripcion={TEXTOS.formatoLogotipo}
          estaDeshabilitado={!estaEditando}
          onCambiar={manejarElegirLogo}
        />
        <CampoTexto
          etiqueta={TEXTOS.etiquetaNombre}
          valor={formulario.valores.nombre}
          error={formulario.obtenerError('nombre')}
          editable={estaEditando}
          returnKeyType="next"
          onCambiarTexto={formulario.manejarCambio('nombre')}
          onPerderFoco={formulario.manejarPerdidaFoco('nombre')}
        />
        <CampoTexto
          etiqueta={TEXTOS.etiquetaCorreo}
          textoMarcador={TEXTOS.marcadorCorreo}
          valor={formulario.valores.correo}
          error={formulario.obtenerError('correo')}
          editable={estaEditando}
          keyboardType="email-address"
          autoCapitalize="none"
          returnKeyType="next"
          onCambiarTexto={formulario.manejarCambio('correo')}
          onPerderFoco={formulario.manejarPerdidaFoco('correo')}
        />
        <CampoTexto
          etiqueta={TEXTOS.etiquetaDescripcion}
          textoMarcador={TEXTOS.marcadorDescripcion}
          valor={formulario.valores.descripcion}
          error={formulario.obtenerError('descripcion')}
          editable={estaEditando}
          esMultilinea
          estiloCaja={estilos.cajaDescripcion}
          onCambiarTexto={formulario.manejarCambio('descripcion')}
          onPerderFoco={formulario.manejarPerdidaFoco('descripcion')}
        />
        <CampoTexto
          etiqueta={TEXTOS.etiquetaUbicacion}
          textoMarcador={TEXTOS.marcadorUbicacion}
          valor={formulario.valores.direccion}
          error={formulario.obtenerError('direccion')}
          editable={estaEditando}
          esMultilinea
          Icono={IconoUbicacion}
          estiloCaja={estilos.cajaUbicacion}
          onCambiarTexto={formulario.manejarCambio('direccion')}
          onPerderFoco={formulario.manejarPerdidaFoco('direccion')}
        />
      </TarjetaFormulario>
      {errorGuardado ? <Text style={estilos.error}>{errorGuardado}</Text> : null}
      {estaEditando ? (
        <BotonPrincipal
          etiqueta={TEXTOS.guardar}
          estaCargando={formulario.estaEnviando}
          onPresionar={formulario.manejarEnvio}
        />
      ) : (
        <View style={estilos.botones}>
          <BotonPrincipal
            etiqueta={TEXTOS.editar}
            variante="contorno"
            estilo={estilos.boton}
            onPresionar={() => setEstaEditando(true)}
          />
          <BotonPrincipal
            etiqueta={TEXTOS.aceptar}
            estilo={estilos.boton}
            onPresionar={onAceptar}
          />
        </View>
      )}
      <ModalEliminarPersonal
        esVisible={esConfirmacionVisible}
        estaCargando={estaGuardando}
        titulo={TEXTOS.confirmarTitulo}
        descripcion={TEXTOS.confirmarDescripcion}
        onCancelar={manejarCancelarConfirmacion}
        onAceptar={manejarConfirmar}
      />
    </>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  tarjeta: {
    gap: 12,
    padding: 16,
  },
  cajaDescripcion: {
    height: TAMANOS.entradaDescripcion,
  },
  cajaUbicacion: {
    height: TAMANOS.entradaUbicacion,
  },
  botones: {
    flexDirection: 'row',
    gap: 12,
  },
  boton: {
    flex: 1,
  },
  error: {
    ...TIPOGRAFIA.leyenda,
    textAlign: 'center',
    color: COLORES.error,
  },
});
