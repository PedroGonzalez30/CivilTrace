/**
 * @archivo App.tsx
 * @proyecto Civil Trace
 * @descripcion Componente raíz: carga las fuentes, restaura la sesión y muestra la navegación.
 * @autor POR_COMPLETAR
 * @fecha POR_COMPLETAR
 * @version 1.1.0
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Configura la base local de asistencia (feature 001)
 */

// 1. Importaciones
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorApi } from '@/conexion/clienteApi';
import NavegadorRaiz from '@/navegacion/NavegadorRaiz';
import { configurarBaseLocal } from '@/servicios/local/baseLocal';
import { cerrarSesionRemota, refrescarSesion } from '@/servicios/servicioAutenticacion';
import { guardarSesion, limpiarSesion, restaurarSesion } from '@/servicios/servicioSesion';
import type { SesionAutenticacion } from '@/tipos/autenticacion';

// 3. Constantes del módulo
const CODIGO_NO_AUTORIZADO = 401;

// La base SQLite de asistencia se abre la primera vez que se usa (escaneos sin conexión).
configurarBaseLocal();
// Si al token de acceso le queda menos que esto, se renueva antes de usarlo.
const MARGEN_RENOVACION_MS = 60 * 1000;

/**
 * Restaura la sesión guardada y, si su token de acceso venció, la renueva con el de refresco.
 * Si el servidor rechaza el refresco (401) la sesión se descarta; si no hay conexión, se
 * conserva la sesión guardada para no sacar al usuario por una falla de red.
 */
async function restaurarYRenovarSesion(): Promise<SesionAutenticacion | null> {
  const guardada = await restaurarSesion();
  if (!guardada || guardada.venceEn > Date.now() + MARGEN_RENOVACION_MS) {
    return guardada;
  }

  try {
    const renovada = await refrescarSesion(guardada.tokenRefresco);
    await guardarSesion(renovada);
    return renovada;
  } catch (error) {
    if (error instanceof ErrorApi && error.estado === CODIGO_NO_AUTORIZADO) {
      await limpiarSesion();
      return null;
    }
    return guardada;
  }
}

// 4. Componente principal
export default function App() {
  const [fuentesCargadas] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });
  const [sesion, setSesion] = useState<SesionAutenticacion | null>(null);
  const [estaRestaurando, setEstaRestaurando] = useState(true);

  useEffect(() => {
    restaurarYRenovarSesion()
      .then(setSesion)
      .finally(() => setEstaRestaurando(false));
  }, []);

  // Renueva el token de acceso poco antes de que venza, para que las peticiones no den 401.
  useEffect(() => {
    if (!sesion) {
      return;
    }

    const espera = Math.max(sesion.venceEn - Date.now() - MARGEN_RENOVACION_MS, 0);
    const temporizador = setTimeout(() => {
      refrescarSesion(sesion.tokenRefresco)
        .then(async (renovada) => {
          await guardarSesion(renovada);
          setSesion(renovada);
        })
        .catch(async (error: unknown) => {
          // Solo un 401 cierra la sesión; una falla de red no saca al usuario.
          if (error instanceof ErrorApi && error.estado === CODIGO_NO_AUTORIZADO) {
            await limpiarSesion();
            setSesion(null);
          }
        });
    }, espera);

    return () => clearTimeout(temporizador);
  }, [sesion]);

  const manejarCierreSesion = async () => {
    if (sesion) {
      await cerrarSesionRemota(sesion.tokenRefresco);
    }
    await limpiarSesion();
    setSesion(null);
  };

  if (!fuentesCargadas || estaRestaurando) {
    return null;
  }

  // Mantiene el nombre de la empresa de la sesión al día para el saludo del inicio.
  const manejarCambioNombreEmpresa = (nombre: string) => {
    if (!sesion) {
      return;
    }
    const actualizada: SesionAutenticacion = {
      ...sesion,
      usuario: { ...sesion.usuario, empresa: nombre },
    };
    setSesion(actualizada);
    guardarSesion(actualizada).catch(() => {
      // La sesión en memoria ya quedó actualizada; al renovar el token la API corrige el nombre.
    });
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavegadorRaiz
        sesion={sesion}
        onIniciarSesion={setSesion}
        onCerrarSesion={manejarCierreSesion}
        onNombreEmpresaCambiado={manejarCambioNombreEmpresa}
      />
    </SafeAreaProvider>
  );
}
