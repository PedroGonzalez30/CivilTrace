/**
 * @archivo SeccionPersonal.tsx
 * @proyecto Civil Trace
 * @descripcion Sección titulada (Supervisores o Trabajadores) con su lista de personas.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 19/11/2026
 * @version 1.0.0
 * @historial 25/11/2026 - Emilio Manuel Esquivel - onSeleccionar para abrir el desempeño (feature 005)
 */

// 1. Importaciones
import { StyleSheet, Text, View } from 'react-native';

import FilaPersona from '@/componentes/FilaPersona';
import { COLORES } from '@/constantes/colores';
import { TIPOGRAFIA } from '@/constantes/tema';
import type { PersonaEmpresa } from '@/tipos/personal';

// 2. Tipos e interfaces
interface SeccionPersonalProps {
  titulo: string;
  subtituloPersonas: string;
  textoVacio: string;
  personas: PersonaEmpresa[];
  onEliminar: (persona: PersonaEmpresa) => void;
  onSeleccionar?: (persona: PersonaEmpresa) => void;
}

// 4. Componente principal
export default function SeccionPersonal({
  titulo,
  subtituloPersonas,
  textoVacio,
  personas,
  onEliminar,
  onSeleccionar,
}: SeccionPersonalProps) {
  return (
    <View>
      <Text style={estilos.titulo}>{titulo}</Text>
      <View style={estilos.lista}>
        {personas.length === 0 ? (
          <Text style={estilos.vacio}>{textoVacio}</Text>
        ) : (
          personas.map((persona) => (
            <FilaPersona
              key={persona.id}
              nombre={persona.nombre}
              subtitulo={subtituloPersonas}
              onEliminar={() => onEliminar(persona)}
              onPresionar={onSeleccionar ? () => onSeleccionar(persona) : undefined}
            />
          ))
        )}
      </View>
    </View>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  titulo: {
    ...TIPOGRAFIA.titulo3,
    color: COLORES.texto,
  },
  lista: {
    gap: 12,
    marginTop: 10,
  },
  vacio: {
    ...TIPOGRAFIA.leyenda,
    color: COLORES.textoSutil,
  },
});
