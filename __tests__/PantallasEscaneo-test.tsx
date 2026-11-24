/**
 * @archivo PantallasEscaneo-test.tsx
 * @proyecto Civil Trace
 * @descripcion Pruebas de render de la lectura de QR (avisos de sincronización, permiso de
 *   cámara, resumen) y de la confirmación del escaneo (datos, Rechazar, Aceptar, rechazo).
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos RF-27 Registrar asistencia por el supervisor, RNF-07 Captura sin conexión
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001)
 */

// 1. Importaciones
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import * as useLecturaQrModulo from '@/hooks/useLecturaQr';
import PantallaConfirmarQr from '@/pantallas/supervisor/PantallaConfirmarQr';
import PantallaLeerQr from '@/pantallas/supervisor/PantallaLeerQr';
import * as servicioEscaneo from '@/servicios/local/servicioEscaneo';
import { RolUsuario, type SesionAutenticacion } from '@/tipos/autenticacion';

// 3. Constantes del módulo
const permisoCamara = { granted: true };
jest.mock('expo-camera', () => {
  const { View } = jest.requireActual('react-native');
  return {
    CameraView: (props: object) => <View testID="camara" {...props} />,
    useCameraPermissions: () => [permisoCamara, jest.fn()],
  };
});
jest.mock('@/hooks/useLecturaQr');
jest.mock('@/servicios/local/servicioEscaneo');
jest.mock('@/servicios/local/servicioUbicacion', () => ({
  obtenerUbicacionRapida: jest.fn(async () => ({ latitud: 32.6245, longitud: -115.4523 })),
}));

const SESION: SesionAutenticacion = {
  token: 'tkn',
  tokenRefresco: 'ref',
  venceEn: Date.now() + 60_000,
  usuario: {
    id: 'maria',
    nombre: 'María',
    correo: 'm@e.com',
    rol: RolUsuario.SUPERVISOR,
    empresaId: 'e1',
  },
};
const Pila = createNativeStackNavigator();
const enPila = (elemento: ReactElement) => (
  <NavigationContainer>
    <Pila.Navigator>
      <Pila.Screen name="Prueba">{() => elemento}</Pila.Screen>
    </Pila.Navigator>
  </NavigationContainer>
);

function simularLectura(sobrescribir: Partial<useLecturaQrModulo.EstadoLecturaQr> = {}) {
  jest.mocked(useLecturaQrModulo.useLecturaQr).mockReturnValue({
    resumen: {
      fecha: '2026-11-20',
      horario: {
        fecha: '2026-11-20',
        horaEntrada: '08:00',
        horaSalida: '16:00',
        toleranciaMinutos: 15,
        esDiaLaborable: true,
        esExcepcion: false,
      },
      estadoEntrada: 'FINALIZADO',
      estadoSalida: 'PENDIENTE',
      trabajadores: [
        {
          id: 'ana',
          nombre: 'Ana Sánchez',
          oficio: null,
          entrada: '2026-11-20T16:02:00.000Z',
          salida: null,
          tipoJornada: 'COMPLETA',
        },
        {
          id: 'luis',
          nombre: 'Luis Pérez',
          oficio: null,
          entrada: null,
          salida: null,
          tipoJornada: null,
        },
      ],
    },
    zonaHoraria: 'America/Tijuana',
    generadoEn: '2026-11-20T15:45:00.000Z',
    sinConexion: false,
    pendientes: 0,
    rechazados: 0,
    cargando: false,
    error: null,
    recargar: jest.fn(async () => undefined),
    ...sobrescribir,
  });
}

