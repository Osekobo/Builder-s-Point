import api from "./client";

export const createOrder = (payload) => api.post("/orders/create", payload);
export const getOrders = () => api.get("/orders/");
export const getAllOrders = () => api.get("/orders/admin/all");
export const getOrderDetails = (orderId) => api.get(`/orders/${orderId}`);
export const cancelOrder = (orderId) =>
  api.post(`/orders/${orderId}/cancel`);
export const retryPayment = (orderId) =>
  api.post(`/orders/${orderId}/retry-payment`);
export const downloadReceipt = (orderId) =>
  api.get(`/orders/${orderId}/receipt`, { responseType: "blob" });
