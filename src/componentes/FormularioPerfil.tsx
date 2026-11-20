/**
 * @archivo FormularioPerfil.tsx
 * @proyecto Civil Trace
 * @descripcion Tarjeta del perfil (foto, datos, rol y acceso a cambiar contraseña) con su botón
 *              de guardar. Es común para los tres roles.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 20/11/2026
 * @version 1.0.0
 */

// 1. Importaciones
import * as SelectorImagenes from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import AvisoExito from '@/componentes/AvisoExito';
import BotonPrincipal from '@/componentes/BotonPrincipal';
import CampoTexto from '@/componentes/CampoTexto';
import FotoPerfil from '@/componentes/FotoPerfil';
import { IconoCandado, IconoChevronDerecha, IconoLlave } from '@/componentes/Iconos';
import TarjetaFormulario from '@/componentes/TarjetaFormulario';
import { COLORES } from '@/constantes/colores';
import { ETIQUETA_ROL } from '@/constantes/roles';
import { RADIOS, TIPOGRAFIA } from '@/constantes/tema';
import { TEXTOS_PERFIL as TEXTOS } from '@/constantes/textos';
import { useFormulario } from '@/hooks/useFormulario';
import {
  actualizarPerfil,
  descargarFotoPerfil,
  subirFotoPerfil,
  type PerfilUsuario,
} from '@/servicios/servicioPerfil';
import type { SesionAutenticacion } from '@/tipos/autenticacion';
import { CAMPOS_PERFIL, validarPerfil } from '@/utilidades/validacionAutenticacion';

// 2. Tipos e interfaces
interface FormularioPerfilProps {
  sesion: SesionAutenticacion;
  perfil: PerfilUsuario;
  onCambiarContrasena: () => void;
}

interface FotoElegida {
  uri: string;
  tipo: string;
}

// 3. Constantes del módulo
const DURACION_AVISO_MS = 3000;
const CALIDAD_FOTO = 0.7;
const TIPO_FOTO_POR_DEFECTO = 'image/jpeg';

