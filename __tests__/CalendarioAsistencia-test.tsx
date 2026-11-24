/**
 * @archivo CalendarioAsistencia-test.tsx
 * @proyecto Civil Trace
 * @descripcion Pruebas del calendario de asistencia (colores, $ de descuento, cambio de mes) y
 *   del detalle del día (modificaciones con motivo).
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos RF-56 Mostrar días con descuento, RF-58 Mostrar calendario de asistencia, D-08,
 *   D-13
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001)
 */

// 1. Importaciones
import { fireEvent, render, screen } from '@testing-library/react-native';

import CalendarioAsistencia from '@/componentes/CalendarioAsistencia';
import HojaDetalleDia from '@/componentes/HojaDetalleDia';
import type { DetalleDia, DiaCalendario } from '@/tipos/asistencia';

// 3. Constantes del módulo
const dia = (fecha: string, sobrescribir: Partial<DiaCalendario>): DiaCalendario => ({
  fecha,
  obraId: 'hospital',
  color: 'VERDE',
  tipoJornada: 'COMPLETA',
  esFaltaCalculada: false,
  conDescuento: false,
  ...sobrescribir,
});

const DIAS: DiaCalendario[] = [
  dia('2026-05-13', { color: 'ROJO', tipoJornada: 'FALTA', esFaltaCalculada: true }),
  dia('2026-05-14', {}),
  dia('2026-05-15', {}),
  dia('2026-05-19', { color: 'NARANJA', tipoJornada: 'MEDIA_JORNADA', conDescuento: true }),
];

// 4. Pruebas
describe('CalendarioAsistencia', () => {
  it('CP19-A1-APP pinta los días con el color del servidor y $ en los de descuento', async () => {
    const onTocarDia = jest.fn();
    await render(
      <CalendarioAsistencia
        mes="2026-05"
        dias={DIAS}
        onCambiarMes={jest.fn()}
        onTocarDia={onTocarDia}
      />,
    );

    expect(screen.getByText('Mayo 2026')).toBeTruthy();
    expect(screen.getByLabelText('13 de mayo: Falta')).toBeTruthy();
    expect(screen.getByLabelText('14 de mayo: Completa')).toBeTruthy();
    expect(screen.getByLabelText('19 de mayo: Media jornada, con descuento')).toBeTruthy();
    // Uno en el día 19 y otro en la leyenda "$ Descuento".
    expect(screen.getAllByText('$')).toHaveLength(2);

    await fireEvent.press(screen.getByLabelText('19 de mayo: Media jornada, con descuento'));
    expect(onTocarDia).toHaveBeenCalledWith(expect.objectContaining({ fecha: '2026-05-19' }));
  });

  it('CP19-A7-APP las flechas cambian de mes', async () => {
    const onCambiarMes = jest.fn();
    await render(
      <CalendarioAsistencia
        mes="2026-05"
        dias={[]}
        onCambiarMes={onCambiarMes}
        onTocarDia={jest.fn()}
      />,
    );

    await fireEvent.press(screen.getByLabelText('Mes anterior'));
    await fireEvent.press(screen.getByLabelText('Mes siguiente'));

    expect(onCambiarMes.mock.calls).toEqual([['2026-04'], ['2026-06']]);
  });
});

describe('HojaDetalleDia', () => {
  it('CP19-A8-APP muestra el día con su efecto, $ y la modificación con su motivo', async () => {
    const detalle: DetalleDia = {
      fecha: '2026-05-19',
      trabajador: { id: 'ana', nombre: 'Emilio', oficio: 'Plomero' },
      obra: { id: 'hospital', nombre: 'Hospital' },
      entrada: {
        hora: '2026-05-19T15:00:00.000Z',
        sinConexion: false,
        latitud: null,
        longitud: null,
        registradaPor: 'Mario Castro',
      },
      salida: {
        hora: '2026-05-19T19:00:00.000Z',
        sinConexion: false,
        latitud: null,
        longitud: null,
        registradaPor: 'Mario Castro',
      },
      tipoJornada: 'MEDIA_JORNADA',
      esFaltaCalculada: false,
      motivo: 'CITA_MEDICA',
      efectoPago: 'MEDIO_DIA',
      conDescuento: true,
      anotacion: 'Salió a las 12:00 por cita en el IMSS; presentó comprobante.',
      registradoPor: 'Mario Castro',
      registradoEn: '2026-05-19T19:10:00.000Z',
      cambios: [
        {
          campo: 'entradaEn',
          valorAnterior: '2026-05-19T15:20:00.000Z',
          valorNuevo: '2026-05-19T15:00:00.000Z',
          motivo: 'olvidó registrarse',
          autor: 'Mario Castro',
          fecha: '2026-05-19T19:10:00.000Z',
        },
      ],
    };

    await render(
      <HojaDetalleDia detalle={detalle} zonaHoraria="America/Tijuana" onCerrar={jest.fn()} />,
    );

    expect(screen.getByText('Martes 19 de mayo')).toBeTruthy();
    expect(screen.getByText('Media jornada')).toBeTruthy();
    expect(screen.getByText('12:00 pm')).toBeTruthy();
    expect(screen.getByText('Cita médica')).toBeTruthy();
    expect(screen.getByText('Medio día de pago')).toBeTruthy();
    expect(screen.getByText('$')).toBeTruthy();
    expect(
      screen.getByText('Modificado: entrada original 8:20 am → 8:00 am (olvidó registrarse)'),
    ).toBeTruthy();
  });
});

describe('Resumen del mes', () => {
  it('CP19-A9-APP describe el mes como en el Figma', () => {
    const { describirResumen } = jest.requireActual(
      '@/pantallas/supervisor/PantallaCalendarioTrabajador',
    );
    expect(
      describirResumen({ faltas: 1, mediasJornadas: 1, retardos: 1, salidasTempranas: 0 }),
    ).toBe('1 falta · 1 media jornada · 1 retardo');
    expect(
      describirResumen({ faltas: 0, mediasJornadas: 0, retardos: 2, salidasTempranas: 0 }),
    ).toBe('2 retardos');
    expect(
      describirResumen({ faltas: 0, mediasJornadas: 0, retardos: 0, salidasTempranas: 0 }),
    ).toBe('Sin incidencias este mes');
  });
});
