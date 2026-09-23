import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  addToCart as addToCartApi,
  getCart,
  removeFromCart as removeFromCartApi,
  updateQuantity as updateQuantityApi,
} from "../api/cart";
import { logError, logWarn } from "../utils/logger";

let authStorePromise = null;

const getAuthStore = async () => {
  if (!authStorePromise) {
    // Use a consistent relative path — matches the sibling file location.
    authStorePromise = import("./authStore").catch((err) => {
      // Reset the cached promise on failure so future calls can retry.
      authStorePromise = null;
      throw err;
    });
  }
  const mod = await authStorePromise;
  return mod.default;
};

const isAuthenticated = async () => {
  try {
    const useAuthStore = await getAuthStore();
    return useAuthStore.getState().isAuthenticated();
  } catch {
    return false;
  }
};

const computeTotal = (items) =>
  items.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0,
  );

const isGuestItem = (item) => item?.isGuest === true;

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      isLoading: false,

      fetchCart: async () => {
        if (!(await isAuthenticated())) {
          return;
        }

        set({ isLoading: true });
        try {
          const response = await getCart();
          const items = response.data;
          set({ items, total: computeTotal(items), isLoading: false });
        } catch (error) {
          logError("Failed to fetch cart:", error);
          set({ isLoading: false, items: [], total: 0 });
        }
      },

      addToCart: async (productId, quantity = 1) => {
        if (!(await isAuthenticated())) {
          logWarn("addToCart requires a session; use addGuestItem for guests");
          return { success: false };
        }

        try {
          await addToCartApi(productId, quantity);
          await get().fetchCart();
          return { success: true };
        } catch (error) {
          logError("Failed to add to cart:", error);
          return { success: false };
        }
      },

      addGuestItem: (product, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => isGuestItem(item) && item.product_id === product.id,
          );
          const items = existingItem
            ? state.items.map((item) =>
                isGuestItem(item) && item.product_id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item,
              )
            : [
                ...state.items,
                {
                  id: `guest-${product.id}`,
                  product_id: product.id,
                  product,
                  quantity,
                  isGuest: true,
                },
              ];
          return { items, total: computeTotal(items) };
        });
      },

      removeFromCart: async (cartItemId) => {
        const item = get().items.find((it) => it.id === cartItemId);
        if (isGuestItem(item)) {
          set((state) => {
            const items = state.items.filter((it) => it.id !== cartItemId);
            return { items, total: computeTotal(items) };
          });
          return { success: true };
        }
        try {
          await removeFromCartApi(cartItemId);
          await get().fetchCart();
          return { success: true };
        } catch (error) {
          logError("Failed to remove from cart:", error);
          return { success: false };
        }
      },

      updateQuantity: async (cartItemId, quantity) => {
        const item = get().items.find((it) => it.id === cartItemId);
        if (isGuestItem(item)) {
          const newQuantity = Math.max(1, quantity);
          set((state) => {
            const items = state.items.map((it) =>
              it.id === cartItemId ? { ...it, quantity: newQuantity } : it,
            );
            return { items, total: computeTotal(items) };
          });
          return { success: true };
        }
        try {
          await updateQuantityApi(cartItemId, quantity);
          await get().fetchCart();
          return { success: true };
        } catch (error) {
          logError("Failed to update quantity:", error);
          return { success: false };
        }
      },

      clearCart: async () => {
        const items = get().items;
        try {
          await Promise.all(
            items
              .filter((item) => !isGuestItem(item))
              .map((item) => removeFromCartApi(item.id)),
          );
        } catch (error) {
          logError("Failed to clear cart on server:", error);
        }
        set({ items: [], total: 0 });
      },

      mergeGuestCartToServer: async () => {
        if (!(await isAuthenticated())) return;

        const guestItems = get().items.filter((item) => isGuestItem(item));

        try {
          if (guestItems.length > 0) {
            await Promise.all(
              guestItems.map((item) =>
                addToCartApi(item.product_id, item.quantity),
              ),
            );
          }
          await get().fetchCart();
        } catch (error) {
          logError("Failed to sync local cart with server:", error);
        }
      },

      resetCart: () => set({ items: [], total: 0 }),
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({ items: state.items, total: state.total }),
      version: 1,
      migrate: (persistedState, version) => {
        if (version === 0) {
          return {
            ...persistedState,
            items: (persistedState.items || []).map((item) => ({
              ...item,
              isGuest: String(item.id).startsWith("guest-"),
            })),
          };
        }
        return persistedState;
      },
    },
  ),
);

export default useCartStore;