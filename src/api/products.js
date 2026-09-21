import api from "./client";

export const getProducts = (params) => api.get("/products/", { params });
export const getProduct = (id) => api.get(`/products/${id}`);
export const getCategories = () => api.get("/products/categories");
export const getCategoryCounts = () => api.get("/products/categories/counts");
export const createProduct = (productData) => api.post("/products/", productData);
