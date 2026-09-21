import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getOrders, cancelOrder as cancelOrderApi, retryPayment as retryPaymentApi } from "../api/orders";
import toast from "react-hot-toast";
import { logError } from "../utils/logger";
import useProductStore from "../store/productStore";
import {
  FaCube,
  FaCircleCheck,
  FaTruck,
  FaClock,
  FaBagShopping,
  FaCalendarDays,
  FaCircleExclamation,
  FaCircleXmark,
  FaRotate,
} from "react-icons/fa6";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [processingOrderId, setProcessingOrderId] = useState(null);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const navigate = useNavigate();

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const response = await getOrders();
      setOrders(response.data);
    } catch (error) {
      logError("Failed to fetch orders:", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const cancelOrder = async (orderId) => {
    setProcessingOrderId(orderId);
    try {
      await cancelOrderApi(orderId);
      toast.success("Order cancelled successfully");
      fetchOrders();
    } catch (error) {
      logError("Error cancelling order:", error);
      toast.error(error.response?.data?.detail || "Failed to cancel order");
    } finally {
      setProcessingOrderId(null);
    }
  };

  const retryPayment = async (orderId) => {
    setProcessingOrderId(orderId);
    try {
      const response = await retryPaymentApi(orderId);
      toast.success("New order created! Redirecting to payment...");
      navigate(
        `/checkout?retry_order_id=${response.data.new_order_id}&total=${response.data.total}`,
      );
    } catch (error) {
      logError("Error retrying payment:", error);
      toast.error(error.response?.data?.detail || "Failed to retry payment");
    } finally {
      setProcessingOrderId(null);
    }
  };

  const { products } = useProductStore();
  const getProductName = (productId) => {
    const product = products.find((p) => p.id === productId);
    return product?.name || null;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "paid":
        return <FaCircleCheck className="w-5 h-5 text-green-500" />;
      case "shipped":
        return <FaTruck className="w-5 h-5 text-blue-500" />;
      case "pending":
        return <FaClock className="w-5 h-5 text-yellow-500" />;
      case "cancelled":
        return <FaCircleXmark className="w-5 h-5 text-red-500" />;
      case "payment_failed":
        return <FaCircleExclamation className="w-5 h-5 text-red-500" />;
      default:
        return <FaCube className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-300";
      case "shipped":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      case "payment_failed":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case "paid":
        return "Payment confirmed! Your order is being processed.";
      case "shipped":
        return "Your order has been shipped!";
      case "pending":
        return "Awaiting payment confirmation. Please complete payment within 15 minutes.";
      case "cancelled":
        return "Order was cancelled. You can retry payment.";
      case "payment_failed":
        return "Payment failed. Please try again.";
      default:
        return "Order received.";
    }
  };

  const formatMoney = (amount) => {
    return `KSh ${amount?.toLocaleString() || 0}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 bg-warm">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terra"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-terra border-4 border-black shadow-hard-sm mb-4">
            <FaBagShopping className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-h text-3xl md:text-4xl font-bold text-black uppercase mb-2">
            My Orders
          </h1>
          <div className="brick-line mx-auto"></div>
          <p className="text-ash mt-2">Track your order status and history</p>
        </div>

        {hasError ? (
          <div className="text-center py-16 bg-white border-4 border-red-600 shadow-hard-lg">
            <FaCircleExclamation className="w-20 h-20 text-red-500 mx-auto mb-4" />
            <p className="font-h text-2xl font-bold text-black uppercase mb-2">
              Could not load your orders
            </p>
            <p className="text-ash mb-6">
              Check your connection and try again.
            </p>
            <button
              onClick={fetchOrders}
              className="inline-flex items-center gap-2 bg-terra text-white px-8 py-3 font-bold uppercase tracking-wider border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              <FaRotate className="w-4 h-4" />
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-white border-4 border-black shadow-hard-lg">
            <FaCube className="w-20 h-20 text-ash mx-auto mb-4" />
            <p className="font-h text-2xl font-bold text-black uppercase mb-2">
              No orders yet
            </p>
            <p className="text-ash mb-6">You haven't placed any orders yet.</p>
            <Link
              to="/products"
              className="inline-block bg-terra text-white px-8 py-3 font-bold uppercase tracking-wider border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border-4 border-black shadow-hard-sm overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-wrap justify-between items-start gap-4 border-b-4 border-black pb-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <FaCube className="w-5 h-5 text-terra" />
                        <p className="font-h font-bold text-black text-lg">
                          Order {String(order.id).replace(/^#/, "")}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-ash">
                        <span className="flex items-center gap-1">
                          <FaCalendarDays className="w-3 h-3" />
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          {formatMoney(order.total)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(order.status)}
                        <span
                          className={`px-3 py-1 text-xs font-bold uppercase border ${getStatusColor(order.status)}`}
                        >
                          {order.status?.toUpperCase() || "PENDING"}
                        </span>
                      </div>
                      <p className="text-xs text-ash max-w-xs">
                        {getStatusMessage(order.status)}
                      </p>
                    </div>
                  </div>

                  {order.items && order.items.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-h font-bold text-black uppercase text-sm mb-3">
                        Items
                      </h3>
                      <div className="space-y-2 bg-warm/30 p-3 border-2 border-black">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-ash">
                              {item.product_name || getProductName(item.product_id) || `Product ${item.product_id}`}
                              <span className="font-bold ml-1">
                                x {item.quantity}
                              </span>
                            </span>
                            <span className="font-bold text-terra">
                              {formatMoney(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {order.mpesa_receipt && (
                    <div className="mb-4 p-3 bg-green-50 border-2 border-green-500">
                      <p className="text-sm text-green-700">
                        M-Pesa Receipt:{" "}
                        <span className="font-mono font-bold">
                          {order.mpesa_receipt}
                        </span>
                      </p>
                    </div>
                  )}

                  {order.status === "payment_failed" && (
                    <div className="mb-4 p-3 bg-red-50 border-2 border-red-500">
                      <p className="text-sm text-red-700">
                        Payment failed. Please try again.
                      </p>
                    </div>
                  )}

                  {order.status === "cancelled" && (
                    <div className="mb-4 p-3 bg-yellow-50 border-2 border-yellow-500">
                      <p className="text-sm text-yellow-700">
                        Order was cancelled. You can retry payment.
                      </p>
                    </div>
                  )}

                  <div className="border-t-2 border-black pt-4 mt-4">
                    <div className="flex flex-wrap gap-3">
                      {(order.status === "cancelled" ||
                        order.status === "payment_failed") && (
                        <button
                          onClick={() => retryPayment(order.id)}
                          disabled={processingOrderId === order.id}
                          className="px-4 py-2 bg-terra text-white text-sm font-bold uppercase border-2 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                          <FaRotate
                            className={`w-4 h-4 ${processingOrderId === order.id ? "animate-spin" : ""}`}
                          />
                          {processingOrderId === order.id
                            ? "Processing..."
                            : "Retry Payment"}
                        </button>
                      )}

                      {order.status === "pending" && (
                        <button
                          onClick={() => setOrderToCancel(order)}
                          disabled={processingOrderId === order.id}
                          className="px-4 py-2 bg-red-600 text-white text-sm font-bold uppercase border-2 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                          <FaCircleXmark className="w-4 h-4" />
                          {processingOrderId === order.id
                            ? "Processing..."
                            : "Cancel Order"}
                        </button>
                      )}

                      <Link
                        to={`/order/${order.id}`}
                        className="px-4 py-2 bg-gray-300 text-black text-sm font-bold uppercase border-2 border-black hover:bg-gray-400 transition-all flex items-center gap-2"
                      >
                        <FaCube className="w-4 h-4" />
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {orderToCancel && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setOrderToCancel(null)}
        >
          <div
            className="bg-white border-4 border-black shadow-hard-lg p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-h text-lg font-bold text-black uppercase mb-3">
              Cancel Order {orderToCancel.id}?
            </h2>
            <p className="text-ash mb-6">
              Are you sure you want to cancel this order? This action cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const id = orderToCancel.id;
                  setOrderToCancel(null);
                  cancelOrder(id);
                }}
                disabled={processingOrderId === orderToCancel.id}
                className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-bold uppercase border-2 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50"
              >
                {processingOrderId === orderToCancel.id
                  ? "Processing..."
                  : "Yes, Cancel"}
              </button>
              <button
                onClick={() => setOrderToCancel(null)}
                className="flex-1 px-4 py-2 bg-gray-300 text-black text-sm font-bold uppercase border-2 border-black hover:bg-gray-400 transition-all"
              >
                Keep Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
