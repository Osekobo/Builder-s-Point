// pages/OrderDetail.jsx
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiPackage,
  FiCheckCircle,
  FiClock,
  FiTruck,
  FiMapPin,
  FiPhone,
  FiMail,
  FiUser,
  FiDollarSign,
  FiCalendar,
  FiPrinter,
} from "react-icons/fi";
import useAuthStore from "../store/authStore";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/orders/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 404) {
        navigate("/orders");
        return;
      }

      const data = await response.json();
      setOrder(data);
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "paid":
        return <FiCheckCircle className="w-6 h-6 text-green-500" />;
      case "shipped":
        return <FiTruck className="w-6 h-6 text-blue-500" />;
      case "pending":
        return <FiClock className="w-6 h-6 text-yellow-500" />;
      default:
        return <FiPackage className="w-6 h-6 text-gray-500" />;
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
    return `KSh ${amount?.toLocaleString() || 0}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 bg-warm">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terra"></div>
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

  return (
    <div className="min-h-screen bg-warm py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Back Button */}
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 text-terra hover:text-terra-dark mb-6 group"
        >
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Orders</span>
        </Link>

        {/* Print Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 border-2 border-black hover:bg-gray-300 transition-colors"
          >
            <FiPrinter className="w-4 h-4" />
            <span className="text-sm font-bold uppercase">Print</span>
          </button>
        </div>

        {/* Order Header */}
        <div className="bg-white border-4 border-black shadow-hard-lg overflow-hidden mb-6">
          <div className="bg-terra/10 p-6 border-b-4 border-black">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <h1 className="font-h text-3xl font-bold text-black uppercase">
                  Order #{order.id}
                </h1>
                <p className="text-ash mt-1 flex items-center gap-2">
                  <FiCalendar className="w-4 h-4" />
                  Placed on {new Date(
                    order.created_at,
                  ).toLocaleDateString()} at{" "}
                  {new Date(order.created_at).toLocaleTimeString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {getStatusIcon(order.status)}
                <span
                  className={`px-4 py-2 text-sm font-bold uppercase border ${getStatusColor(order.status)}`}
                >
                  {order.status?.toUpperCase() || "PENDING"}
                </span>
              </div>
            </div>
          </div>

          {/* Order Status Timeline */}
          <div className="p-6 border-b-4 border-black">
            <h2 className="font-h text-xl font-bold text-black uppercase mb-4">
              Order Status
            </h2>
            <div className="flex flex-wrap justify-between">
              <div
                className={`text-center ${order.created_at ? "opacity-100" : "opacity-50"}`}
              >
                <div className="w-10 h-10 rounded-full bg-terra/20 border-2 border-terra flex items-center justify-center mx-auto mb-2">
                  <FiPackage className="w-5 h-5 text-terra" />
                </div>
                <p className="text-xs font-bold">Order Placed</p>
                {order.created_at && (
                  <p className="text-xs text-ash mt-1">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex-1 h-0.5 bg-gray-300 self-start mt-5 mx-2"></div>
              <div
                className={`text-center ${order.paid_at ? "opacity-100" : "opacity-50"}`}
              >
                <div className="w-10 h-10 rounded-full bg-terra/20 border-2 border-terra flex items-center justify-center mx-auto mb-2">
                  <FiCheckCircle className="w-5 h-5 text-terra" />
                </div>
                <p className="text-xs font-bold">Payment</p>
                {order.paid_at && (
                  <p className="text-xs text-ash mt-1">
                    {new Date(order.paid_at).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex-1 h-0.5 bg-gray-300 self-start mt-5 mx-2"></div>
              <div
                className={`text-center ${order.status === "shipped" ? "opacity-100" : "opacity-50"}`}
              >
                <div className="w-10 h-10 rounded-full bg-terra/20 border-2 border-terra flex items-center justify-center mx-auto mb-2">
                  <FiTruck className="w-5 h-5 text-terra" />
                </div>
                <p className="text-xs font-bold">Shipped</p>
              </div>
              <div className="flex-1 h-0.5 bg-gray-300 self-start mt-5 mx-2"></div>
              <div
                className={`text-center ${order.status === "delivered" ? "opacity-100" : "opacity-50"}`}
              >
                <div className="w-10 h-10 rounded-full bg-terra/20 border-2 border-terra flex items-center justify-center mx-auto mb-2">
                  <FiCheckCircle className="w-5 h-5 text-terra" />
                </div>
                <p className="text-xs font-bold">Delivered</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
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
                      {item.product_name || `Product #${item.product_id}`}
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

          {/* Payment Information */}
          <div className="p-6 border-b-4 border-black">
            <h2 className="font-h text-xl font-bold text-black uppercase mb-4">
              Payment Information
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 border-2 border-black">
                <p className="text-sm text-ash">Subtotal</p>
                <p className="font-bold text-black">
                  {formatMoney(order.total)}
                </p>
              </div>
              <div className="p-3 bg-gray-50 border-2 border-black">
                <p className="text-sm text-ash">Shipping Fee</p>
                <p className="font-bold text-black">Free</p>
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
                    {new Date(order.paid_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Customer Information */}
          <div className="p-6">
            <h2 className="font-h text-xl font-bold text-black uppercase mb-4">
              Customer Information
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 border-2 border-black">
                <FiUser className="w-5 h-5 text-terra" />
                <div>
                  <p className="text-xs text-ash">Customer Name</p>
                  <p className="font-bold text-black">{user?.name || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 border-2 border-black">
                <FiMail className="w-5 h-5 text-terra" />
                <div>
                  <p className="text-xs text-ash">Email Address</p>
                  <p className="font-bold text-black">{user?.email || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 border-2 border-black">
                <FiPhone className="w-5 h-5 text-terra" />
                <div>
                  <p className="text-xs text-ash">Phone Number</p>
                  <p className="font-bold text-black">{user?.phone || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 border-2 border-black">
                <FiMapPin className="w-5 h-5 text-terra" />
                <div>
                  <p className="text-xs text-ash">Delivery Address</p>
                  <p className="font-bold text-black">To be confirmed</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-between">
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
      </div>
    </div>
  );
};

export default OrderDetail;
