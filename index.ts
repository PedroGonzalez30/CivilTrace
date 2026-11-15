/**
 * @archivo index.ts
 * @proyecto Civil Trace
 * @descripcion Punto de entrada de la aplicación: registra el componente raíz en Expo.
 * @autor POR_COMPLETAR
 * @fecha POR_COMPLETAR
 * @version 1.0.0
 */

import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent llama a AppRegistry.registerComponent('main', () => App).
// También garantiza que, tanto en Expo Go como en un build nativo, el entorno
// quede configurado correctamente.
registerRootComponent(App);
