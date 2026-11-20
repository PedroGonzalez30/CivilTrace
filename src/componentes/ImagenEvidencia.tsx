/**
 * @archivo ImagenEvidencia.tsx
 * @proyecto Civil Trace
 * @descripcion Carga y muestra una fotografía de evidencia desde el endpoint autenticado de la API.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 20/11/2026
 * @version 1.0.0
 */

// 1. Importaciones
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

import { COLORES } from '@/constantes/colores';
import { RADIOS, TIPOGRAFIA } from '@/constantes/tema';
import { construirUrlFotoAvance } from '@/servicios/servicioActividades';

// 2. Tipos e interfaces
interface ImagenEvidenciaProps {
  tokenAcceso: string;
  idObra: string;
  idActividad: string;
  idAvance: string;
}

// 3. Constantes del módulo
const MENSAJE_SIN_IMAGEN = 'Sin fotografía disponible';

// 4. Componente principal
export default function ImagenEvidencia({
  tokenAcceso,
  idObra,
  idActividad,
  idAvance,
}: ImagenEvidenciaProps) {
  const [uriImagen, setUriImagen] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setFallo(false);
    setUriImagen(null);

    const url = construirUrlFotoAvance(idObra, idActividad, idAvance);
    fetch(url, {
      headers: {
        Authorization: `Bearer ${tokenAcceso}`,
      },
    })
      .then(async (respuesta) => {
        if (!respuesta.ok) {
          throw new Error('Error al obtener imagen');
        }
        const blob = await respuesta.blob();
        return await new Promise<string>((resolver, rechazar) => {
          const lector = new FileReader();
          lector.onloadend = () => {
            if (typeof lector.result === 'string') {
              resolver(lector.result);
            } else {
              rechazar(new Error('Lectura inválida'));
            }
          };
          lector.onerror = () => rechazar(new Error('Error leyendo imagen'));
          lector.readAsDataURL(blob);
        });
      })
      .then((dataUri) => {
        if (!cancelado) {
          setUriImagen(dataUri);
        }
      })
      .catch(() => {
        if (!cancelado) {
          setFallo(true);
        }
      })
      .finally(() => {
        if (!cancelado) {
          setCargando(false);
        }
      });

    return () => {
      cancelado = true;
    };
  }, [tokenAcceso, idObra, idActividad, idAvance]);

  if (cargando) {
    return (
      <View style={estilos.placeholder}>
        <ActivityIndicator color={COLORES.marca} />
      </View>
    );
  }

  if (fallo || !uriImagen) {
    return (
      <View style={estilos.placeholder}>
        <Text style={estilos.textoError}>{MENSAJE_SIN_IMAGEN}</Text>
      </View>
    );
  }

  return <Image source={{ uri: uriImagen }} style={estilos.imagen} resizeMode="cover" />;
}

// 5. Estilos
const estilos = StyleSheet.create({
  imagen: {
    width: '100%',
    height: 180,
    borderRadius: RADIOS.accion,
    backgroundColor: COLORES.fondoEntrada,
  },
  placeholder: {
    width: '100%',
    height: 180,
    borderRadius: RADIOS.accion,
    borderWidth: 1,
    borderColor: COLORES.borde,
    backgroundColor: COLORES.fondoEntrada,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  textoError: {
    ...TIPOGRAFIA.leyenda,
    color: COLORES.textoSutil,
    textAlign: 'center',
  },
});
