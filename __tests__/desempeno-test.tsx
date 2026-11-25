/**
 * @archivo desempeno-test.tsx
 * @proyecto Civil Trace
 * @descripcion Pruebas del feature 005 en la app: servicio de desempeño, pantalla Desempeño con
 *   sus tarjetas y periodos, y los accesos desde Personal (dueño) y desde Asistencia (supervisor).
 * @autor Emilio Manuel Esquivel
 * @fecha 25/11/2026
 * @version 1.0.0
 * @requerimientos RF-64 Mostrar métricas de desempeño (SRS V4.0; D-30)
 * @historial 25/11/2026 - Emilio Manuel Esquivel - Creación (feature 005)
 */

// 1. Importaciones
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import * as clienteApi from '@/conexion/clienteApi';
import PantallaDesempeno from '@/pantallas/comunes/PantallaDesempeno';
import PantallaPersonal from '@/pantallas/dueno/PantallaPersonal';
import PantallaPersonalObra from '@/pantallas/supervisor/PantallaPersonalObra';
import * as servicioAsistencia from '@/servicios/servicioAsistencia';
import * as servicioDesempeno from '@/servicios/servicioDesempeno';
import * as servicioEmpresa from '@/servicios/servicioEmpresa';
import type { Desempeno } from '@/tipos/desempeno';

// 3. Constantes del módulo
jest.mock('@/conexion/configuracionApi', () => ({
  URL_API: 'https://api.prueba',
  TIEMPO_ESPERA_API_MS: 1000,
}));

const DESEMPENO: Desempeno = {
  trabajador: { id: 'ana', nombre: 'Ana Sánchez', oficio: 'Plomero' },
  periodo: { tipo: 'MES', desde: '2026-11-01', hasta: '2026-11-25' },
  asistencia: {
    porcentaje: 92,
    completos: 22,
    total: 24,
    retardos: 1,
    mediasJornadas: 0,
    salidasTempranas: 0,
    faltas: 1,
  },
  evidencias: { porcentaje: 90, aprobadas: 18, rechazadas: 2, pendientes: 0 },
  actividadesEntregadas: { total: 14, antes: 9, mismoDia: 3, conRetraso: 2 },
  actividadesAprobadas: { porcentaje: null, aprobadas: 0, rechazadas: 0 },
};

const MEDIDAS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};
const conAreaSegura = (elemento: ReactElement) => (
  <SafeAreaProvider initialMetrics={MEDIDAS}>{elemento}</SafeAreaProvider>
);

// 4. Pruebas
afterEach(() => jest.restoreAllMocks());

describe('Desempeño del trabajador (feature 005)', () => {
  it('CP20-E1-APP el servicio pide el periodo y rechaza respuestas incompletas', async () => {
    const llamar = jest.spyOn(clienteApi, 'llamarApi').mockResolvedValue(DESEMPENO);

    await expect(servicioDesempeno.obtenerDesempeno('tkn', 'ana', 'SEMANA')).resolves.toEqual(
      DESEMPENO,
    );
    expect(llamar).toHaveBeenCalledWith('/asistencia/trabajadores/ana/desempeno?periodo=SEMANA', {
      tokenAcceso: 'tkn',
    });

    llamar.mockResolvedValue({ trabajador: {} });
    await expect(servicioDesempeno.obtenerDesempeno('tkn', 'ana', 'MES')).rejects.toThrow(
      'El servidor envió una respuesta inesperada',
    );
  });

  it('CP20-E2-APP muestra las cuatro tarjetas como en el Figma y cambia de periodo', async () => {
    const obtener = jest.spyOn(servicioDesempeno, 'obtenerDesempeno').mockResolvedValue(DESEMPENO);

    await render(
      conAreaSegura(
        <PantallaDesempeno
          tokenAcceso="tkn"
          trabajadorId="ana"
          contexto="Hospital"
          onRegresar={jest.fn()}
        />,
      ),
    );

    expect(await screen.findByText('Ana Sánchez')).toBeTruthy();
    expect(screen.getByText('Plomero · Hospital')).toBeTruthy();
    expect(screen.getByText('92%')).toBeTruthy();
    expect(
      screen.getByText('22 de 24 días completos · 1 retardo o media jornada · 1 falta'),
    ).toBeTruthy();
    expect(screen.getByText('90%')).toBeTruthy();
    expect(screen.getByText('9 antes de la fecha')).toBeTruthy();
    expect(screen.getByText('Sin datos')).toBeTruthy();

    await fireEvent.press(screen.getByText('Semana'));
    await waitFor(() => expect(obtener).toHaveBeenLastCalledWith('tkn', 'ana', 'SEMANA'));
  });

  it('CP20-A1-APP si falla muestra el error y permite reintentar', async () => {
    const obtener = jest
      .spyOn(servicioDesempeno, 'obtenerDesempeno')
      .mockRejectedValueOnce(new clienteApi.ErrorApi('No tienes permiso', 403))
      .mockResolvedValueOnce(DESEMPENO);

    await render(
      conAreaSegura(
        <PantallaDesempeno tokenAcceso="tkn" trabajadorId="ana" onRegresar={jest.fn()} />,
      ),
    );

    expect(await screen.findByText('No tienes permiso')).toBeTruthy();
    await fireEvent.press(screen.getByText('Reintentar'));
    expect(await screen.findByText('92%')).toBeTruthy();
    expect(obtener).toHaveBeenCalledTimes(2);
  });

  it('CP20-A2-APP el dueño toca a un trabajador en Personal y ve su desempeño', async () => {
    jest.spyOn(servicioEmpresa, 'obtenerPersonalEmpresa').mockResolvedValue({
      supervisores: [{ id: 'maria', nombre: 'María Castro', rol: 'SUPERVISOR' }],
      trabajadores: [{ id: 'ana', nombre: 'Ana Sánchez', rol: 'TRABAJADOR' }],
    } as never);
    jest.spyOn(servicioDesempeno, 'obtenerDesempeno').mockResolvedValue(DESEMPENO);

    await render(conAreaSegura(<PantallaPersonal tokenAcceso="tkn" />));

    await fireEvent.press(await screen.findByLabelText('Ver desempeño de Ana Sánchez'));
    expect(await screen.findByText('Desempeño')).toBeTruthy();
    expect(screen.queryByLabelText('Ver desempeño de María Castro')).toBeNull();
    await fireEvent.press(screen.getByLabelText('Regresar'));
    expect(await screen.findByText('María Castro')).toBeTruthy();
  });

  it('CP20-A3-APP el supervisor ve el personal de la obra y elige a un trabajador', async () => {
    jest.spyOn(servicioAsistencia, 'obtenerResumenDia').mockResolvedValue({
      trabajadores: [
        {
          id: 'ana',
          nombre: 'Ana Sánchez',
          oficio: 'Plomero',
          entrada: null,
          salida: null,
          tipoJornada: null,
        },
      ],
    } as never);
    const onElegir = jest.fn();

    await render(
      conAreaSegura(
        <PantallaPersonalObra
          tokenAcceso="tkn"
          obraId="obra1"
          obraNombre="Hospital"
          onElegir={onElegir}
          onRegresar={jest.fn()}
        />,
      ),
    );

    await fireEvent.press(await screen.findByLabelText('Ver desempeño de Ana Sánchez'));
    expect(onElegir).toHaveBeenCalledWith(expect.objectContaining({ id: 'ana' }));
  });
});
