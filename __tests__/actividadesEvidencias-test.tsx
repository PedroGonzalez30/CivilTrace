/**
 * @archivo actividadesEvidencias-test.tsx
 * @proyecto Civil Trace
 * @descripcion Pruebas del feature 003 en la app: servicio de actividades (crear, subir evidencia,
 *   revisar, mis actividades), validación, días restantes y pantallas del supervisor y del
 *   trabajador (agregar actividad, subir evidencia, revisar avance, mis actividades, actividad).
 * @autor Emilio Manuel Esquivel
 * @fecha 24/11/2026
 * @version 1.0.0
 * @requerimientos CP10–CP14 del plan de pruebas, D-10 (feature 003)
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Creación (feature 003)
 */

// 1. Importaciones
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as SelectorImagenes from 'expo-image-picker';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import * as clienteApi from '@/conexion/clienteApi';
import PantallaSubirEvidencia from '@/pantallas/comunes/PantallaSubirEvidencia';
import PantallaActividadesObra from '@/pantallas/dueno/PantallaActividadesObra';
import PantallaDetalleActividad from '@/pantallas/dueno/PantallaDetalleActividad';
import PantallaAgregarActividad from '@/pantallas/supervisor/PantallaAgregarActividad';
import PantallaRevisarAvance from '@/pantallas/supervisor/PantallaRevisarAvance';
import PantallaActividadTrabajador from '@/pantallas/trabajador/PantallaActividadTrabajador';
import PantallaMisActividades from '@/pantallas/trabajador/PantallaMisActividades';
import * as actividades from '@/servicios/servicioActividades';
import * as asistencia from '@/servicios/servicioAsistencia';
import type { ActividadDetalle, AvanceActividad, MiActividad } from '@/tipos/actividad';
import { RolUsuario, type SesionAutenticacion } from '@/tipos/autenticacion';
import { calcularTextoRestante } from '@/utilidades/diasRestantes';
import { validarActividad } from '@/utilidades/validacionActividad';

// 3. Constantes del módulo
jest.mock('@/conexion/configuracionApi', () => ({
  URL_API: 'https://api.prueba',
  TIEMPO_ESPERA_API_MS: 1000,
}));
// La foto real se descarga con fetch; en estas pruebas solo importa el resto de la pantalla.
jest.mock('@/componentes/ImagenEvidencia', () => {
  const { Text } = jest.requireActual('react-native');
  return ({ idAvance }: { idAvance: string }) => <Text>foto {idAvance}</Text>;
});
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(async () => ({ granted: true })),
}));

const SESION: SesionAutenticacion = {
  token: 'tkn',
  tokenRefresco: 'r',
  venceEn: Date.now() + 60_000,
  usuario: {
    id: 'ana',
    nombre: 'Ana Sánchez',
    correo: 'a@e.com',
    rol: RolUsuario.TRABAJADOR,
    empresaId: 'e1',
    empresa: 'Todo Concreto',
  },
};

const AVANCE: AvanceActividad = {
  id: 'av1',
  comentario: 'Ya quedó el piso',
  estado: 'PENDIENTE',
  fechaRegistro: '11/11/2026',
  registradoPor: 'Ana Sánchez',
  tieneFoto: true,
  tipo: 'TERMINADO',
  observacion: null,
  revisadoPor: null,
};

const ACTIVIDAD: ActividadDetalle = {
  id: 'act1',
  nombre: 'Poner piso',
  estado: 'ACTIVA',
  fechaEntrega: '13/10/2026',
  fechaTerminada: null,
  responsable: 'Ana Sánchez',
  supervisor: 'María Castro',
  descripcion: 'Colocar piso en el baño del segundo piso',
  fechaInicio: '02/10/2026',
  responsableId: 'ana',
  enRevision: true,
  bloqueada: false,
  avances: [
    { ...AVANCE, id: 'av0', estado: 'APROBADO', tipo: 'DIARIO', fechaRegistro: '10/11/2026' },
    AVANCE,
  ],
};

const Pila = createNativeStackNavigator();
const enPila = (elemento: ReactElement) => (
  <SafeAreaProvider
    initialMetrics={{
      frame: { x: 0, y: 0, width: 390, height: 844 },
      insets: { top: 0, left: 0, right: 0, bottom: 0 },
    }}
  >
    <NavigationContainer>
      <Pila.Navigator>
        <Pila.Screen name="Prueba">{() => elemento}</Pila.Screen>
      </Pila.Navigator>
    </NavigationContainer>
  </SafeAreaProvider>
);