// 4. Pruebas
describe('PantallaLeerQr', () => {
  const props = {
    sesion: SESION,
    obraId: 'hospital',
    obraNombre: 'Hospital',
    onEscaneado: jest.fn(),
    onEditarHorario: jest.fn(),
    onVerRechazados: jest.fn(),
    onVerCalendario: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    permisoCamara.granted = true;
  });

  it('CP21-A29-APP muestra horario, cámara y el resumen con la hora de entrada', async () => {
    simularLectura();
    await render(enPila(<PantallaLeerQr {...props} />));

    expect(screen.getByText('Hospital')).toBeTruthy();
    expect(screen.getByText('Finalizado')).toBeTruthy();
    expect(screen.getByTestId('camara')).toBeTruthy();
    expect(screen.getByText('Entrada 8:02 am')).toBeTruthy();
    expect(screen.getByText('Sin registrar')).toBeTruthy();
    await fireEvent.press(screen.getByText('Editar horario de la obra'));
    expect(props.onEditarHorario).toHaveBeenCalled();
  });

  it('CP21-A30-APP sin conexión avisa los pendientes y los rechazados', async () => {
    simularLectura({ sinConexion: true, pendientes: 3, rechazados: 1 });
    await render(enPila(<PantallaLeerQr {...props} />));

    expect(screen.getByText(/Sin conexión · 3 registros pendientes de envío/)).toBeTruthy();
    await fireEvent.press(screen.getByText('1 registro no se guardó'));
    expect(props.onVerRechazados).toHaveBeenCalled();
  });

  it('CP21-A31-APP sin permiso de cámara explica para qué es y ofrece darlo', async () => {
    permisoCamara.granted = false;
    simularLectura();
    await render(enPila(<PantallaLeerQr {...props} />));

    expect(screen.queryByTestId('camara')).toBeNull();
    expect(screen.getByText('Permitir cámara')).toBeTruthy();
  });
});

describe('PantallaConfirmarQr', () => {
  const escaneo = jest.mocked(servicioEscaneo);

  beforeEach(() => jest.clearAllMocks());

  it('CP21-A32-APP muestra los datos y "Aceptar" guarda el escaneo', async () => {
    const preparado = {
      ok: true as const,
      obraId: 'hospital',
      codigoQr: 'ct1.x',
      tipo: 'ENTRADA' as const,
      hora: '2026-11-20T16:02:00.000Z',
      sinConexion: false,
      zonaHoraria: 'America/Tijuana',
      trabajador: { id: 'ana', nombre: 'Ana Sánchez', oficio: 'Albañil', foto: null, faltasMes: 0 },
    };
    escaneo.prepararEscaneo.mockResolvedValue(preparado);
    escaneo.aceptarEscaneo.mockResolvedValue(undefined);
    const onTerminar = jest.fn();

    await render(
      enPila(
        <PantallaConfirmarQr
          sesion={SESION}
          obraId="hospital"
          codigoQr="ct1.x"
          onTerminar={onTerminar}
        />,
      ),
    );

    expect(await screen.findByText('Hora de entrada')).toBeTruthy();
    expect(screen.getByText('8:02 am')).toBeTruthy();
    expect(await screen.findByText('32.6245, -115.4523')).toBeTruthy();
    expect(screen.getByText('Sin faltas este mes')).toBeTruthy();
    await fireEvent.press(screen.getByText('Aceptar'));
    expect(escaneo.aceptarEscaneo).toHaveBeenCalledWith(SESION, preparado, {
      latitud: 32.6245,
      longitud: -115.4523,
    });
    expect(onTerminar).toHaveBeenCalled();
  });

  it('CP21-A33-APP "Rechazar" no guarda y un QR inválido muestra el motivo', async () => {
    escaneo.prepararEscaneo.mockResolvedValueOnce({
      ok: false,
      mensaje: 'El trabajador no está asignado a esta obra',
    });
    const onTerminar = jest.fn();

    await render(
      enPila(
        <PantallaConfirmarQr
          sesion={SESION}
          obraId="hospital"
          codigoQr="ct1.x"
          onTerminar={onTerminar}
        />,
      ),
    );

    expect(await screen.findByText('El trabajador no está asignado a esta obra')).toBeTruthy();
    await fireEvent.press(screen.getByText('Volver a escanear'));
    expect(onTerminar).toHaveBeenCalled();
    expect(escaneo.aceptarEscaneo).not.toHaveBeenCalled();
  });
});
