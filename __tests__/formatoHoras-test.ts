/**
 * @archivo formatoHoras-test.ts
 * @proyecto Civil Trace
 * @descripcion Pruebas del formato de horas y fechas de asistencia (12 horas, zona de la empresa).
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos RF-58 Mostrar calendario de asistencia, D-06
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001)
 */

// 1. Importaciones
import {
  formatearFechaLarga,
  formatearHora12,
  formatearInstante,
  obtenerFechaLocal,
  sumarMinutosAHora,
} from '@/utilidades/formatoHoras';

// 4. Pruebas
describe('formatoHoras', () => {
  it('CP22-A2-APP convierte HH:MM a 12 horas como en el Figma', () => {
    expect(formatearHora12('08:00')).toBe('8:00 am');
    expect(formatearHora12('16:00')).toBe('4:00 pm');
    expect(formatearHora12('12:00')).toBe('12:00 pm');
    expect(formatearHora12('00:30')).toBe('12:30 am');
  });

  it('CP22-A3-APP calcula el límite de retardo con la tolerancia', () => {
    expect(sumarMinutosAHora('08:00', 15)).toBe('08:15');
    expect(sumarMinutosAHora('07:50', 20)).toBe('08:10');
  });

  it('CP21-A6-APP formatea un instante en la zona de la empresa', () => {
    expect(formatearInstante('2026-11-20T16:02:00.000Z', 'America/Tijuana')).toBe('8:02 am');
    expect(formatearInstante('2026-05-19T19:00:00.000Z', 'America/Tijuana')).toBe('12:00 pm');
    expect(formatearInstante('2026-11-20T14:02:00.000Z', 'America/Mexico_City')).toBe('8:02 am');
  });

  it('CP19-A2-APP obtiene la fecha local y la fecha larga del detalle del día', () => {
    expect(obtenerFechaLocal(new Date('2026-11-20T07:30:00Z'), 'America/Tijuana')).toBe(
      '2026-11-19',
    );
    expect(formatearFechaLarga('2026-05-19')).toBe('Martes 19 de mayo');
  });
});