// 4. Pruebas
afterEach(() => jest.restoreAllMocks());

describe('Servicio de actividades (feature 003)', () => {
  it('CP10-A10-APP crear actividad envía fechas ISO y la descripción', async () => {
    const llamar = jest
      .spyOn(clienteApi, 'llamarApi')
      .mockResolvedValue({ actividad: { ...ACTIVIDAD, fechaEntrega: '2026-10-27', avances: [] } });

    await actividades.crearActividad('tkn', 'o1', {
      nombre: ' Colocar loseta ',
      responsableId: 'ana',
      descripcion: ' En el baño ',
      fechaInicio: '02/10/2026',
      fechaEntrega: '27/10/2026',
    });

    expect(llamar).toHaveBeenCalledWith('/obras/o1/actividades', {
      metodo: 'POST',
      tokenAcceso: 'tkn',
      cuerpo: {
        nombre: 'Colocar loseta',
        descripcion: 'En el baño',
        responsableId: 'ana',
        fechaEntrega: '2026-10-27',
        fechaInicio: '2026-10-02',
      },
    });
  });

  it('CP12-A10-APP subir evidencia manda la foto con el tipo y el comentario', async () => {
    globalThis.fetch = jest.fn(async () => ({ blob: async () => 'blob' })) as never;
    const llamar = jest.spyOn(clienteApi, 'llamarApi').mockResolvedValue({
      avance: { ...AVANCE, fechaRegistro: '2026-11-11T18:00:00.000Z' },
    });

    const avance = await actividades.subirEvidencia('tkn', 'o1', 'act1', {
      uri: 'file:///foto.jpg',
      tipoImagen: 'image/jpeg',
      tipo: 'TERMINADO',
      comentario: ' Terminé ',
    });

    expect(llamar).toHaveBeenCalledWith(
      '/obras/o1/actividades/act1/avances',
      expect.objectContaining({
        metodo: 'POST',
        cuerpoBinario: { datos: 'blob', tipo: 'image/jpeg' },
        encabezados: { 'x-tipo-avance': 'TERMINADO', 'x-comentario-avance': 'Termin%C3%A9' },
      }),
    );
    expect(avance).toMatchObject({ estado: 'PENDIENTE', tipo: 'TERMINADO' });
  });

  it('CP12-A11-APP si no se puede leer la foto avisa sin llamar a la API', async () => {
    globalThis.fetch = jest.fn(async () => {
      throw new Error('sin archivo');
    }) as never;
    const llamar = jest.spyOn(clienteApi, 'llamarApi');
    await expect(
      actividades.subirEvidencia('tkn', 'o1', 'act1', {
        uri: 'file:///x',
        tipoImagen: 'image/jpeg',
        tipo: 'DIARIO',
        comentario: '',
      }),
    ).rejects.toThrow('No se pudo leer la foto seleccionada');
    expect(llamar).not.toHaveBeenCalled();
  });

  it('CP14-A10-APP revisar manda la decisión y la observación', async () => {
    const llamar = jest.spyOn(clienteApi, 'llamarApi').mockResolvedValue({
      avance: { ...AVANCE, estado: 'RECHAZADO', fechaRegistro: '2026-11-11T18:00:00.000Z' },
      actividad: { ...ACTIVIDAD, fechaEntrega: '2026-10-13', avances: [] },
    });

    const resultado = await actividades.revisarAvance(
      'tkn',
      'o1',
      'act1',
      'av1',
      'RECHAZAR',
      ' Desnivel ',
    );

    expect(llamar).toHaveBeenCalledWith('/obras/o1/actividades/act1/avances/av1/revision', {
      metodo: 'PATCH',
      tokenAcceso: 'tkn',
      cuerpo: { decision: 'RECHAZAR', observacion: 'Desnivel' },
    });
    expect(resultado.avance.estado).toBe('RECHAZADO');
  });

  it('CP11-A10-APP mis actividades trae el nombre de la obra y los campos nuevos', async () => {
    jest.spyOn(clienteApi, 'llamarApi').mockResolvedValue({
      actividades: [
        {
          id: 'act1',
          nombre: 'Colocar loseta',
          estado: 'ACTIVA',
          fechaEntrega: '2026-10-18',
          fechaInicio: null,
          descripcion: 'Baño',
          responsable: 'Ana',
          responsableId: 'ana',
          supervisor: 'María',
          enRevision: true,
          obraId: 'o1',
          obraNombre: 'Hospital',
        },
      ],
    });

    expect(await actividades.obtenerMisActividades('tkn')).toEqual([
      expect.objectContaining({
        fechaEntrega: '18/10/2026',
        obraId: 'o1',
        obraNombre: 'Hospital',
        descripcion: 'Baño',
        enRevision: true,
      }),
    ]);
  });
});

