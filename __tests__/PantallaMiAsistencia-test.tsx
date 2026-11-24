/**
 * @archivo PantallaMiAsistencia-test.tsx
 * @proyecto Civil Trace
 * @descripcion Pruebas de "Mi asistencia" del trabajador: QR, horario y estados, sin conexión y
 *   sin obra asignada; y del guardado del QR propio.
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos RF-19 Registrar asistencia propia, D-17
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001)
 */

// 1. Importaciones
import { NavigationContainer } from '@react-navigation/native';
import { render, screen } from '@testing-library/react-native';

import { ErrorSinConexion } from '@/conexion/clienteApi';
import PilaMiAsistencia from '@/navegacion/PilaMiAsistencia';
import { guardarQrPropio, leerQrPropio } from '@/servicios/local/servicioQrPropio';
import * as servicioAsistencia from '@/servicios/servicioAsistencia';
import * as servicioPerfil from '@/servicios/servicioPerfil';
import { RolUsuario, type SesionAutenticacion } from '@/tipos/autenticacion';
import type { MiDia } from '@/tipos/asistencia';

// 3. Constantes del módulo
jest.mock('react-native-qrcode-svg', () => {
  const { Text } = jest.requireActual('react-native');
  return function QrSimulado({ value }: { value: string }) {
    return <Text testID="qr">{value}</Text>;
  };
});
jest.mock('@/servicios/servicioAsistencia');
jest.mock('@/servicios/servicioPerfil');

const asistencia = jest.mocked(servicioAsistencia);
const perfil = jest.mocked(servicioPerfil);

const SESION: SesionAutenticacion = {
  token: 'tkn',
  tokenRefresco: 'ref',
  venceEn: Date.now() + 60_000,
  usuario: {
    id: 'ana',
    nombre: 'Ana Sánchez',
    correo: 'ana@ejemplo.com',
    rol: RolUsuario.TRABAJADOR,
    empresaId: 'e1',
  },
};

const MI_DIA: MiDia = {
  fecha: '2026-11-20',
  obras: [
    {
      obraId: 'hospital',
      obraNombre: 'Hospital',
      horaEntrada: '08:00',
      horaSalida: '16:00',
      esDiaLaborable: true,
      entrada: { estado: 'PENDIENTE', hora: null },
      salida: { estado: 'PENDIENTE', hora: null },
    },
  ],
};

const renderizar = () =>
  render(
    <NavigationContainer>
      <PilaMiAsistencia sesion={SESION} />
    </NavigationContainer>,
  );

// 4. Pruebas
describe('QR propio', () => {
  it('CP21-A17-APP guarda y lee el QR por usuario', async () => {
    await guardarQrPropio('ana', 'ct1.token-ana');

    expect(await leerQrPropio('ana')).toBe('ct1.token-ana');
    expect(await leerQrPropio('luis')).toBeNull();
  });
});

describe('Mi asistencia', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    perfil.obtenerPerfil.mockResolvedValue({
      nombre: 'Ana Sánchez',
      correo: 'ana@ejemplo.com',
      telefono: '',
      oficio: 'Albañil',
      tieneFoto: false,
    });
  });

  it('CP21-E1-APP muestra el QR, el horario de hoy y ambos estados en Pendiente', async () => {
    asistencia.obtenerMiCredencial.mockResolvedValue({ codigoQr: 'ct1.token-ana', creadaEn: '' });
    asistencia.obtenerMiDia.mockResolvedValue(MI_DIA);

    await renderizar();

    expect(await screen.findByTestId('qr')).toHaveTextContent('ct1.token-ana');
    expect(screen.getByText('8:00 am')).toBeTruthy();
    expect(screen.getByText('4:00 pm')).toBeTruthy();
    expect(screen.getAllByText('Pendiente')).toHaveLength(2);
    expect(screen.getByText('Ana Sánchez')).toBeTruthy();
    expect(screen.getByText('Albañil')).toBeTruthy();
  });

  it('CP21-A18-APP con la entrada registrada muestra "Registrada"', async () => {
    asistencia.obtenerMiCredencial.mockResolvedValue({ codigoQr: 'ct1.token-ana', creadaEn: '' });
    asistencia.obtenerMiDia.mockResolvedValue({
      ...MI_DIA,
      obras: [
        {
          ...MI_DIA.obras[0]!,
          entrada: { estado: 'REGISTRADA', hora: '2026-11-20T16:02:00.000Z' },
        },
      ],
    });

    await renderizar();

    expect(await screen.findByText('Registrada')).toBeTruthy();
  });

  it('CP21-A19-APP sin conexión muestra el QR guardado y el aviso', async () => {
    await guardarQrPropio('ana', 'ct1.guardado');
    asistencia.obtenerMiCredencial.mockRejectedValue(new ErrorSinConexion());
    asistencia.obtenerMiDia.mockRejectedValue(new ErrorSinConexion());
    perfil.obtenerPerfil.mockRejectedValue(new ErrorSinConexion());

    await renderizar();

    expect(await screen.findByTestId('qr')).toHaveTextContent('ct1.guardado');
    expect(
      await screen.findByText('Sin conexión: los estados pueden no estar actualizados.'),
    ).toBeTruthy();
  });

  it('CP21-A20-APP sin obras asignadas muestra el QR y el mensaje', async () => {
    asistencia.obtenerMiCredencial.mockResolvedValue({ codigoQr: 'ct1.token-ana', creadaEn: '' });
    asistencia.obtenerMiDia.mockResolvedValue({ fecha: '2026-11-20', obras: [] });

    await renderizar();

    expect(await screen.findByText('Todavía no tienes una obra asignada.')).toBeTruthy();
    expect(screen.getByTestId('qr')).toBeTruthy();
  });
});
