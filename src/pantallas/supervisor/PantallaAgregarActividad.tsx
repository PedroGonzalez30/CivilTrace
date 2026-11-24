/**
 * @archivo PantallaAgregarActividad.tsx
 * @proyecto Civil Trace
 * @descripcion El supervisor agrega una actividad a su obra (Figma Sup_Agregar1ActividadObra,
 *   168:781): nombre, principal responsable (trabajadores de la obra), descripción, fecha de
 *   inicio y fecha de fin estimada.
 * @autor Emilio Manuel Esquivel
 * @fecha 24/11/2026
 * @version 1.0.0
 * @requerimientos CP10 Registrar y modificar actividad
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Creación (feature 003)
 */

// 1. Importaciones
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import BotonPrincipal from '@/componentes/BotonPrincipal';
import CampoTexto from '@/componentes/CampoTexto';
import EncabezadoApp from '@/componentes/EncabezadoApp';
import { IconoChevronIzquierda } from '@/componentes/Iconos';
import SelectorOpcion, { type OpcionSelector } from '@/componentes/SelectorOpcion';
import TarjetaFormulario from '@/componentes/TarjetaFormulario';
import { ErrorApi } from '@/conexion/clienteApi';
import { COLORES } from '@/constantes/colores';
import { RADIOS, SOMBRAS, TIPOGRAFIA } from '@/constantes/tema';
import { crearActividad } from '@/servicios/servicioActividades';
import { obtenerResumenDia } from '@/servicios/servicioAsistencia';
import type { DatosNuevaActividad } from '@/tipos/actividad';
import { aplicarMascaraFecha } from '@/utilidades/formatearFecha';
import { type ErroresActividad, validarActividad } from '@/utilidades/validacionActividad';

// 2. Tipos e interfaces
interface PantallaAgregarActividadProps {
  tokenAcceso: string;
  idObra: string;
  obraNombre: string;
  onRegresar: () => void;
  onAgregada: () => void;
}

type CampoTextoActividad = Exclude<keyof DatosNuevaActividad, 'responsableId'>;

// 3. Constantes del módulo
const VALORES_INICIALES: DatosNuevaActividad = {
  nombre: '',
  responsableId: '',
  descripcion: '',
  fechaInicio: '',
  fechaEntrega: '',
};
const MENSAJE_ERROR = 'No se pudo agregar la actividad. Intenta de nuevo.';
const MENSAJE_SIN_TRABAJADORES = 'Esta obra no tiene trabajadores asignados.';

// 4. Componente principal
export default function PantallaAgregarActividad({
  tokenAcceso,
  idObra,
  obraNombre,
  onRegresar,
  onAgregada,
}: PantallaAgregarActividadProps) {
  const [valores, setValores] = useState<DatosNuevaActividad>(VALORES_INICIALES);
  const [errores, setErrores] = useState<ErroresActividad>({});
  const [trabajadores, setTrabajadores] = useState<OpcionSelector[] | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Los responsables posibles son los trabajadores asignados a la obra.
  useEffect(() => {
    let cancelado = false;
    obtenerResumenDia(tokenAcceso, idObra)
      .then((resumen) => {
        if (!cancelado) {
          setTrabajadores(
            resumen.trabajadores.map((trabajador) => ({
              id: trabajador.id,
              etiqueta: trabajador.nombre,
            })),
          );
        }
      })
      .catch(() => {
        if (!cancelado) {
          setTrabajadores([]);
        }
      });
    return () => {
      cancelado = true;
    };
  }, [tokenAcceso, idObra]);

  const cambiar =
    (clave: keyof DatosNuevaActividad, esFecha = false) =>
    (texto: string) => {
      setValores((anteriores) => ({
        ...anteriores,
        [clave]: esFecha ? aplicarMascaraFecha(texto) : texto,
      }));
      setErrores((anteriores) => ({ ...anteriores, [clave]: undefined }));
      setError(null);
    };

  const manejarAgregar = async () => {
    const encontrados = validarActividad(valores);
    setErrores(encontrados);
    if (Object.keys(encontrados).length > 0) {
      return;
    }
    setEnviando(true);
    setError(null);
    try {
      await crearActividad(tokenAcceso, idObra, valores);
      onAgregada();
    } catch (falla) {
      setError(falla instanceof ErrorApi ? falla.message : MENSAJE_ERROR);
    } finally {
      setEnviando(false);
    }
  };

  const campo = (
    clave: CampoTextoActividad,
    etiqueta: string,
    textoMarcador: string,
    extra: { esFecha?: boolean; esMultilinea?: boolean } = {},
  ) => (
    <CampoTexto
      etiqueta={etiqueta}
      textoMarcador={textoMarcador}
      valor={valores[clave]}
      error={errores[clave]}
      editable={!enviando}
      esMultilinea={extra.esMultilinea}
      keyboardType={extra.esFecha ? 'number-pad' : 'default'}
      onCambiarTexto={cambiar(clave, extra.esFecha)}
    />
  );

  return (
    <View style={estilos.contenedor}>
      <EncabezadoApp />
      {/* En Android de borde a borde el sistema ya no sube la pantalla: se hace aquí (D-27). */}
      <KeyboardAvoidingView style={estilos.teclado} behavior="padding">
        <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
          <View style={estilos.encabezado}>
            <Pressable style={estilos.regresar} onPress={onRegresar} accessibilityLabel="Regresar">
              <IconoChevronIzquierda tamano={20} color={COLORES.textoAtenuado} />
            </Pressable>
            <Text style={estilos.titulo}>Agregar actividad para {obraNombre}</Text>
          </View>
          <Text style={estilos.subtitulo}>Completa los datos para agregar una actividad</Text>
          <TarjetaFormulario estilo={estilos.tarjeta}>
            {campo('nombre', 'Nombre de la actividad', 'Colocar loseta')}
            <SelectorOpcion
              etiqueta="Principal responsable"
              valor={valores.responsableId}
              textoMarcador="Elige a un trabajador"
              opciones={trabajadores ?? []}
              error={errores.responsableId}
              onSeleccionar={cambiar('responsableId')}
            />
            {trabajadores !== null && trabajadores.length === 0 ? (
              <Text style={estilos.ayuda}>{MENSAJE_SIN_TRABAJADORES}</Text>
            ) : null}
            {campo('descripcion', 'Descripción', 'Colocar loseta en baño de segundo piso', {
              esMultilinea: true,
            })}
            {campo('fechaInicio', 'Fecha de inicio', '02/10/2026', { esFecha: true })}
            {campo('fechaEntrega', 'Fecha de fin estimada', '27/10/2026', { esFecha: true })}
            {error ? <Text style={estilos.error}>{error}</Text> : null}
            <BotonPrincipal
              etiqueta="Agregar"
              estaCargando={enviando}
              onPresionar={() => void manejarAgregar()}
            />
          </TarjetaFormulario>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: COLORES.pantalla },
  teclado: { flex: 1 },
  contenido: { padding: 18, gap: 10, paddingBottom: 40 },
  encabezado: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  regresar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORES.superficie,
    alignItems: 'center',
    justifyContent: 'center',
    ...SOMBRAS.tarjeta,
  },
  titulo: { ...TIPOGRAFIA.titulo2, color: COLORES.texto, flex: 1 },
  subtitulo: { ...TIPOGRAFIA.leyenda, color: COLORES.textoAtenuado },
  tarjeta: { gap: 12, padding: 18, borderRadius: RADIOS.tarjeta },
  ayuda: { ...TIPOGRAFIA.leyenda, color: COLORES.textoSutil },
  error: { ...TIPOGRAFIA.leyenda, color: COLORES.error },
});
