/**
 * Un logger simple que solo imprime en la consola en el entorno de desarrollo.
 * En producción, todas las llamadas a este logger no harán nada.
 */
const logger = {
  log: (...args) => {
    if (import.meta.env.DEV) {
      console.log(...args);
    }
  },
  warn: (...args) => {
    if (import.meta.env.DEV) {
      console.warn(...args);
    }
  },
  error: (...args) => {
    if (import.meta.env.DEV) {
      console.error(...args);
    }
  },
};

export default logger;
