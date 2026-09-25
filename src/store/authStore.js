import { create } from "zustand";
import {
  login as loginApi,
  register as registerApi,
  logout as logoutApi,
  getMe,
} from "../api/auth";
import { log, logError } from "../utils/logger";
import {
  getUserFromResponse,
  isAdminUser,
  setAuthStoreRef,
} from "../utils/auth";

if (typeof window !== "undefined" && window.localStorage) {
  try {
    window.localStorage.removeItem("auth-storage");
  } catch {
    logError("Failed to remove legacy auth state:", new Error("storage unavailable"));
  }
}

const getErrorMessage = (error, fallback) => {
  if (error?.response?.data?.detail) return error.response.data.detail;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  return fallback;
};

let sessionRequest = null;
let authGeneration = 0;

const requestSession = () => {
  if (sessionRequest) return sessionRequest;

  const request = getMe()
    .then(({ data }) => {
      const user = getUserFromResponse(data);
      if (!user) throw new Error("Invalid user session response");
      return user;
    })
    .finally(() => {
      if (sessionRequest === request) sessionRequest = null;
    });

  sessionRequest = request;
  return request;
};

const useAuthStore = create((set, get) => ({
  user: null,
  isLoading: false,
  isSessionLoading: false,
  sessionLoaded: false,
  error: null,

  checkSession: async () => {
    if (get().sessionLoaded) return get().user;
    if (sessionRequest) return sessionRequest;

    const generation = authGeneration;
    set({ isSessionLoading: true });

    try {
      const user = await requestSession();
      if (generation !== authGeneration) return null;

      set({
        user,
        isSessionLoading: false,
        sessionLoaded: true,
        error: null,
      });
      return user;
    } catch (error) {
      if (generation !== authGeneration) return null;

      if (error?.response?.status !== 401) {
        logError("Session check failed:", error);
      }

      set({
        user: null,
        isSessionLoading: false,
        sessionLoaded: true,
        error: null,
      });
      return null;
    }
  },

  refreshSession: async () => {
    const generation = authGeneration;
    set({ isSessionLoading: true });

    try {
      const user = await requestSession();
      if (generation !== authGeneration) return null;

      set({
        user,
        isSessionLoading: false,
        sessionLoaded: true,
        error: null,
      });
      return user;
    } catch (error) {
      if (generation !== authGeneration) return null;

      if (error?.response?.status !== 401) {
        logError("Session refresh failed:", error);
      }

      set({
        user: null,
        isSessionLoading: false,
        sessionLoaded: true,
        error: null,
      });
      return null;
    }
  },

  login: async (email, password) => {
    const generation = ++authGeneration;
    sessionRequest = null;
    set({ isLoading: true, isSessionLoading: false, error: null });

    try {
      await loginApi({ email, password });
      const user = await requestSession();

      if (generation !== authGeneration) {
        return { success: false, error: "Login cancelled" };
      }

      set({
        user,
        isLoading: false,
        error: null,
        sessionLoaded: true,
        isSessionLoading: false,
      });

      try {
        const { default: useCartStore } = await import("./cartStore");
        await useCartStore.getState().mergeGuestCartToServer();
      } catch (error) {
        logError("Cart merge after login failed:", error);
      }

      return { success: true, user };
    } catch (error) {
      if (generation !== authGeneration) {
        return { success: false, error: "Login cancelled" };
      }

      logError("Login error details:", error);
      const errorMessage = getErrorMessage(error, "Login failed");
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  register: async (userData) => {
    const generation = ++authGeneration;
    sessionRequest = null;
    set({ isLoading: true, isSessionLoading: false, error: null });

    try {
      log("Registering user:", { ...userData, password: "***" });
      await registerApi(userData);
      await loginApi({
        email: userData.email,
        password: userData.password,
      });

      const user = await requestSession();
      if (generation !== authGeneration) {
        return { success: false, error: "Registration cancelled" };
      }

      set({
        user,
        isLoading: false,
        error: null,
        sessionLoaded: true,
        isSessionLoading: false,
      });

      try {
        const { default: useCartStore } = await import("./cartStore");
        await useCartStore.getState().mergeGuestCartToServer();
      } catch (error) {
        logError("Cart merge after registration failed:", error);
      }

      return { success: true, user };
    } catch (error) {
      if (generation !== authGeneration) {
        return { success: false, error: "Registration cancelled" };
      }

      logError("Registration error:", error);
      const errorMessage = getErrorMessage(error, "Registration failed");
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  clearAuth: () => {
    authGeneration += 1;
    sessionRequest = null;
    set({
      user: null,
      isLoading: false,
      isSessionLoading: false,
      sessionLoaded: true,
      error: null,
    });
  },

  logout: async () => {
    get().clearAuth();

    try {
      await logoutApi();
    } catch (error) {
      logError("Logout error:", error);
    }

    try {
      const { default: useCartStore } = await import("./cartStore");
      useCartStore.getState().resetCart();
    } catch (error) {
      logError("Failed to reset cart during logout:", error);
    }
  },

  clearError: () => set({ error: null }),

  isAuthenticated: () => !!get().user,

  getUserPhone: () => {
    const { user } = get();
    return user?.phone || "";
  },

  isAdmin: () => isAdminUser(get().user),

  updateUser: (updates) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    }));
  },
}));

setAuthStoreRef(useAuthStore);

if (typeof window !== "undefined") {
  window.addEventListener("auth:unauthorized", () => {
    useAuthStore.getState().clearAuth();
  });
}

export default useAuthStore;