describe('Utilidades', () => {
  it('CP10-A11-APP validar actividad pide responsable y fechas coherentes', () => {
    expect(
      validarActividad({
        nombre: 'X',
        responsableId: '',
        descripcion: '',
        fechaInicio: '30/10/2026',
        fechaEntrega: '27/10/2026',
      }),
    ).toEqual({
      nombre: 'Mínimo 2 caracteres',
      responsableId: 'Selecciona al responsable',
      fechaInicio: 'No puede ser posterior a la fecha de fin',
    });
    expect(
      validarActividad({
        nombre: 'Pintar',
        responsableId: 'ana',
        descripcion: '',
        fechaInicio: '',
        fechaEntrega: '27/10/2026',
      }),
    ).toEqual({});
  });

  it('CP11-A11-APP días restantes como en el Figma', () => {
    const hoy = new Date(2026, 9, 12);
    expect(calcularTextoRestante('18/10/2026', hoy).texto).toBe('6 días restantes');
    expect(calcularTextoRestante('13/10/2026', hoy).texto).toBe('1 día restante');
    expect(calcularTextoRestante('12/10/2026', hoy).texto).toBe('Vence hoy');
    expect(calcularTextoRestante('10/10/2026', hoy)).toEqual({
      texto: 'Vencida hace 2 días',
      esVencida: true,
    });
  });
});

