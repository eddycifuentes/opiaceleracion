// Logger centralizado de la aplicación.
// console.* se usa exclusivamente dentro de este archivo.
// info y warn solo imprimen en desarrollo (import.meta.env.DEV);
// error siempre imprime.

export const Logger = {
  info: (msg: string) => {
    if (import.meta.env.DEV) {
      console.log(`[INFO] ${msg}`);
    }
  },
  warn: (msg: string) => {
    if (import.meta.env.DEV) {
      console.warn(`[WARN] ${msg}`);
    }
  },
  error: (msg: string) => {
    console.error(`[ERROR] ${msg}`);
  },
};
