import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaBagShopping, FaCalendarDays, FaMagnifyingGlass, FaRotate, FaUser } from "react-icons/fa6";
import { getAllOrders } from "../../api/orders";
import { logError } from "../../utils/logger";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await getAllOrders();
      const data = Array.isArray(response.data) ? response.data : response.data?.orders || [];
      setOrders(data);
    } catch (requestError) {
      logError("Error fetching admin orders:", requestError);
      setError(requestError.response?.data?.detail || "Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders.filter((order) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;

    return [
      String(order.id),
      order.user_name,
      order.user_email,
      order.status,
    ].some((value) => String(value || "").toLowerCase().includes(term));
  });

  const formatMoney = (amount) => `KSh ${Number(amount || 0).toLocaleString()}`;

  const getStatusClass = (status) => {
    const classes = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-500",
      paid: "bg-green-100 text-green-800 border-green-500",
      shipped: "bg-blue-100 text-blue-800 border-blue-500",
      delivered: "bg-purple-100 text-purple-800 border-purple-500",
      cancelled: "bg-red-100 text-red-800 border-red-500",
      payment_failed: "bg-orange-100 text-orange-800 border-orange-500",
    };
    return classes[status] || "bg-gray-100 text-gray-800 border-gray-500";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terra"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <Link to="/admin" className="inline-flex items-center gap-2 text-terra hover:text-terra-dark mb-4">
            <FaArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="font-h text-3xl md:text-4xl font-bold text-black uppercase flex items-center gap-3">
                <FaBagShopping className="text-terra" />
                All Orders
              </h1>
              <p className="text-ash mt-2">Review orders from every customer</p>
            </div>
            <button
              type="button"
              onClick={fetchOrders}
              className="inline-flex items-center gap-2 bg-white border-2 border-black px-4 py-2 font-bold uppercase hover:bg-terra/10"
            >
              <FaRotate className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        <div className="bg-white border-4 border-black shadow-hard-sm p-4 mb-6">
          <div className="relative">
            <FaMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by order ID, customer, or status"
              className="w-full pl-10 pr-4 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-terra"
            />
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 border-4 border-red-600 shadow-hard-sm p-8 text-center">
            <p className="font-bold text-red-700">{error}</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white border-4 border-black shadow-hard-sm p-12 text-center">
            <FaBagShopping className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-ash text-lg">No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white border-4 border-black shadow-hard-sm p-5">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="font-h text-xl font-bold text-black">Order {order.id}</h2>
                      <span className={`text-xs px-2 py-0.5 border font-bold uppercase ${getStatusClass(order.status)}`}>
                        {order.status || "Unknown"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 flex items-center gap-2 mt-3">
                      <FaUser className="text-terra" />
                      {order.user_name || "Unknown customer"}
                      {order.user_email ? ` (${order.user_email})` : ""}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                      <FaCalendarDays className="w-4 h-4" />
                      {order.created_at ? new Date(order.created_at).toLocaleString() : "Date unavailable"}
                    </p>
                  </div>
                  <p className="font-h text-2xl font-bold text-terra">{formatMoney(order.total)}</p>
                </div>

                <div className="mt-4 border-t-2 border-gray-100 pt-4">
                  <p className="text-xs font-bold text-gray-600 uppercase mb-2">Items</p>
                  {order.items?.length ? (
                    <div className="space-y-1">
                      {order.items.map((item, index) => (
                        <p key={`${order.id}-${item.product_id}-${index}`} className="text-sm text-gray-700">
                          {item.product_name || `Product #${item.product_id}`} × {item.quantity} — {formatMoney((item.price || 0) * (item.quantity || 0))}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No item details available</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
