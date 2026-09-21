import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCube,
  FaCircleCheck,
  FaClock,
  FaTruck,
  FaLocationDot,
  FaPhone,
  FaEnvelope,
  FaUser,
  FaCalendarDays,
  FaPrint,
} from "react-icons/fa6";
import useAuthStore from "../store/authStore";
import useProductStore from "../store/productStore";
import { getOrderDetails } from "../api/orders";
import { logError } from "../utils/logger";

const BUSINESS_NAME = "Kione Hardware";
const BUSINESS_TAGLINE = "Your Trusted Hardware Store";
const BUSINESS_ADDRESS = "Nairobi, Kenya";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { user } = useAuthStore();
  const { products } = useProductStore();

  const getProductName = (productId) => {
    const product = products.find((p) => p.id === productId);
    return product?.name || null;
  };

  const fetchOrder = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const response = await getOrderDetails(id);
      setOrder(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        navigate("/orders");
        return;
      }
      logError("Error fetching order:", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "paid":
        return <FaCircleCheck className="w-6 h-6 text-green-500" />;
      case "shipped":
        return <FaTruck className="w-6 h-6 text-blue-500" />;
      case "pending":
        return <FaClock className="w-6 h-6 text-yellow-500" />;
      default:
        return <FaCube className="w-6 h-6 text-gray-500" />;
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
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const formatMoney = (amount) => {
    const numAmount =
      typeof amount === "string"
        ? parseFloat(amount.replace(/[^0-9.]/g, ""))
        : amount;
    return `KSh ${numAmount?.toLocaleString() || 0}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-KG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString("en-KG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 bg-warm">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terra"></div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen bg-warm flex items-center justify-center px-4">
        <div className="text-center bg-white border-4 border-red-600 shadow-hard-lg p-10 max-w-md">
          <p className="font-h text-xl font-bold text-black uppercase mb-2">
            Could not load this order
          </p>
          <p className="text-ash mb-6">
            Check your connection and try again.
          </p>
          <button
            onClick={fetchOrder}
            className="inline-block bg-terra text-white px-8 py-3 font-bold uppercase tracking-wider border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-warm flex items-center justify-center">
        <div className="text-center">
          <p className="text-ash mb-4">Order not found</p>
          <Link to="/orders" className="text-terra hover:underline">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const statusLabel = order.status?.toUpperCase() || "PENDING";

  return (
    <div className="min-h-screen bg-warm py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Screen-only controls */}
        <div className="no-print flex justify-between items-start mb-6">
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 text-terra hover:text-terra-dark mb-6 group"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Orders</span>
          </Link>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 border-2 border-black hover:bg-gray-300 transition-colors"
          >
            <FaPrint className="w-4 h-4" />
            <span className="text-sm font-bold uppercase">Print Receipt</span>
          </button>
        </div>

        {/* Screen Layout */}
        <div className="screen-only bg-white border-4 border-black shadow-hard-lg overflow-hidden mb-6">
          <div className="bg-terra/10 p-6 border-b-4 border-black">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <h1 className="font-h text-3xl font-bold text-black uppercase">
                  Order {String(order.id).replace(/^#/, "")}
                </h1>
                <p className="text-ash mt-1 flex items-center gap-2">
                  <FaCalendarDays className="w-4 h-4" />
                  Placed on {formatDateTime(order.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {getStatusIcon(order.status)}
                <span
                  className={`px-4 py-2 text-sm font-bold uppercase border ${getStatusColor(order.status)}`}
                >
                  {statusLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 border-b-4 border-black">
            <h2 className="font-h text-xl font-bold text-black uppercase mb-4">
              Order Status
            </h2>
            <div className="flex flex-wrap justify-between">
              <div
                className={`text-center ${order.created_at ? "opacity-100" : "opacity-50"}`}
              >
                <div className="w-10 h-10 rounded-full bg-terra/20 border-2 border-terra flex items-center justify-center mx-auto mb-2">
                  <FaCube className="w-5 h-5 text-terra" />
                </div>
                <p className="text-xs font-bold">Order Placed</p>
                {order.created_at && (
                  <p className="text-xs text-ash mt-1">
                    {formatDate(order.created_at)}
                  </p>
                )}
              </div>
              <div className="flex-1 h-0.5 bg-gray-300 self-start mt-5 mx-2"></div>
              <div
                className={`text-center ${order.paid_at ? "opacity-100" : "opacity-50"}`}
              >
                <div className="w-10 h-10 rounded-full bg-terra/20 border-2 border-terra flex items-center justify-center mx-auto mb-2">
                  <FaCircleCheck className="w-5 h-5 text-terra" />
                </div>
                <p className="text-xs font-bold">Payment</p>
                {order.paid_at && (
                  <p className="text-xs text-ash mt-1">
                    {formatDate(order.paid_at)}
                  </p>
                )}
              </div>
              <div className="flex-1 h-0.5 bg-gray-300 self-start mt-5 mx-2"></div>
              <div
                className={`text-center ${order.status === "shipped" ? "opacity-100" : "opacity-50"}`}
              >
                <div className="w-10 h-10 rounded-full bg-terra/20 border-2 border-terra flex items-center justify-center mx-auto mb-2">
                  <FaTruck className="w-5 h-5 text-terra" />
                </div>
                <p className="text-xs font-bold">Shipped</p>
              </div>
              <div className="flex-1 h-0.5 bg-gray-300 self-start mt-5 mx-2"></div>
              <div
                className={`text-center ${order.status === "delivered" ? "opacity-100" : "opacity-50"}`}
              >
                <div className="w-10 h-10 rounded-full bg-terra/20 border-2 border-terra flex items-center justify-center mx-auto mb-2">
                  <FaCircleCheck className="w-5 h-5 text-terra" />
                </div>
                <p className="text-xs font-bold">Delivered</p>
              </div>
            </div>
          </div>

          <div className="p-6 border-b-4 border-black">
            <h2 className="font-h text-xl font-bold text-black uppercase mb-4">
              Order Items
            </h2>
            <div className="space-y-3">
              {order.items?.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-4 bg-warm/30 border-2 border-black"
                >
                  <div className="flex-1">
                    <p className="font-h font-bold text-black">
                      {item.product_name ||
                        getProductName(item.product_id) ||
                        `Product ${item.product_id}`}
                    </p>
                    <p className="text-sm text-ash">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-terra">
                      {formatMoney(item.price)}
                    </p>
                    <p className="text-sm text-ash">each</p>
                  </div>
                  <div className="text-right ml-6">
                    <p className="font-bold text-black">Total</p>
                    <p className="font-bold text-terra">
                      {formatMoney(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 border-b-4 border-black">
            <h2 className="font-h text-xl font-bold text-black uppercase mb-4">
              Payment Information
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 border-2 border-black">
                <p className="text-sm text-ash">Subtotal</p>
                <p className="font-bold text-black">{formatMoney(order.total)}</p>
              </div>
              <div className="p-3 bg-terra/10 border-2 border-terra md:col-span-2">
                <p className="text-sm text-ash">Total Paid</p>
                <p className="font-h text-2xl font-bold text-terra">
                  {formatMoney(order.total)}
                </p>
              </div>
              {order.mpesa_receipt && (
                <div className="md:col-span-2 p-3 bg-green-50 border-2 border-green-500">
                  <p className="text-sm text-green-700">
                    M-Pesa Receipt Number
                  </p>
                  <p className="font-mono font-bold text-green-800">
                    {order.mpesa_receipt}
                  </p>
                </div>
              )}
              {order.paid_at && (
                <div className="md:col-span-2 p-3 bg-gray-50 border-2 border-black">
                  <p className="text-sm text-ash">Payment Date</p>
                  <p className="font-bold text-black">
                    {formatDateTime(order.paid_at)}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            <h2 className="font-h text-xl font-bold text-black uppercase mb-4">
              Customer Information
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 border-2 border-black">
                <FaUser className="w-5 h-5 text-terra" />
                <div>
                  <p className="text-xs text-ash">Customer Name</p>
                  <p className="font-bold text-black">{user?.name || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 border-2 border-black">
                <FaEnvelope className="w-5 h-5 text-terra" />
                <div>
                  <p className="text-xs text-ash">Email Address</p>
                  <p className="font-bold text-black">{user?.email || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 border-2 border-black">
                <FaPhone className="w-5 h-5 text-terra" />
                <div>
                  <p className="text-xs text-ash">Phone Number</p>
                  <p className="font-bold text-black">{user?.phone || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 border-2 border-black">
                <FaLocationDot className="w-5 h-5 text-terra" />
                <div>
                  <p className="text-xs text-ash">Delivery Address</p>
                  <p className="font-bold text-black">To be confirmed</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="screen-only flex flex-wrap gap-4 justify-between">
          <Link
            to="/products"
            className="px-6 py-3 bg-gray-300 text-black font-bold uppercase border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            Continue Shopping
          </Link>
          {order.status === "pending" && (
            <Link
              to="/checkout"
              className="px-6 py-3 bg-terra text-white font-bold uppercase border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              Complete Payment
            </Link>
          )}
        </div>

        {/* ============================================
             PRINT-ONLY RECEIPT
             ============================================ */}
        <div className="print-only print-receipt">
          <div className="receipt-container">
            {/* Business Header */}
            <div className="receipt-header">
              <div className="receipt-logo">{BUSINESS_NAME}</div>
              <div className="receipt-tagline">{BUSINESS_TAGLINE}</div>
              <div className="receipt-tagline">{BUSINESS_ADDRESS}</div>
            </div>

            {/* Receipt Title */}
            <h1 className="receipt-title">Order Receipt</h1>

            {/* Order Info */}
            <div className="receipt-order-info">
              <div>
                <p>
                  <strong>Order ID:</strong> #{String(order.id).replace(/^#/, "")}
                </p>
                <p>
                  <strong>Date:</strong> {formatDate(order.created_at)}
                </p>
              </div>
              <div>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className="receipt-status-badge">{statusLabel}</span>
                </p>
                <p>
                  <strong>Payment:</strong>{" "}
                  {order.status === "paid"
                    ? "Paid"
                    : order.status === "pending"
                      ? "Pending"
                      : "Other"}
                </p>
              </div>
            </div>

            {/* Customer Info */}
            <div className="receipt-customer-info">
              <span>
                <strong>Customer:</strong> {user?.name || "N/A"}
              </span>
              <span>
                <strong>Email:</strong> {user?.email || "N/A"}
              </span>
              <span>
                <strong>Phone:</strong> {user?.phone || "N/A"}
              </span>
            </div>

            {/* Order Items Table */}
            <h2 className="receipt-section-title">Items</h2>
            <table className="receipt-items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th style={{ textAlign: "right" }}>Unit Price</th>
                  <th style={{ textAlign: "right" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      {item.product_name ||
                        getProductName(item.product_id) ||
                        `Product ${item.product_id}`}
                    </td>
                    <td>{item.quantity}</td>
                    <td style={{ textAlign: "right" }}>
                      {formatMoney(item.price)}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {formatMoney(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="receipt-totals">
              <div>
                <strong>Subtotal:</strong> {formatMoney(order.total)}
              </div>
              <div className="total">
                <strong>Total Paid:</strong> {formatMoney(order.total)}
              </div>
            </div>

            {/* Payment Info */}
            {order.mpesa_receipt && (
              <div className="receipt-payment-info">
                <p>
                  <strong>M-Pesa Receipt Number:</strong> {order.mpesa_receipt}
                </p>
                {order.paid_at && (
                  <p>
                    <strong>Payment Date:</strong> {formatDateTime(order.paid_at)}
                  </p>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="receipt-footer">
              <p>
                Thank you for shopping at {BUSINESS_NAME}!
              </p>
              <p style={{ marginTop: "5px" }}>
                For any inquiries, please contact us at{" "}
                {user?.email || "support@kionehardware.com"}
              </p>
              <p style={{ marginTop: "10px", fontSize: "9pt" }}>
                This is a computer-generated receipt. No signature required.
              </p>
            </div>

            <div className="receipt-page-info">
              Order #{String(order.id).replace(/^#/, "")} - Page 1 of 1
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
