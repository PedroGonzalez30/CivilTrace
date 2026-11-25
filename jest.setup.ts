/**
 * @archivo jest.setup.ts
 * @proyecto Civil Trace
 * @descripcion Dobles de los módulos nativos de Expo para las pruebas: Secure Store en memoria,
 *   red, ubicación, archivos y SQLite simulados, y crypto con la implementación de Node para que la
 *   huella SHA-256 sea la misma que calcula la API.
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos Constitución III (pruebas primero), RNF-07 Captura sin conexión
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (módulo 00 de la app)
 */

// 4. Dobles
jest.mock('expo-secure-store', () => {
  const almacen = new Map<string, string>();
  return {
    getItemAsync: jest.fn(async (clave: string) => almacen.get(clave) ?? null),
    setItemAsync: jest.fn(async (clave: string, valor: string) => {
      almacen.set(clave, valor);
    }),
    deleteItemAsync: jest.fn(async (clave: string) => {
      almacen.delete(clave);
    }),
  };
});

jest.mock('expo-crypto', () => {
  const nodeCrypto = jest.requireActual('crypto');
  return {
    CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
    CryptoEncoding: { HEX: 'hex', BASE64: 'base64' },
    digestStringAsync: jest.fn(async (_algoritmo: string, texto: string) =>
      nodeCrypto.createHash('sha256').update(texto, 'utf8').digest('hex'),
    ),
    randomUUID: jest.fn(() => nodeCrypto.randomUUID()),
    getRandomBytes: jest.fn((cantidad: number) => new Uint8Array(nodeCrypto.randomBytes(cantidad))),
  };
});

jest.mock('expo-network', () => ({
  useNetworkState: jest.fn(() => ({ isConnected: true, isInternetReachable: true })),
  getNetworkStateAsync: jest.fn(async () => ({ isConnected: true, isInternetReachable: true })),
  addNetworkStateListener: jest.fn(() => ({ remove: jest.fn() })),
}));

jest.mock('expo-location', () => ({
  Accuracy: { Balanced: 3 },
  requestForegroundPermissionsAsync: jest.fn(async () => ({ granted: true, status: 'granted' })),
  getForegroundPermissionsAsync: jest.fn(async () => ({ granted: true, status: 'granted' })),
  getCurrentPositionAsync: jest.fn(async () => ({
    coords: { latitude: 32.6245, longitude: -115.4523 },
  })),
  getLastKnownPositionAsync: jest.fn(async () => null),
}));

jest.mock('expo-file-system', () => {
  class DirectorioSimulado {
    readonly uri: string;
    constructor(...partes: (string | { uri: string })[]) {
      this.uri = partes.map((parte) => (typeof parte === 'string' ? parte : parte.uri)).join('/');
    }
    create() {}
    delete() {}
    get exists() {
      return true;
    }
  }
  class ArchivoSimulado extends DirectorioSimulado {
    static createDownloadTask = jest.fn((_url: string, destino: ArchivoSimulado) => ({
      downloadAsync: jest.fn(async () => destino),
    }));
    // Feature 004: descarga del reporte y del acta de una entrega.
    static downloadFileAsync = jest.fn(async (_url: string, destino: ArchivoSimulado) => destino);
  }
  return {
    Paths: { document: { uri: 'file:///documentos' }, cache: { uri: 'file:///cache' } },
    File: ArchivoSimulado,
    Directory: DirectorioSimulado,
  };
});

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(async () => {
    throw new Error('Las pruebas usan el repositorio en memoria, no SQLite');
  }),
}));
