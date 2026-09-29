const isDev = import.meta.env.DEV;

/**
 * Sistema centralizado de logs.
 * En producción (cuando import.meta.env.DEV es false), info y warn se silencian
 * automáticamente para no ensuciar la consola del cliente.
 */
export const logger = {
  info: (msg: string, data?: any) => {
    if (isDev) {
      if (data) console.info(`📘 [INFO]: ${msg}`, data);
      else console.info(`📘 [INFO]: ${msg}`);
    }
  },
  warn: (msg: string, data?: any) => {
    if (isDev) {
      if (data) console.warn(`📙 [WARN]: ${msg}`, data);
      else console.warn(`📙 [WARN]: ${msg}`);
    }
  },
  error: (msg: string, error?: any) => {
    // Los errores sí los mostramos en prod para debuggeo crítico,
    // pero idealmente aquí se conectaría a un servicio como Sentry.
    if (error) console.error(`📕 [ERROR]: ${msg}`, error);
    else console.error(`📕 [ERROR]: ${msg}`);
  },
  debug: (msg: string, data?: any) => {
    if (isDev) {
      if (data) console.debug(`🐛 [DEBUG]: ${msg}`, data);
      else console.debug(`🐛 [DEBUG]: ${msg}`);
    }
  }
};
