/**
 * @archivo hooksYPantallasAsistencia-test.tsx
 * @proyecto Civil Trace
 * @descripcion Pruebas de useLecturaQr (con y sin conexión), useCalendario, escoger obra,
 *   rechazados e historial del trabajador.
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos RF-27, RF-56, RF-58, RNF-07 (D-14, D-16)
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001)
 */

// 1. Importaciones
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { ErrorSinConexion } from '@/conexion/clienteApi';
import { useCalendario } from '@/hooks/useCalendario';
import { useLecturaQr } from '@/hooks/useLecturaQr';
import PantallaEscogerObra from '@/pantallas/supervisor/PantallaEscogerObra';
import PantallaRechazados from '@/pantallas/supervisor/PantallaRechazados';
import PantallaHistorialAsistencia from '@/pantallas/trabajador/PantallaHistorialAsistencia';
import { establecerRepositorioLocal } from '@/servicios/local/repositorioLocal';
import * as paquete from '@/servicios/local/servicioPaqueteObra';
import * as asistencia from '@/servicios/servicioAsistencia';
import * as calendario from '@/servicios/servicioCalendario';
import * as detalles from '@/servicios/servicioDetallesAsistencia';
import { RolUsuario, type SesionAutenticacion } from '@/tipos/autenticacion';
import type { CalendarioMes } from '@/tipos/asistencia';

import { crearRepositorioEnMemoria } from './dobles/repositorioEnMemoria';

// 3. Constantes del módulo
const SESION: SesionAutenticacion = {
  token: 'tkn',
  tokenRefresco: 'r',
  venceEn: Date.now() + 60_000,
  usuario: {
    id: 'maria',
    nombre: 'María Castro',
    correo: 'm@e.com',
    rol: RolUsuario.SUPERVISOR,
    empresaId: 'e1',
    empresa: 'Todo Concreto',
  },
};
const CALENDARIO: CalendarioMes = {
  mes: '2026-05',
  trabajador: { id: 'ana', nombre: 'Ana', oficio: 'Albañil' },
  resumen: { faltas: 1, mediasJornadas: 0, retardos: 0, salidasTempranas: 0 },
  dias: [
    {
      fecha: '2026-05-13',
      obraId: 'o1',
      color: 'ROJO',
      tipoJornada: 'FALTA',
      esFaltaCalculada: true,
      conDescuento: false,
    },
  ],
};
const Pila = createNativeStackNavigator();
const enPila = (elemento: ReactElement) => (
  <NavigationContainer>
    <Pila.Navigator>
      <Pila.Screen name="Prueba">{() => elemento}</Pila.Screen>
    </Pila.Navigator>
  </NavigationContainer>
);

async function repoConPaquete() {
  const repo = crearRepositorioEnMemoria();
  establecerRepositorioLocal(repo);
  await repo.guardarPaquete(
    {
      obraId: 'o1',
      usuarioId: 'maria',
      zonaHoraria: 'America/Tijuana',
      horario: {
        general: {
          horaEntrada: '08:00',
          horaSalida: '16:00',
          toleranciaMinutos: 15,
          diasLaborales: [0, 1, 2, 3, 4, 5, 6],
          actualizadoEn: '',
        },
        excepcionHoy: null,
      },
      generadoEn: '2026-11-20T15:45:00.000Z',
    },
    [
      {
        obraId: 'o1',
        trabajadorId: 'ana',
        nombre: 'Ana',
        oficio: null,
        huellaCredencial: 'h',
        fotoLocal: null,
        faltasMes: 0,
      },
    ],
  );
  await repo.guardarEscaneo({
    idLocal: 'x',
    usuarioId: 'maria',
    obraId: 'o1',
    codigoQr: 'ct1.h',
    trabajadorId: 'ana',
    trabajadorNombre: 'Ana',
    tipo: 'ENTRADA',
    capturadoEn: '2026-11-20T16:00:00.000Z',
    sinConexion: true,
    latitud: null,
    longitud: null,
    estado: 'RECHAZADO',
    motivo: 'NO_ASIGNADO',
    mensaje: 'El trabajador no está asignado a esta obra',
  });
  return repo;
}

