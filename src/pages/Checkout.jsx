import { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import useCartStore from "../store/cartStore";
import toast from "react-hot-toast";
import {
  FaCircleCheck,
  FaMobileScreen,
  FaShieldHalved,
  FaCircleInfo,
  FaBagShopping,
  FaArrowLeft,
} from "react-icons/fa6";
import { createOrder } from "../api/orders";
import { initiatePayment, getPaymentStatus } from "../api/mpesa";
import useAuthStore from "../store/authStore";
import { log, logError } from "../utils/logger";

const MAX_POLL_ATTEMPTS = 15;

const Checkout = () => {
  const [phone, setPhone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [pollingRequestId, setPollingRequestId] = useState(null);
  const [searchParams] = useSearchParams();
  const retryOrderId = parseInt(searchParams.get("retry_order_id") || "", 10);
  const retryTotal = parseFloat(searchParams.get("total") || "");
  const isRetry = !Number.isNaN(retryOrderId) && retryOrderId > 0;
  const { items, total, clearCart } = useCartStore();
  const navigate = useNavigate();
  const createdOrderIdRef = useRef(isRetry ? retryOrderId : null);
  const paymentCompletedRef = useRef(isRetry);

  const subtotal = total;
  const grandTotal = isRetry ? retryTotal : subtotal;

  useEffect(() => {
    if (items.length === 0 && !paymentCompletedRef.current) {
      navigate("/cart");
    }
  }, [items, navigate]);

  useEffect(() => {
    if (!pollingRequestId) return;

    let attempts = 0;
    const timer = setInterval(async () => {
      attempts += 1;
      try {
        const response = await getPaymentStatus(pollingRequestId);
        const data = response.data;

        if (data.status === "paid") {
          clearInterval(timer);
          paymentCompletedRef.current = true;
          toast.success("Payment successful! Your order has been confirmed.");
          if (!isRetry) {
            await clearCart();
          }
          navigate("/orders");
        } else if (attempts >= MAX_POLL_ATTEMPTS) {
          clearInterval(timer);
          paymentCompletedRef.current = true;
          toast.info(
            "Payment confirmation is taking longer. Please check your orders page later.",
          );
          navigate("/orders");
        }
      } catch (error) {
        logError("Status check error:", error);
        if (attempts >= MAX_POLL_ATTEMPTS) {
          clearInterval(timer);
          paymentCompletedRef.current = true;
          toast.error(
            "We couldn't confirm your payment. Please check your orders page.",
          );
          navigate("/orders");
        }
      }
    }, 3000);

    return () => clearInterval(timer);
  }, [pollingRequestId, navigate, clearCart, isRetry]);

  const handlePayment = async () => {
    if (!useAuthStore.getState().isAuthenticated()) {
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }

    if (!phone || phone.length < 10) {
      toast.error("Please enter a valid M-Pesa phone number");
      return;
    }

    if (!isRetry && (!items || items.length === 0)) {
      toast.error("Your cart is empty");
      return;
    }

    setIsProcessing(true);

    try {
      const orderItems = items.map((item) => ({
        product_id: item.product_id || item.product?.id,
        quantity: item.quantity,
        price: item.product?.price || item.price,
      }));

      let orderId = createdOrderIdRef.current;
      if (!orderId) {
        const orderResponse = await createOrder({
          items: orderItems,
          total: grandTotal,
        });
        orderId = orderResponse.data.order_id;
        createdOrderIdRef.current = orderId;
      }

      let formattedPhone = phone.toString().replace(/\D/g, "");
      if (formattedPhone.startsWith("0")) {
        formattedPhone = "254" + formattedPhone.substring(1);
      }
      if (!formattedPhone.startsWith("254")) {
        formattedPhone = "254" + formattedPhone;
      }

      log("Sending STK push", {
        amount: grandTotal,
        phone_number: formattedPhone,
        order_id: orderId,
      });

      const paymentResponse = await initiatePayment(
        formattedPhone,
        grandTotal,
        orderId,
      );
      const paymentData = paymentResponse.data;

      if (paymentData.success) {
        toast.success(
          `STK push sent to ${formattedPhone}. Enter your M-Pesa PIN to complete payment.`,
        );
        setPollingRequestId(paymentData.checkout_request_id);
      } else {
        toast.error(
          `Payment initiation failed: ${paymentData.message || paymentData.response_description || "Please try again."}`,
        );
        setIsProcessing(false);
      }
    } catch (error) {
      logError("Checkout error:", error);
      const detail =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message;
      toast.error(`Checkout failed: ${detail}`);
      setIsProcessing(false);
    }
  };

  const formatMoney = (amount) => {
    return `KSh ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  if (items.length === 0 && !isRetry) {
    return (
      <div className="min-h-screen bg-warm flex items-center justify-center py-12 px-4">
        <div className="text-center max-w-md mx-auto bg-white border-4 border-black shadow-hard-lg p-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-terra/10 border-4 border-terra mb-6">
            <FaBagShopping className="w-10 h-10 text-terra" />
          </div>
          <h2 className="font-h text-2xl font-bold text-black uppercase mb-4">
            Your cart is empty
          </h2>
          <p className="text-ash mb-6">
            Add some products to your cart before checking out.
          </p>
          <Link
            to="/products"
            className="inline-block bg-terra text-white px-8 py-3 font-bold uppercase tracking-wider border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm py-3 px-3 md:py-4">
      <div className="mx-auto w-full max-w-[1600px]">
        <div className="text-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="absolute left-4 top-24 text-black hover:text-terra transition-colors flex items-center space-x-1 group"
          >
            <FaArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back</span>
          </button>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-terra border-4 border-black shadow-hard-sm mb-4">
            <FaBagShopping className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-h text-3xl md:text-4xl font-bold text-black uppercase mb-2">
            Checkout
          </h1>
          <div className="brick-line mx-auto"></div>
          <p className="text-ash mt-2">Complete your purchase securely</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border-4 border-black shadow-hard-sm p-6">
              <h2 className="font-h text-xl font-bold text-black uppercase mb-4 flex items-center">
                <FaMobileScreen className="mr-2 text-terra" />
                Payment with M-Pesa
              </h2>

              <div className="space-y-4 mb-6">
                <div className="border-4 border-terra bg-terra/10 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FaMobileScreen className="w-6 h-6 text-terra" />
                      <div>
                        <p className="font-h font-bold text-black">M-Pesa</p>
                        <p className="text-sm text-ash">
                          Pay using your M-Pesa account
                        </p>
                      </div>
                    </div>
                    <FaCircleCheck className="w-6 h-6 text-terra" />
                  </div>
                </div>
              </div>

              <div className="bg-terra/5 border-2 border-terra p-4">
                {isRetry && (
                  <div className="mb-4 p-3 bg-yellow-50 border-2 border-yellow-500">
                    <p className="text-sm text-yellow-700">
                      Retrying payment for order {retryOrderId}. Enter your
                      phone number to receive a new STK push.
                    </p>
                  </div>
                )}
                <div className="flex items-center space-x-2 mb-3">
                  <FaCircleInfo className="w-5 h-5 text-terra" />
                  <p className="font-bold text-black">M-Pesa Instructions</p>
                </div>
                <ol className="space-y-1 text-sm text-ash list-decimal list-inside">
                  <li>Enter your M-Pesa registered phone number below</li>
                  <li>Click "Place Order" to initiate payment</li>
                  <li>You will receive an STK Push prompt on your phone</li>
                  <li>Enter your M-Pesa PIN to complete the transaction</li>
                </ol>
                <div className="mt-4">
                  <label className="block text-sm font-bold text-black uppercase mb-2">
                    M-Pesa Phone Number *
                  </label>
                  <div className="relative">
                    <FaMobileScreen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ash" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0712345678"
                      className="w-full pl-10 pr-4 py-2 border-2 border-black focus:ring-2 focus:ring-terra"
                      required
                      disabled={isProcessing}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white border-4 border-black shadow-hard-lg p-6 sticky top-20">
              <h2 className="font-h text-xl font-bold text-black uppercase text-center mb-4">
                Order Summary
              </h2>
              <div className="brick-line mx-auto mb-6"></div>

              {isRetry ? (
                <div className="mb-4 p-3 bg-warm/40 border-2 border-black">
                  <p className="text-sm text-ash">
                    Retrying payment for order:{" "}
              <span className="font-bold text-black">
                {retryOrderId}
              </span>
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-4 max-h-64 overflow-y-auto border-b-2 border-black pb-4">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-sm"
                      >
                        <div className="flex-1">
                          <span className="font-bold text-black">
                            {item.product?.name}
                          </span>
                          <span className="text-ash ml-1">
                            x {item.quantity}
                          </span>
                        </div>
                        <span className="font-bold text-terra">
                          {formatMoney(
                            (item.product?.price || 0) * item.quantity,
                          )}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-ash">Subtotal</span>
                      <span className="font-bold text-black">
                        {formatMoney(subtotal)}
                      </span>
                    </div>
                  </div>
                </>
              )}

              <div className="border-t-2 border-black pt-4 mb-4">
                <div className="flex justify-between text-lg font-bold">
                  <span className="font-h text-black">Total</span>
                  <span className="font-h text-2xl text-terra">
                    {formatMoney(grandTotal)}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-terra text-white py-3 font-bold uppercase border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  `Place Order - ${formatMoney(grandTotal)}`
                )}
              </button>

              <div className="mt-4 text-center">
                <div className="flex justify-center space-x-4 text-ash text-xs">
                  <span className="flex items-center space-x-1">
                    <FaShieldHalved className="w-3 h-3 text-terra" />
                    <span>Secure Payment</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;