/**
 * @archivo PantallaMiPerfil.tsx
 * @proyecto Civil Trace
 * @descripcion Pantalla temporal que muestra la sesión activa, permite cambiar la contraseña
 *              y cerrar sesión.
 * @autor POR_COMPLETAR
 * @fecha POR_COMPLETAR
 * @version 1.1.0
 */

// 1. Importaciones
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BotonPrincipal, EncabezadoApp } from '@/componentes';
import { COLORES } from '@/constantes/colores';
import { TIPOGRAFIA } from '@/constantes/tema';
import PantallaCambiarContrasena from '@/pantallas/comunes/PantallaCambiarContrasena';
import type { SesionAutenticacion } from '@/tipos/autenticacion';

// 2. Tipos e interfaces
interface PantallaMiPerfilProps {
  sesion: SesionAutenticacion;
  onCerrarSesion: () => void;
}

// 4. Componente principal
// TODO(Equipo): reemplazar esta pantalla temporal por el perfil real del usuario.
export default function PantallaMiPerfil({ sesion, onCerrarSesion }: PantallaMiPerfilProps) {
  const [esCambioVisible, setEsCambioVisible] = useState(false);

  if (esCambioVisible) {
    return (
      <PantallaCambiarContrasena sesion={sesion} onRegresar={() => setEsCambioVisible(false)} />
    );
  }

  return (
    <View style={estilos.contenedor}>
      <EncabezadoApp />
      <View style={estilos.contenido}>
        <Text style={estilos.texto}>Sesión activa: {sesion.usuario.nombre}</Text>
        <Text style={estilos.texto}>Rol: {sesion.usuario.rol}</Text>
        <BotonPrincipal
          etiqueta="Cambiar contraseña"
          variante="contorno"
          onPresionar={() => setEsCambioVisible(true)}
        />
        <BotonPrincipal etiqueta="Cerrar sesión" variante="contorno" onPresionar={onCerrarSesion} />
      </View>
    </View>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: COLORES.fondo,
  },
  contenido: {
    gap: 16,
    padding: 24,
  },
  texto: {
    ...TIPOGRAFIA.subtitulo,
    color: COLORES.texto,
  },
});