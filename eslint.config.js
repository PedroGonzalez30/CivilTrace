/**
 * @archivo eslint.config.js
 * @proyecto Civil Trace
 * @descripcion Configuración de ESLint de la app: reglas de Expo, reglas automatizables del ECCT
 *   y compatibilidad con Prettier. Se ejecuta con `npm run lint`.
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos ECCT v1.0 (constitución, principio II)
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (módulo 00 de la app)
 */

// 1. Importaciones
const { defineConfig, globalIgnores } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');

// 4. Configuración principal
module.exports = defineConfig([
  globalIgnores(['dist/*', 'coverage/*', '.expo/*', 'android/*', 'ios/*']),
  expoConfig,
  // Prettier va antes de las reglas del ECCT: si va después, apaga 'curly'.
  prettierConfig,
  {
    rules: {
      // Reglas del ECCT que se pueden automatizar.
      'no-var': 'error',
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      // Carga de datos en useEffect es el patrón del proyecto (hooks use*); queda como aviso
      // y no como error (decisión T-12).
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
]);
