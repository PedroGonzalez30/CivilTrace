/**
 * @archivo App.tsx
 * @proyecto Civil Trace
 * @descripcion Componente raíz: carga las fuentes, restaura la sesión y muestra la navegación.
 * @autor POR_COMPLETAR
 * @fecha POR_COMPLETAR
 * @version 1.0.0
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

import NavegadorRaiz from '@/navegacion/NavegadorRaiz';
import { limpiarSesion, restaurarSesion } from '@/servicios/servicioSesion';
import type { SesionAutenticacion } from '@/tipos/autenticacion';

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
    restaurarSesion()
      .then(setSesion)
      .finally(() => setEstaRestaurando(false));
  }, []);

  const manejarCierreSesion = async () => {
    await limpiarSesion();
    setSesion(null);
  };

  if (!fuentesCargadas || estaRestaurando) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavegadorRaiz
        sesion={sesion}
        onIniciarSesion={setSesion}
        onCerrarSesion={manejarCierreSesion}
      />
    </SafeAreaProvider>
  );
}
