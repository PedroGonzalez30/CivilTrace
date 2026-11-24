/**
 * @archivo serviciosHttpAsistencia-test.ts
 * @proyecto Civil Trace
 * @descripcion Pruebas de que los servicios HTTP de asistencia llaman a las rutas y métodos del
 *   contrato de la API, y de la descarga del paquete de la obra con fotos y registros del día.
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos RF-19, RF-27, RF-56, RF-58, RF-60, RNF-07 (contrato asistencia-api.md)
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001)
 */

// 1. Importaciones
import { File } from 'expo-file-system';

import * as clienteApi from '@/conexion/clienteApi';
import { establecerRepositorioLocal } from '@/servicios/local/repositorioLocal';
import {
  actualizarPaquete,
  buscarPorQr,
  calcularHuellaQr,
} from '@/servicios/local/servicioPaqueteObra';
import * as asistencia from '@/servicios/servicioAsistencia';
import { obtenerCalendario } from '@/servicios/servicioCalendario';
import { editarDetalleDia, obtenerDetalleDia } from '@/servicios/servicioDetallesAsistencia';
import { guardarHorario, obtenerHorario } from '@/servicios/servicioHorario';
import { RolUsuario, type SesionAutenticacion } from '@/tipos/autenticacion';

import { crearRepositorioEnMemoria } from './dobles/repositorioEnMemoria';

// 3. Constantes del módulo
jest.mock('@/conexion/configuracionApi', () => ({
  URL_API: 'https://api.prueba',
  TIEMPO_ESPERA_API_MS: 1000,
}));
const llamarApi = jest.spyOn(clienteApi, 'llamarApi');

// 4. Pruebas
describe('Servicios HTTP de asistencia (contrato)', () => {
  beforeEach(() => llamarApi.mockReset());

  it('CP21-A34-APP usan las rutas y métodos del contrato', async () => {
    llamarApi.mockResolvedValue({ obras: [], resultados: [] });

    await asistencia.obtenerMiCredencial('t');
    await asistencia.obtenerMiDia('t');
    await asistencia.listarMisObras('t');
    await asistencia.obtenerPaquete('t', 'o1');
    await asistencia.pedirVistaPrevia('t', 'o1', 'ct1.x');
    await asistencia.enviarEscaneos('t', []);
    await asistencia.obtenerResumenDia('t', 'o1');
    await asistencia.obtenerResumenDia('t', 'o1', '2026-11-19');
    await obtenerHorario('t', 'o1');
    await guardarHorario('t', 'o1', {
      horaEntrada: '08:00',
      horaSalida: '16:00',
      toleranciaMinutos: 15,
      diasLaborales: [1],
      alcance: 'SOLO_HOY',
    });
    await obtenerDetalleDia('t', 'o1', 'a1', '2026-11-20');
    await editarDetalleDia('t', 'o1', 'a1', '2026-11-20', { anotacion: 'x' });
    await obtenerCalendario('t', 'a1', '2026-05');
    await obtenerCalendario('t', 'a1', '2026-05', 'o1');

    const llamadas = llamarApi.mock.calls.map(
      ([ruta, opciones]) => `${opciones?.metodo ?? 'GET'} ${ruta}`,
    );
    expect(llamadas).toEqual([
      'GET /asistencia/mi-credencial',
      'GET /asistencia/mi-dia',
      'GET /asistencia/mis-obras',
      'GET /obras/o1/asistencia/paquete-sin-conexion',
      'POST /obras/o1/asistencia/vista-previa',
      'POST /asistencia/registros',
      'GET /obras/o1/asistencia',
      'GET /obras/o1/asistencia?fecha=2026-11-19',
      'GET /obras/o1/horario',
      'PUT /obras/o1/horario',
      'GET /obras/o1/asistencia/trabajadores/a1/dias/2026-11-20',
      'PATCH /obras/o1/asistencia/trabajadores/a1/dias/2026-11-20',
      'GET /asistencia/trabajadores/a1/calendario?mes=2026-05',
      'GET /asistencia/trabajadores/a1/calendario?mes=2026-05&obraId=o1',
    ]);
  });
});

describe('Paquete de la obra', () => {
  const SESION: SesionAutenticacion = {
    token: 'tkn',
    tokenRefresco: 'r',
    venceEn: Date.now() + 60_000,
    usuario: {
      id: 'maria',
      nombre: 'María',
      correo: 'm@e.com',
      rol: RolUsuario.SUPERVISOR,
      empresaId: 'e1',
    },
  };

  it('CP21-A35-APP guarda trabajadores, fotos locales y registros del día; busca por huella', async () => {
    const repo = crearRepositorioEnMemoria();
    establecerRepositorioLocal(repo);
    const huella = await calcularHuellaQr('token-ana');
    jest.spyOn(asistencia, 'obtenerPaquete').mockResolvedValue({
      generadoEn: '2026-11-20T15:45:00.000Z',
      zonaHoraria: 'America/Tijuana',
      horario: { general: null, excepcionHoy: null },
      trabajadores: [
        {
          id: 'ana',
          nombre: 'Ana',
          oficio: 'Albañil',
          fotoUrl: '/obras/o1/asistencia/trabajadores/ana/foto',
          huellaCredencial: huella,
          faltasMes: 0,
        },
        {
          id: 'luis',
          nombre: 'Luis',
          oficio: null,
          fotoUrl: null,
          huellaCredencial: null,
          faltasMes: 2,
        },
      ],
    });
    jest.spyOn(asistencia, 'obtenerResumenDia').mockResolvedValue({
      fecha: '2026-11-20',
      horario: null,
      estadoEntrada: 'PENDIENTE',
      estadoSalida: 'PENDIENTE',
      trabajadores: [
        {
          id: 'ana',
          nombre: 'Ana',
          oficio: null,
          entrada: '2026-11-20T16:02:00.000Z',
          salida: null,
          tipoJornada: 'COMPLETA',
        },
      ],
    });

    await actualizarPaquete(SESION, 'o1');

    expect(File.createDownloadTask).toHaveBeenCalledWith(
      'https://api.prueba/obras/o1/asistencia/trabajadores/ana/foto',
      expect.anything(),
      { headers: { Authorization: 'Bearer tkn' } },
    );
    const trabajadores = await repo.listarTrabajadoresPaquete('o1');
    expect(trabajadores.find((t) => t.trabajadorId === 'ana')?.fotoLocal).toContain(
      '/asistencia/fotos/o1/ana',
    );
    expect(trabajadores.find((t) => t.trabajadorId === 'luis')?.fotoLocal).toBeNull();
    expect(await repo.obtenerRegistroDia('o1', 'ana', '2026-11-20')).toMatchObject({
      tieneEntrada: true,
      tieneSalida: false,
    });
    expect((await buscarPorQr('o1', 'ct1.token-ana'))?.trabajadorId).toBe('ana');
    expect(await buscarPorQr('o1', 'sin-prefijo')).toBeNull();
  });
});
