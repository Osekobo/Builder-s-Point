import { create } from "zustand";
import {
  login as loginApi,
  register as registerApi,
  logout as logoutApi,
  getMe,
} from "../api/auth";
import { log, logError } from "../utils/logger";
import { setAuthStoreRef } from "../utils/auth";

try {
  localStorage.removeItem("auth-storage");
} catch (e) {
  void e;
}

const getErrorMessage = (error, fallback) => {
  if (error.response?.data?.detail) return error.response.data.detail;
  if (error.response?.data?.message) return error.response.data.message;
  if (error.message) return error.message;
  return fallback;
};

const useAuthStore = create((set, get) => ({
  user: null,
  isLoading: false,
  sessionLoaded: false,
  error: null,

  checkSession: async () => {
    if (get().sessionLoaded) return;
    try {
      const { data: user } = await getMe();
      set({ user, sessionLoaded: true });
    } catch (error) {
      if (error.response?.status === 401) {
        set({ user: null, sessionLoaded: true });
        return;
      }
      logError("Session check failed:", error);
      set({ user: null, sessionLoaded: true });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      await loginApi({ email, password });
      const { data: user } = await getMe();

      set({ user, isLoading: false, error: null, sessionLoaded: true });

      const useCartStore = (await import("./cartStore")).default;
      await useCartStore.getState().mergeGuestCartToServer();

      return { success: true, user };
    } catch (error) {
      logError("Login error details:", error);

      const errorMessage = getErrorMessage(error, "Login failed");
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      log("📝 Registering user:", { ...userData, password: "***" });

      await registerApi(userData);
      log("✅ Registration successful");

      await loginApi({
        email: userData.email,
        password: userData.password,
      });

      const { data: user } = await getMe();

      set({
        user,
        isLoading: false,
        error: null,
        sessionLoaded: true,
      });

      const useCartStore = (await import("./cartStore")).default;
      await useCartStore.getState().mergeGuestCartToServer();

      return { success: true, user };
    } catch (error) {
      logError("❌ Registration error:", error);

      const errorMessage = getErrorMessage(error, "Registration failed");
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  logout: async () => {
    try {
      await logoutApi();
    } catch (error) {
      logError("Logout error:", error);
    }

    const useCartStore = (await import("./cartStore")).default;
    useCartStore.getState().resetCart();

    set({ user: null, isLoading: false, error: null });
  },

  clearError: () => set({ error: null }),

  isAuthenticated: () => {
    return !!get().user;
  },

  getUserPhone: () => {
    const { user } = get();
    return user?.phone || "";
  },

  isAdmin: () => {
    const { user } = get();
    return user?.is_admin === true;
  },

  updateUser: (updates) => {
    set((state) => ({
      user: { ...state.user, ...updates },
    }));
  },
}));

if (typeof window !== "undefined") {
  window.addEventListener("auth:unauthorized", () => {
    useAuthStore.getState().logout();
  });
}

setAuthStoreRef(useAuthStore);

export default useAuthStore;