import api from "./client";

export const initiatePayment = (phoneNumber, amount, orderId) =>
  api.post("/mpesa/stkpush", {
    phone_number: phoneNumber,
    amount,
    order_id: orderId,
  });

export const getPaymentStatus = (checkoutRequestId) =>
  api.get(`/mpesa/status/${checkoutRequestId}`);
