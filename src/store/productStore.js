import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../api/client";
import { logError } from "../utils/logger";

const pendingRequests = new Map();

const useProductStore = create(
  persist(
    (set, get) => ({
      products: [],
      isLoading: false,
      error: null,
      totalProducts: 0,
      currentPage: 1,
      totalPages: 1,

      fetchProducts: async (page = 1, limit = 12, filters = {}) => {
        const requestKey = `${page}-${limit}-${JSON.stringify(filters)}`;

        if (pendingRequests.has(requestKey)) {
          return pendingRequests.get(requestKey);
        }

        set({ isLoading: true, error: null });

        const requestPromise = (async () => {
          try {
            const params = new URLSearchParams({
              skip: (page - 1) * limit,
              limit: limit,
              ...filters,
            });

            const response = await api.get(`/products?${params}`);

            let productsArray = [];
            let totalCount = 0;
            let totalPagesCount = 1;

            if (Array.isArray(response.data)) {
              productsArray = response.data;
              totalCount = response.data.length;
            } else if (response.data?.products) {
              productsArray = response.data.products;
              totalCount = response.data.total || productsArray.length;
              totalPagesCount = response.data.total_pages || 1;
            }

            set({
              products: productsArray,
              totalProducts: totalCount,
              currentPage: page,
              totalPages: totalPagesCount,
              isLoading: false,
            });

            return {
              products: productsArray,
              total: totalCount,
              totalPages: totalPagesCount,
            };
          } catch (error) {
            logError("Fetch products error:", error);
            set({
              products: [],
              totalProducts: 0,
              totalPages: 1,
              error: error.message || "Failed to fetch products",
              isLoading: false,
            });
            throw error;
          } finally {
            pendingRequests.delete(requestKey);
          }
        })();

        pendingRequests.set(requestKey, requestPromise);
        return requestPromise;
      },

      fetchHomeProducts: async () => {
        const cached = get().products;
        if (cached.length > 0 && !get().isLoading) {
          return cached;
        }
        return get().fetchProducts(1, 8);
      },

      fetchProductById: async (id) => {
        const cachedProduct = get().products.find(
          (p) => p.id === parseInt(id),
        );
        if (cachedProduct) {
          return cachedProduct;
        }

        set({ isLoading: true, error: null });
        try {
          const response = await api.get(`/products/${id}`);
          set({ isLoading: false });
          return response.data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return null;
        }
      },

      resetProducts: () => {
        set({
          products: [],
          isLoading: false,
          error: null,
          totalProducts: 0,
          currentPage: 1,
          totalPages: 1,
        });
        pendingRequests.clear();
      },
    }),
    {
      name: "product-storage",
      partialize: (state) => ({
        totalProducts: state.totalProducts,
        totalPages: state.totalPages,
      }),
    },
  ),
);

export default useProductStore;