describe('Pantallas del supervisor', () => {
  it('CP10-A12-APP agregar actividad valida, usa los trabajadores de la obra y guarda', async () => {
    jest.spyOn(asistencia, 'obtenerResumenDia').mockResolvedValue({
      fecha: '2026-10-01',
      horario: null,
      estadoEntrada: 'PENDIENTE',
      estadoSalida: 'PENDIENTE',
      trabajadores: [
        {
          id: 'ana',
          nombre: 'Ana Sánchez',
          oficio: null,
          entrada: null,
          salida: null,
          tipoJornada: null,
        },
      ],
    });
    const crear = jest.spyOn(actividades, 'crearActividad').mockResolvedValue(ACTIVIDAD);
    const onAgregada = jest.fn();
    await render(
      enPila(
        <PantallaAgregarActividad
          tokenAcceso="tkn"
          idObra="o1"
          obraNombre="Hospital"
          onRegresar={jest.fn()}
          onAgregada={onAgregada}
        />,
      ),
    );

    expect(screen.getByText('Agregar actividad para Hospital')).toBeTruthy();
    await fireEvent.press(screen.getByText('Agregar'));
    expect(screen.getByText('Selecciona al responsable')).toBeTruthy();
    expect(crear).not.toHaveBeenCalled();

    await fireEvent.changeText(screen.getByPlaceholderText('Colocar loseta'), 'Colocar loseta');
    await fireEvent.press(screen.getByText('Elige a un trabajador'));
    await fireEvent.press(await screen.findByText('Ana Sánchez'));
    await fireEvent.changeText(screen.getByPlaceholderText('27/10/2026'), '27102026');
    await fireEvent.press(screen.getByText('Agregar'));

    await waitFor(() =>
      expect(crear).toHaveBeenCalledWith(
        'tkn',
        'o1',
        expect.objectContaining({ responsableId: 'ana', fechaEntrega: '27/10/2026' }),
      ),
    );
    expect(onAgregada).toHaveBeenCalled();
  });

  it('CP14-A11-APP rechazar sin motivo no se envía; con motivo muestra la confirmación', async () => {
    jest.spyOn(actividades, 'obtenerDetalleActividad').mockResolvedValue(ACTIVIDAD);
    const revisar = jest.spyOn(actividades, 'revisarAvance').mockResolvedValue({
      avance: {
        ...AVANCE,
        estado: 'RECHAZADO',
        observacion: 'El piso tiene desniveles',
        revisadoPor: 'María Castro',
      },
      actividad: { ...ACTIVIDAD, enRevision: false },
    });
    await render(
      enPila(
        <PantallaRevisarAvance
          tokenAcceso="tkn"
          idObra="o1"
          idActividad="act1"
          idAvance="av1"
          onRegresar={jest.fn()}
          onTerminar={jest.fn()}
        />,
      ),
    );

    expect(await screen.findByLabelText('Pendiente de aprobación')).toBeTruthy();
    expect(screen.getByText('Anterior · 10/11/2026')).toBeTruthy();
    await fireEvent.press(screen.getByText('Rechazar'));
    expect(screen.getByText('Indica el motivo del rechazo')).toBeTruthy();
    expect(revisar).not.toHaveBeenCalled();

    await fireEvent.changeText(
      screen.getByPlaceholderText('Escribe tus comentarios sobre el avance...'),
      'El piso tiene desniveles',
    );
    await fireEvent.press(screen.getByText('Rechazar'));

    expect(await screen.findByText('Actividad rechazada')).toBeTruthy();
    expect(screen.getByText('Motivo del rechazo')).toBeTruthy();
    expect(screen.getByText('Rechazado por María Castro')).toBeTruthy();
  });

  it('CP14-A12-APP aprobar muestra "Actividad aprobada"', async () => {
    jest.spyOn(actividades, 'obtenerDetalleActividad').mockResolvedValue(ACTIVIDAD);
    jest.spyOn(actividades, 'revisarAvance').mockResolvedValue({
      avance: { ...AVANCE, estado: 'APROBADO', revisadoPor: 'María Castro' },
      actividad: { ...ACTIVIDAD, estado: 'TERMINADA', enRevision: false },
    });
    const onTerminar = jest.fn();
    await render(
      enPila(
        <PantallaRevisarAvance
          tokenAcceso="tkn"
          idObra="o1"
          idActividad="act1"
          idAvance="av1"
          onRegresar={jest.fn()}
          onTerminar={onTerminar}
        />,
      ),
    );

    await fireEvent.press(await screen.findByText('Aprobar'));
    expect(await screen.findByText('Actividad aprobada')).toBeTruthy();
    await fireEvent.press(screen.getByText('Continuar'));
    expect(onTerminar).toHaveBeenCalled();
  });

  it('CP14-A13-APP el detalle muestra el estado de cada evidencia y "Revisar" en la pendiente', async () => {
    jest.spyOn(actividades, 'obtenerDetalleActividad').mockResolvedValue({
      ...ACTIVIDAD,
      avances: [
        ...ACTIVIDAD.avances,
        { ...AVANCE, id: 'av2', estado: 'RECHAZADO', observacion: 'Falta resanar' },
      ],
    });
    const onRevisar = jest.fn();
    const onSubir = jest.fn();
    await render(
      enPila(
        <PantallaDetalleActividad
          tokenAcceso="tkn"
          idObra="o1"
          idActividad="act1"
          onRegresar={jest.fn()}
          onRevisarAvance={onRevisar}
          onSubirEvidencia={onSubir}
        />,
      ),
    );

    expect(await screen.findByText('Motivo: Falta resanar')).toBeTruthy();
    expect(screen.getAllByText('Pendiente')).toHaveLength(1);
    await fireEvent.press(screen.getByText('Revisar'));
    expect(onRevisar).toHaveBeenCalledWith('av1');
    await fireEvent.press(screen.getByLabelText('Subir evidencia'));
    expect(onSubir).toHaveBeenCalledWith('Poner piso');
  });

  it('CP11-A12-APP actividades sin registros invita a agregar y el "+" abre el formulario', async () => {
    jest.spyOn(actividades, 'obtenerActividadesObra').mockResolvedValue([]);
    const onAgregar = jest.fn();
    await render(
      enPila(
        <PantallaActividadesObra
          tokenAcceso="tkn"
          idObra="o1"
          onRegresar={jest.fn()}
          onAbrirActividad={jest.fn()}
          onAgregar={onAgregar}
        />,
      ),
    );

    expect(await screen.findByText('No hay actividades por realizar')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Agregar actividad'));
    expect(onAgregar).toHaveBeenCalled();
  });
});

describe('Pantallas del trabajador y subir evidencia', () => {
  const MIA: MiActividad = { ...ACTIVIDAD, obraId: 'o1', obraNombre: 'Hospital' };

  it('CP11-A13-APP mis actividades muestra la obra, la revisión y el "+"', async () => {
    jest.spyOn(actividades, 'obtenerMisActividades').mockResolvedValue([MIA]);
    const onSubir = jest.fn();
    const onAbrir = jest.fn();
    await render(
      enPila(
        <PantallaMisActividades
          sesion={SESION}
          onAbrirActividad={onAbrir}
          onSubirEvidencia={onSubir}
        />,
      ),
    );

    expect(await screen.findByText('Poner piso')).toBeTruthy();
    expect(screen.getByText('Todo Concreto')).toBeTruthy();
    expect(screen.getByText('Hospital')).toBeTruthy();
    expect(screen.getByText('Entrega en revisión')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Subir evidencia de Poner piso'));
    expect(onSubir).toHaveBeenCalledWith(MIA);
    await fireEvent.press(screen.getByText('Poner piso'));
    expect(onAbrir).toHaveBeenCalledWith(MIA);
  });

  it('CP12-A12-APP la actividad muestra instrucción, aviso, rechazo y sus evidencias', async () => {
    jest.spyOn(actividades, 'obtenerDetalleActividad').mockResolvedValue({
      ...ACTIVIDAD,
      enRevision: false,
      avances: [{ ...AVANCE, estado: 'RECHAZADO', observacion: 'Corrige la nivelación' }],
    });
    const onSubir = jest.fn();
    await render(
      enPila(
        <PantallaActividadTrabajador
          tokenAcceso="tkn"
          idObra="o1"
          idActividad="act1"
          evidenciaAgregada
          onRegresar={jest.fn()}
          onSubirEvidencia={onSubir}
        />,
      ),
    );

    expect(await screen.findByText('Colocar piso en el baño del segundo piso')).toBeTruthy();
    expect(screen.getByText('Evidencia agregada correctamente')).toBeTruthy();
    expect(screen.getByText('El supervisor rechazó tu evidencia')).toBeTruthy();
    expect(screen.getByText('Corrige la nivelación')).toBeTruthy();
    expect(screen.getByText('Rechazada')).toBeTruthy();
    await fireEvent.press(screen.getByText('Subir evidencia fotográfica'));
    expect(onSubir).toHaveBeenCalledWith('Poner piso');
  });

  it('CP12-A13-APP subir evidencia pide foto, permite "Terminado" y envía', async () => {
    jest.mocked(SelectorImagenes.launchImageLibraryAsync).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///foto.jpg', mimeType: 'image/jpeg', width: 1, height: 1 }],
    } as never);
    const subir = jest.spyOn(actividades, 'subirEvidencia').mockResolvedValue(AVANCE);
    const onSubida = jest.fn();
    await render(
      enPila(
        <PantallaSubirEvidencia
          tokenAcceso="tkn"
          idObra="o1"
          idActividad="act1"
          nombreActividad="Poner piso"
          onCancelar={jest.fn()}
          onSubida={onSubida}
        />,
      ),
    );

    // "Subir evidencia" es también el título de la tarjeta; el botón es el último.
    await fireEvent.press(screen.getAllByText('Subir evidencia').at(-1)!);
    expect(screen.getByText('Toma o elige una foto de la evidencia')).toBeTruthy();

    await fireEvent.press(screen.getByText('Galería'));
    expect(await screen.findByLabelText('Foto de la evidencia')).toBeTruthy();
    await fireEvent.press(screen.getByText('Terminado'));
    await fireEvent.changeText(
      screen.getByPlaceholderText('Describe el avance de hoy...'),
      'Listo',
    );
    // "Subir evidencia" es también el título de la tarjeta; el botón es el último.
    await fireEvent.press(screen.getAllByText('Subir evidencia').at(-1)!);

    await waitFor(() =>
      expect(subir).toHaveBeenCalledWith('tkn', 'o1', 'act1', {
        uri: 'file:///foto.jpg',
        tipoImagen: 'image/jpeg',
        tipo: 'TERMINADO',
        comentario: 'Listo',
      }),
    );
    expect(onSubida).toHaveBeenCalledWith(AVANCE);
  });

  it('CP12-A14-APP sin permiso de cámara lo explica', async () => {
    jest
      .mocked(SelectorImagenes.requestCameraPermissionsAsync)
      .mockResolvedValueOnce({ granted: false } as never);
    await render(
      enPila(
        <PantallaSubirEvidencia
          tokenAcceso="tkn"
          idObra="o1"
          idActividad="act1"
          nombreActividad="Poner piso"
          onCancelar={jest.fn()}
          onSubida={jest.fn()}
        />,
      ),
    );

    await fireEvent.press(screen.getByText('Tomar foto'));
    expect(
      await screen.findByText('Permite el acceso a la cámara para tomar la foto'),
    ).toBeTruthy();
  });
});