// 4. Pruebas
describe('useLecturaQr', () => {
  afterEach(() => jest.restoreAllMocks());

  it('CP21-A36-APP con conexión usa el servidor', async () => {
    await repoConPaquete();
    jest.spyOn(paquete, 'actualizarPaquete').mockResolvedValue({
      paquete: {
        generadoEn: 'g',
        zonaHoraria: 'America/Mexico_City',
        horario: { general: null, excepcionHoy: null },
        trabajadores: [],
      },
      resumen: {
        fecha: '2026-11-20',
        horario: null,
        estadoEntrada: 'PENDIENTE',
        estadoSalida: 'PENDIENTE',
        trabajadores: [],
      },
    });
    const { result } = await renderHook(() => useLecturaQr(SESION, 'o1'));

    await act(() => result.current.recargar());

    expect(result.current).toMatchObject({
      sinConexion: false,
      zonaHoraria: 'America/Mexico_City',
      rechazados: 1,
    });
  });

  it('CP21-A37-APP sin conexión arma el resumen con lo guardado', async () => {
    await repoConPaquete();
    jest.spyOn(paquete, 'actualizarPaquete').mockRejectedValue(new ErrorSinConexion());
    const { result } = await renderHook(() => useLecturaQr(SESION, 'o1'));

    await act(() => result.current.recargar());

    expect(result.current.sinConexion).toBe(true);
    expect(result.current.resumen?.trabajadores).toEqual([
      expect.objectContaining({ id: 'ana', nombre: 'Ana' }),
    ]);
    expect(result.current.resumen?.horario).toMatchObject({
      horaEntrada: '08:00',
      esDiaLaborable: true,
    });
  });
});

describe('useCalendario', () => {
  it('CP19-A10-APP carga el mes, cambia de mes y abre el detalle', async () => {
    const obtener = jest.spyOn(calendario, 'obtenerCalendario').mockResolvedValue(CALENDARIO);
    jest.spyOn(detalles, 'obtenerDetalleDia').mockResolvedValue({ fecha: '2026-05-13' } as never);
    const { result } = await renderHook(() => useCalendario('tkn', 'ana', '2026-05', 'o1'));

    await waitFor(() => expect(result.current.calendario).toEqual(CALENDARIO));
    await act(() => result.current.abrirDia(CALENDARIO.dias[0]!));
    expect(result.current.detalle).toEqual({ fecha: '2026-05-13' });
    await act(async () => result.current.cambiarMes('2026-06'));
    await waitFor(() => expect(obtener).toHaveBeenLastCalledWith('tkn', 'ana', '2026-06', 'o1'));
  });
});

describe('Pantallas', () => {
  afterEach(() => jest.restoreAllMocks());

  it('CP21-A38-APP escoger obra lista las obras y avisa al elegir', async () => {
    jest.spyOn(asistencia, 'listarMisObras').mockResolvedValue([
      {
        id: 'o1',
        nombre: 'Hospital',
        descripcion: 'Hospital general',
        direccion: 'Av. Reforma',
        fechaInicio: '2026-10-12',
        fechaFinal: '2028-10-12',
      },
    ]);
    const onElegirObra = jest.fn();
    await render(enPila(<PantallaEscogerObra sesion={SESION} onElegirObra={onElegirObra} />));

    expect(await screen.findByText('Bienvenido a Todo Concreto')).toBeTruthy();
    expect(screen.getByText('12/10/2026')).toBeTruthy();
    await fireEvent.press(screen.getByText('Hospital'));
    expect(onElegirObra).toHaveBeenCalledWith(expect.objectContaining({ id: 'o1' }));
  });

  it('CP21-A39-APP rechazados muestra el motivo y permite descartar', async () => {
    const repo = await repoConPaquete();
    await render(<PantallaRechazados sesion={SESION} obraId="o1" onRegresar={jest.fn()} />);

    expect(await screen.findByText('El trabajador no está asignado a esta obra')).toBeTruthy();
    await fireEvent.press(screen.getByText('Descartar'));
    await waitFor(async () => expect(await repo.listarRechazados('maria')).toHaveLength(0));
  });

  it('CP19-A11-APP el historial muestra la alerta solo con al menos una falta (D-16)', async () => {
    jest.spyOn(calendario, 'obtenerCalendario').mockResolvedValueOnce(CALENDARIO);
    const { unmount } = await render(
      <PantallaHistorialAsistencia sesion={SESION} onRegresar={jest.fn()} />,
    );
    expect(await screen.findByText('Tienes 1 falta este mes')).toBeTruthy();
    unmount();

    jest.spyOn(calendario, 'obtenerCalendario').mockResolvedValueOnce({
      ...CALENDARIO,
      resumen: { ...CALENDARIO.resumen, faltas: 0 },
      dias: [],
    });
    await render(<PantallaHistorialAsistencia sesion={SESION} onRegresar={jest.fn()} />);
    await waitFor(() => expect(screen.queryByText(/falta este mes/)).toBeNull());
    expect(
      screen.queryByText('Recuerda que 3 faltas injustificadas pueden ser motivo de despido.'),
    ).toBeNull();
  });
});
