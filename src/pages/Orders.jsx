// pages/Orders.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getOrders } from "../api/orders";
import useAuthStore from "../store/authStore";
import {
  FiPackage,
  FiCheckCircle,
  FiTruck,
  FiClock,
  FiShoppingBag,
  FiCalendar,
  FiAlertCircle,
  FiXCircle,
  FiDollarSign,
  FiRefreshCw,
} from "react-icons/fi";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingOrderId, setProcessingOrderId] = useState(null);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await getOrders();
      setOrders(response.data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    setProcessingOrderId(orderId);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        alert("Order cancelled successfully");
        fetchOrders(); // Refresh orders
      } else {
        const error = await response.json();
        alert(error.detail || "Failed to cancel order");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("Failed to cancel order");
    } finally {
      setProcessingOrderId(null);
    }
  };

  const retryPayment = async (orderId) => {
    setProcessingOrderId(orderId);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${API_URL}/orders/${orderId}/retry-payment`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        alert(`New order created! Redirecting to checkout...`);
        // Redirect to checkout with the new order
        window.location.href = "/checkout";
      } else {
        const error = await response.json();
        alert(error.detail || "Failed to retry payment");
      }
    } catch (error) {
      console.error("Error retrying payment:", error);
      alert("Failed to retry payment");
    } finally {
      setProcessingOrderId(null);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "paid":
        return <FiCheckCircle className="w-5 h-5 text-green-500" />;
      case "shipped":
        return <FiTruck className="w-5 h-5 text-blue-500" />;
      case "pending":
        return <FiClock className="w-5 h-5 text-yellow-500" />;
      case "cancelled":
        return <FiXCircle className="w-5 h-5 text-red-500" />;
      case "payment_failed":
        return <FiAlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FiPackage className="w-5 h-5 text-gray-500" />;
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
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-terra border-4 border-black shadow-hard-sm mb-4">
            <FiShoppingBag className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-h text-3xl md:text-4xl font-bold text-black uppercase mb-2">
            My Orders
          </h1>
          <div className="brick-line mx-auto"></div>
          <p className="text-ash mt-2">Track your order status and history</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white border-4 border-black shadow-hard-lg">
            <FiPackage className="w-20 h-20 text-ash mx-auto mb-4" />
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
                  {/* Order Header */}
                  <div className="flex flex-wrap justify-between items-start gap-4 border-b-4 border-black pb-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <FiPackage className="w-5 h-5 text-terra" />
                        <p className="font-h font-bold text-black text-lg">
                          Order #{order.id}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-ash">
                        <span className="flex items-center gap-1">
                          <FiCalendar className="w-3 h-3" />
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiDollarSign className="w-3 h-3" />
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

                  {/* Order Items */}
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
                              {item.product_name ||
                                `Product #${item.product_id}`}
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

                  {/* M-Pesa Receipt */}
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

                  {/* Payment Failed Message */}
                  {order.status === "payment_failed" && (
                    <div className="mb-4 p-3 bg-red-50 border-2 border-red-500">
                      <p className="text-sm text-red-700">
                        Payment failed. Please try again.
                      </p>
                    </div>
                  )}

                  {/* Cancelled Message */}
                  {order.status === "cancelled" && (
                    <div className="mb-4 p-3 bg-yellow-50 border-2 border-yellow-500">
                      <p className="text-sm text-yellow-700">
                        Order was cancelled. You can retry payment.
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="border-t-2 border-black pt-4 mt-4">
                    <div className="flex flex-wrap gap-3">
                      {/* ✅ RETRY PAYMENT BUTTON - For cancelled or payment_failed orders */}
                      {(order.status === "cancelled" ||
                        order.status === "payment_failed") && (
                        <button
                          onClick={() => retryPayment(order.id)}
                          disabled={processingOrderId === order.id}
                          className="px-4 py-2 bg-terra text-white text-sm font-bold uppercase border-2 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                          <FiRefreshCw
                            className={`w-4 h-4 ${processingOrderId === order.id ? "animate-spin" : ""}`}
                          />
                          {processingOrderId === order.id
                            ? "Processing..."
                            : "Retry Payment"}
                        </button>
                      )}

                      {/* ✅ CANCEL ORDER BUTTON - Only for pending orders */}
                      {order.status === "pending" && (
                        <button
                          onClick={() => cancelOrder(order.id)}
                          disabled={processingOrderId === order.id}
                          className="px-4 py-2 bg-red-600 text-white text-sm font-bold uppercase border-2 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                          <FiXCircle className="w-4 h-4" />
                          {processingOrderId === order.id
                            ? "Processing..."
                            : "Cancel Order"}
                        </button>
                      )}

                      {/* View Order Details */}
                      <Link
                        to={`/order/${order.id}`}
                        className="px-4 py-2 bg-gray-300 text-black text-sm font-bold uppercase border-2 border-black hover:bg-gray-400 transition-all flex items-center gap-2"
                      >
                        <FiPackage className="w-4 h-4" />
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
    </div>
  );
};

export default Orders;
