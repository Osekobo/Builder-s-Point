import * as zustand from "zustand";
import { create as _createCheck } from "zustand";

console.log("[zustand] namespace type:", typeof zustand);
console.log("[zustand] namespace value:", zustand);
console.log("[zustand] typeof create (named):", typeof _createCheck);
import { create } from "zustand";
import {
  login as loginApi,
  register as registerApi,
  logout as logoutApi,
  getMe,
} from "../api/auth";
import { log, logError } from "../utils/logger";
import { setAuthStoreRef } from "../utils/auth";

// Safely clean up legacy persisted auth state.
// Wrapped defensively because this module may be evaluated in non-browser contexts.
if (typeof window !== "undefined" && window.localStorage) {
  try {
    window.localStorage.removeItem("auth-storage");
  } catch {
    // ignore
  }
}

const getErrorMessage = (error, fallback) => {
  if (error?.response?.data?.detail) return error.response.data.detail;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
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
      if (error?.response?.status === 401) {
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

      const { default: useCartStore } = await import("./cartStore");
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

      const { default: useCartStore } = await import("./cartStore");
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

    try {
      const { default: useCartStore } = await import("./cartStore");
      useCartStore.getState().resetCart();
    } catch (error) {
      logError("Failed to reset cart during logout:", error);
    }

    set({ user: null, isLoading: false, error: null });
  },

  clearError: () => set({ error: null }),

  isAuthenticated: () => !!get().user,

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

// --- Register the store reference safely ---
// This MUST be defensive: if `setAuthStoreRef` is undefined due to a
// circular dependency in the production bundle, this call would otherwise
// throw "n is not a function" and crash the entire app at module load.
if (typeof setAuthStoreRef === "function") {
  setAuthStoreRef(useAuthStore);
} else if (typeof window !== "undefined") {
  logError(
    "[authStore] setAuthStoreRef is not a function — check for circular imports in utils/auth",
  );
}

if (typeof window !== "undefined") {
  window.addEventListener("auth:unauthorized", () => {
    useAuthStore.getState().logout();
  });
}

export default useAuthStore;