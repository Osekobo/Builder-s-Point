import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { logError } from '../../utils/logger';
import { FaCircleXmark, FaCalendarDays, FaEye, FaArrowLeft, FaMagnifyingGlass, FaFilter } from 'react-icons/fa6';

const CancelledOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchCancelledOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/orders/admin/all');
      const allOrders = Array.isArray(response.data) ? response.data : [];
      const cancelled = allOrders.filter(order => order.status === 'cancelled');
      setOrders(cancelled.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (error) {
      logError('Error fetching cancelled orders:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCancelledOrders();
  }, [fetchCancelledOrders]);

  const filteredOrders = orders.filter(order => 
    order.id.toString().includes(searchTerm) ||
    order.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatMoney = (amount) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount.replace(/[^0-9.]/g, "")) : amount;
    return `KSh ${numAmount?.toLocaleString() || 0}`;
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
                <FaCircleXmark className="text-red-600" />
                Cancelled Orders
              </h1>
              <p className="text-ash mt-2">Manage and review all cancelled customer orders</p>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <FaMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by order ID or customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border-2 border-black focus:outline-none focus:border-terra w-64"
                />
              </div>
              <button className="bg-white border-2 border-black p-2 hover:bg-gray-50">
                <FaFilter className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white border-4 border-black shadow-hard-sm p-12 text-center">
            <FaCircleXmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-ash text-lg">No cancelled orders found</p>
            <p className="text-ash text-sm mt-2">When customers cancel orders, they will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white border-4 border-black shadow-hard-sm p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-h text-xl font-bold text-black">Order {String(order.id).replace(/^#/, "")}</h3>
                      <span className="bg-red-100 text-red-800 border border-red-500 text-xs px-2 py-0.5 font-bold uppercase">
                        Cancelled
                      </span>
                      <span className="flex items-center gap-1 text-sm text-ash">
                        <FaCalendarDays className="w-4 h-4" />
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-600">
                      Customer: <span className="font-semibold">{order.user_name || 'N/A'}</span>
                    </p>
                    {order.payment_error && (
                      <p className="text-red-600 mt-1">
                        <span className="font-bold">Reason:</span> {order.payment_error}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600 text-2xl">{formatMoney(order.total)}</p>
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="mt-2 inline-flex items-center gap-1 bg-terra text-white px-4 py-1 font-bold uppercase text-sm border-2 border-black hover:bg-terra-dark transition"
                    >
                      <FaEye className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white border-4 border-black shadow-hard-sm max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
          </div>
        </div>
      )}
    </div>
  );
};

export default CancelledOrders;