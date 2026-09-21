const isDev = import.meta.env.DEV;

export const log = (...args) => {
  if (isDev) console.log(...args);
};

export const logError = (...args) => {
  if (isDev) console.error(...args);
};

export const logWarn = (...args) => {
  if (isDev) console.warn(...args);
};
