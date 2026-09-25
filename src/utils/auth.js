let authStoreRef = null;

export const setAuthStoreRef = (store) => {
  authStoreRef = store;
};

export const isAdminUser = (user) => user?.is_admin === true;

export const getUserFromResponse = (data) => {
  const user = data?.user ?? data;
  return user && typeof user === "object" && !Array.isArray(user)
    ? user
    : null;
};

export const getPostLoginPath = (user, from) => {
  if (isAdminUser(user)) return "/admin";

  if (typeof from !== "string" || !from.startsWith("/") || from.startsWith("//")) {
    return "/";
  }

  const pathname = from.split(/[?#]/, 1)[0];
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return "/";
  }

  return from;
};

export const isAuthenticated = () => {
  try {
    return authStoreRef?.getState?.().isAuthenticated?.() ?? false;
  } catch {
    return false;
  }
};