// 4. Componente principal
export default function FormularioPerfil({
  sesion,
  perfil,
  onCambiarContrasena,
}: FormularioPerfilProps) {
  const [fotoElegida, setFotoElegida] = useState<FotoElegida | null>(null);
  // Foto ya guardada: la descargada del servidor o, justo después de subirla, la copia local.
  const [fotoGuardadaUri, setFotoGuardadaUri] = useState<string | null>(null);
  const [errorFoto, setErrorFoto] = useState<string | null>(null);
  const [seGuardo, setSeGuardo] = useState(false);

  const formulario = useFormulario({
    campos: CAMPOS_PERFIL,
    valoresIniciales: {
      nombre: perfil.nombre,
      correo: perfil.correo,
      telefono: perfil.telefono,
    },
    validar: validarPerfil,
    onEnviar: async (valores) => {
      if (fotoElegida) {
        await subirFotoPerfil(sesion.token, fotoElegida.uri, fotoElegida.tipo);
        setFotoGuardadaUri(fotoElegida.uri);
        setFotoElegida(null);
      }
      await actualizarPerfil(sesion.token, {
        nombre: valores.nombre.trim(),
        correo: valores.correo.trim(),
        telefono: valores.telefono.trim(),
      });
      setSeGuardo(true);
    },
  });

  // Descarga la foto guardada al abrir la pantalla.
  useEffect(() => {
    if (!perfil.tieneFoto) {
      return undefined;
    }
    let cancelado = false;
    descargarFotoPerfil(sesion.token)
      .then((uri) => {
        if (!cancelado) {
          setFotoGuardadaUri(uri);
        }
      })
      .catch((falla: unknown) => {
        console.warn('Foto de perfil:', falla);
        if (!cancelado) {
          setErrorFoto(falla instanceof Error ? falla.message : TEXTOS.errorGaleria);
        }
      });
    return () => {
      cancelado = true;
    };
  }, [perfil.tieneFoto, sesion.token]);

  // Oculta el aviso de éxito a los 3 segundos.
  useEffect(() => {
    if (!seGuardo) {
      return undefined;
    }
    const temporizador = setTimeout(() => setSeGuardo(false), DURACION_AVISO_MS);
    return () => clearTimeout(temporizador);
  }, [seGuardo]);

  const manejarElegirFoto = async () => {
    try {
      const resultado = await SelectorImagenes.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: CALIDAD_FOTO,
      });
      const elegida = resultado.assets?.[0];
      if (resultado.canceled || !elegida) {
        return;
      }
      setFotoElegida({ uri: elegida.uri, tipo: elegida.mimeType ?? TIPO_FOTO_POR_DEFECTO });
      setErrorFoto(null);
      setSeGuardo(false);
    } catch {
      setErrorFoto(TEXTOS.errorGaleria);
    }
  };

  const origenFoto = fotoElegida
    ? { uri: fotoElegida.uri }
    : fotoGuardadaUri
      ? { uri: fotoGuardadaUri }
      : null;
  const mensajeError = formulario.errorEnvio;

  return (
    <>
      <TarjetaFormulario estilo={estilos.tarjeta}>
        <FotoPerfil
          nombre={formulario.valores.nombre}
          origen={origenFoto}
          onCambiar={manejarElegirFoto}
        />
        {errorFoto ? <Text style={estilos.error}>{errorFoto}</Text> : null}
        <View style={estilos.campos}>
          <CampoTexto
            etiqueta={TEXTOS.etiquetaNombre}
            valor={formulario.valores.nombre}
            error={formulario.obtenerError('nombre')}
            autoComplete="name"
            returnKeyType="next"
            onCambiarTexto={formulario.manejarCambio('nombre')}
            onPerderFoco={formulario.manejarPerdidaFoco('nombre')}
          />
          <CampoTexto
            etiqueta={TEXTOS.etiquetaCorreo}
            valor={formulario.valores.correo}
            error={formulario.obtenerError('correo')}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            returnKeyType="next"
            onCambiarTexto={formulario.manejarCambio('correo')}
            onPerderFoco={formulario.manejarPerdidaFoco('correo')}
          />
          <CampoTexto
            etiqueta={TEXTOS.etiquetaTelefono}
            textoMarcador={TEXTOS.marcadorTelefono}
            valor={formulario.valores.telefono}
            error={formulario.obtenerError('telefono')}
            keyboardType="phone-pad"
            autoComplete="tel"
            returnKeyType="done"
            onCambiarTexto={formulario.manejarCambio('telefono')}
            onPerderFoco={formulario.manejarPerdidaFoco('telefono')}
            onEnviar={formulario.manejarEnvio}
          />
        </View>
        <View style={estilos.rol}>
          <View>
            <Text style={estilos.etiquetaRol}>{TEXTOS.etiquetaRol}</Text>
            <Text style={estilos.valorRol}>{ETIQUETA_ROL[sesion.usuario.rol]}</Text>
          </View>
          <View style={estilos.noEditable}>
            <IconoCandado />
            <Text style={estilos.textoNoEditable}>{TEXTOS.noEditable}</Text>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          style={estilos.seguridad}
          onPress={onCambiarContrasena}
        >
          <IconoLlave />
          <Text style={estilos.textoSeguridad}>{TEXTOS.cambiarContrasena}</Text>
          <IconoChevronDerecha />
        </Pressable>
      </TarjetaFormulario>
      {seGuardo ? <AvisoExito mensaje={TEXTOS.exito} /> : null}
      {mensajeError ? <Text style={estilos.error}>{mensajeError}</Text> : null}
      <BotonPrincipal
        etiqueta={TEXTOS.etiquetaGuardar}
        estaCargando={formulario.estaEnviando}
        onPresionar={formulario.manejarEnvio}
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
  campos: {
    gap: 10,
  },
  rol: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORES.fondo,
    borderRadius: RADIOS.mosaico,
  },
  etiquetaRol: {
    ...TIPOGRAFIA.leyenda,
    color: COLORES.textoAtenuado,
  },
  valorRol: {
    ...TIPOGRAFIA.etiqueta,
    color: COLORES.texto,
  },
  noEditable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  textoNoEditable: {
    ...TIPOGRAFIA.leyenda,
    color: COLORES.textoSutil,
  },
  seguridad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 40,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORES.borde,
  },
  textoSeguridad: {
    flex: 1,
    ...TIPOGRAFIA.enlace,
    color: COLORES.marca,
  },
  error: {
    ...TIPOGRAFIA.leyenda,
    textAlign: 'center',
    color: COLORES.error,
  },
});