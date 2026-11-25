/**
 * @archivo SelectorHora.tsx
 * @proyecto Civil Trace
 * @descripcion Campo para escribir una hora (HH:MM, 24 horas) en el horario de la obra y en los
 *   detalles de asistencia. Debajo muestra la hora en formato am/pm para confirmar.
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 2.0.0
 * @requerimientos RF-29 Registrar asistencia por el supervisor, RF-64 Modificar registro de
 *   asistencia (SRS v5.0)
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación con lista de horas (feature 001)
 *   25/11/2026 - Emilio Manuel Esquivel - Se escribe la hora en lugar de elegirla de una lista
 *   (retroalimentación del equipo, feature 006, D-36)
 */

// 1. Importaciones
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { COLORES } from '@/constantes/colores';
import { RADIOS, TIPOGRAFIA } from '@/constantes/tema';
import { formatearHoraCampo } from '@/utilidades/formatoHoras';

// 2. Tipos e interfaces
interface SelectorHoraProps {
  etiqueta: string;
  // null = todavía sin hora (por ejemplo, salida no registrada).
  valor: string | null;
  onCambiar: (hora: string) => void;
}

// 3. Constantes del módulo
const SIN_HORA = '—';
const LARGO_HORA = 5;
const DIGITOS_HORA = 4;
const REGEX_HORA = /^([01]\d|2[0-3]):([0-5]\d)$/;
const MENSAJE_INVALIDA = 'Escribe la hora como 08:00 o 16:30';

// 4. Componente principal
/**
 * Acomoda lo que se escribe como HH:MM: solo dígitos y los dos puntos después de la hora.
 *
 * @param texto - Lo que escribió el usuario.
 * @returns El texto con formato.
 */
export function aplicarMascaraHora(texto: string): string {
  const digitos = texto.replace(/\D/g, '').slice(0, DIGITOS_HORA);
  return digitos.length > 2 ? `${digitos.slice(0, 2)}:${digitos.slice(2)}` : digitos;
}

/** @returns true si es una hora válida de 00:00 a 23:59. */
export function esHoraValida(texto: string): boolean {
  return REGEX_HORA.test(texto);
}

export default function SelectorHora({ etiqueta, valor, onCambiar }: SelectorHoraProps) {
  const [texto, setTexto] = useState(valor ?? '');

  useEffect(() => {
    setTexto(valor ?? '');
  }, [valor]);

  const manejarCambio = (escrito: string) => {
    const conFormato = aplicarMascaraHora(escrito);
    setTexto(conFormato);
    if (esHoraValida(conFormato) && conFormato !== valor) {
      onCambiar(conFormato);
    }
  };

  const estaCompleta = texto.length === LARGO_HORA;
  const esInvalida = estaCompleta && !esHoraValida(texto);

  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>
      <TextInput
        style={[estilos.campo, esInvalida && estilos.campoError]}
        value={texto}
        onChangeText={manejarCambio}
        placeholder="08:00"
        placeholderTextColor={COLORES.marcador}
        keyboardType="number-pad"
        maxLength={LARGO_HORA}
        accessibilityLabel={`${etiqueta}: ${valor ? formatearHoraCampo(valor) : SIN_HORA}`}
      />
      <Text style={esInvalida ? estilos.error : estilos.ayuda}>
        {esInvalida ? MENSAJE_INVALIDA : esHoraValida(texto) ? formatearHoraCampo(texto) : SIN_HORA}
      </Text>
    </View>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    gap: 6,
  },
  etiqueta: {
    ...TIPOGRAFIA.etiqueta,
    color: COLORES.texto,
  },
  campo: {
    backgroundColor: COLORES.fondoEntrada,
    borderWidth: 1,
    borderColor: COLORES.borde,
    borderRadius: RADIOS.accion,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...TIPOGRAFIA.valorCampo,
    color: COLORES.texto,
  },
  campoError: {
    borderColor: COLORES.error,
  },
  ayuda: {
    ...TIPOGRAFIA.leyenda,
    color: COLORES.textoAtenuado,
  },
  error: {
    ...TIPOGRAFIA.leyenda,
    color: COLORES.error,
  },
});
