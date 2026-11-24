/**
 * @archivo jest.configuracionPruebas.ts
 * @proyecto Civil Trace
 * @descripcion Configuración de Testing Library que necesita el entorno de pruebas ya cargado
 *   (se registra en setupFilesAfterEnv).
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos Constitución III (pruebas primero)
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001)
 */

// 1. Importaciones
import { configure } from '@testing-library/react-native';

// 4. Configuración
// En la primera corrida con cobertura la instrumentación vuelve lentas las pantallas; el límite
// de 1 s de findBy/waitFor provocaba fallas intermitentes.
configure({ asyncUtilTimeout: 5000 });
