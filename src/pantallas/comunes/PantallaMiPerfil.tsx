/**
 * @archivo PantallaMiPerfil.tsx
 * @proyecto Civil Trace
 * @descripcion Pantalla Mi perfil, común para dueño, supervisor y trabajador: datos
 *              personales, foto, cambio de contraseña y cierre de sesión.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 20/11/2026
 * @version 2.0.0
 */

// 1. Importaciones
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  BotonPrincipal,
  EncabezadoApp,
  EncabezadoPantalla,
  FormularioPerfil,
} from '@/componentes';
import { ErrorApi } from '@/conexion/clienteApi';
import { COLORES } from '@/constantes/colores';
import { TIPOGRAFIA } from '@/constantes/tema';
import { TEXTOS_PERFIL as TEXTOS } from '@/constantes/textos';
import PantallaCambiarContrasena from '@/pantallas/comunes/PantallaCambiarContrasena';
import { obtenerPerfil, type PerfilUsuario } from '@/servicios/servicioPerfil';
import type { SesionAutenticacion } from '@/tipos/autenticacion';

// 2. Tipos e interfaces
interface PantallaMiPerfilProps {
  sesion: SesionAutenticacion;
  onCerrarSesion: () => void;
}

// 4. Componente principal
export default function PantallaMiPerfil({ sesion, onCerrarSesion }: PantallaMiPerfilProps) {
  const [esCambioVisible, setEsCambioVisible] = useState(false);
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    // Evita actualizar el estado si la pantalla se cerró antes de que respondiera la API.
    let cancelado = false;
    setError(null);

    obtenerPerfil(sesion.token)
      .then((datos) => {
        if (!cancelado) {
          setPerfil(datos);
        }
      })
      .catch((falla: unknown) => {
        if (!cancelado) {
          setError(falla instanceof ErrorApi ? falla.message : TEXTOS.errorCarga);
        }
      });

    return () => {
      cancelado = true;
    };
  }, [sesion.token, intento]);

  if (esCambioVisible) {
    return (
      <PantallaCambiarContrasena sesion={sesion} onRegresar={() => setEsCambioVisible(false)} />
    );
  }

  return (
    <View style={estilos.contenedor}>
      <EncabezadoApp />
      <ScrollView
        contentContainerStyle={estilos.contenido}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <EncabezadoPantalla titulo={TEXTOS.titulo} subtitulo={TEXTOS.subtitulo} />
        {perfil ? (
          <FormularioPerfil
            sesion={sesion}
            perfil={perfil}
            onCambiarContrasena={() => setEsCambioVisible(true)}
          />
        ) : error ? (
          <View style={estilos.centro}>
            <Text style={estilos.error}>{error}</Text>
            <Pressable onPress={() => setIntento((anterior) => anterior + 1)}>
              <Text style={estilos.reintentar}>{TEXTOS.reintentar}</Text>
            </Pressable>
          </View>
        ) : (
          <ActivityIndicator color={COLORES.marca} />
        )}
        <BotonPrincipal
          etiqueta={TEXTOS.etiquetaCerrarSesion}
          variante="contorno"
          onPresionar={onCerrarSesion}
        />
      </ScrollView>
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
    gap: 12,
    padding: 24,
  },
  centro: {
    alignItems: 'center',
    gap: 8,
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