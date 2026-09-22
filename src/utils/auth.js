let authStoreRef = null;

export const setAuthStoreRef = (store) => {
  authStoreRef = store;
};

export const isAuthenticated = () => {
  try {
    return authStoreRef?.getState?.().isAuthenticated?.() ?? false;
  } catch {
    return false;
  }
};