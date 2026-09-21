import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { logError } from '../../utils/logger';
import {
  FaCube, FaCirclePlus, FaList, FaBagShopping, FaUsers,
  FaArrowTrendUp, FaDollarSign, FaShieldHalved, FaTriangleExclamation,
  FaCircleXmark, FaCalendarDays, FaEye, FaRotate, FaUser, FaUserXmark
} from 'react-icons/fa6';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    recentOrders: [],
    cancelledOrders: [],
    lowStockProducts: [],
    outOfStockProducts: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCancelledOrder, setSelectedCancelledOrder] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const productsResponse = await api.get('/products/?limit=100');
      let products = [];
      if (Array.isArray(productsResponse.data)) {
        products = productsResponse.data;
      } else if (productsResponse.data.products) {
        products = productsResponse.data.products;
      }

      const ordersResponse = await api.get('/orders/admin/all').catch(() => ({ data: [] }));
      let orders = Array.isArray(ordersResponse.data) ? ordersResponse.data : [];

      orders = orders.map(order => ({
        ...order,
        customer_name: order.user_name || null,
        customer_email: order.user_email || null
      }));

      const activeOrders = orders.filter(order => order.status !== 'cancelled');
      const cancelledOrders = orders.filter(order => order.status === 'cancelled');

      const totalProducts = products.length;
      const totalOrders = activeOrders.length;
      const totalRevenue = activeOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      const totalUsers = new Set(orders.map(order => order.user_id).filter(Boolean)).size;

      const recentOrders = [...activeOrders]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

      const recentCancelledOrders = [...cancelledOrders]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10);

      const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 10);
      const outOfStockProducts = products.filter(p => p.stock === 0);

      setStats({
        totalProducts,
        totalOrders,
        totalRevenue,
        totalUsers,
        recentOrders,
        cancelledOrders: recentCancelledOrders,
        lowStockProducts,
        outOfStockProducts
      });
    } catch (error) {
      logError('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatMoney = (amount) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount.replace(/[^0-9.]/g, "")) : amount;
    return `KSh ${numAmount?.toLocaleString() || 0}`;
  };

  const getOrderStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-500',
      paid: 'bg-green-100 text-green-800 border-green-500',
      shipped: 'bg-blue-100 text-blue-800 border-blue-500',
      delivered: 'bg-purple-100 text-purple-800 border-purple-500',
      cancelled: 'bg-red-100 text-red-800 border-red-500'
    };
    return badges[status?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-500';
  };

  const statCards = [
    { title: 'Total Products', value: stats.totalProducts, icon: FaCube, color: 'bg-terra' },
    { title: 'Total Orders', value: stats.totalOrders, icon: FaBagShopping, color: 'bg-terra' },
    { title: 'Total Revenue', value: formatMoney(stats.totalRevenue), icon: FaDollarSign, color: 'bg-terra' },
    { title: 'Total Users', value: stats.totalUsers, icon: FaUsers, color: 'bg-terra' },
    { title: 'Cancelled Orders', value: stats.cancelledOrders.length, icon: FaCircleXmark, color: 'bg-red-600' },
    { title: 'Low Stock Items', value: stats.lowStockProducts.length, icon: FaTriangleExclamation, color: 'bg-orange-600' },
  ];

  const adminActions = [
    {
      title: 'Add New Product',
      description: 'Add a new product to your store',
      icon: FaCirclePlus,
      link: '/admin/add-product',
      color: 'bg-terra'
    },
    {
      title: 'Manage Products',
      description: 'Edit or delete existing products',
      icon: FaList,
      link: '/admin/products',
      color: 'bg-terra'
    },
    {
      title: 'View Orders',
      description: 'Manage customer orders',
      icon: FaBagShopping,
      link: '/orders',
      color: 'bg-terra'
    },
    {
      title: 'View Cancelled Orders',
      description: 'Review cancelled customer orders',
      icon: FaCircleXmark,
      link: '/admin/cancelled-orders',
      color: 'bg-red-600'
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terra"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm py-3 px-3 md:py-4">
      <div className="mx-auto w-full max-w-[1600px]">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-terra border-4 border-black shadow-hard-sm mb-4">
            <FaShieldHalved className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-h text-3xl md:text-4xl font-bold text-black uppercase mb-2">Admin Dashboard</h1>
          <div className="brick-line mx-auto"></div>
          <p className="text-ash mt-2">Welcome back! Here's what's happening with your store today.</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 inline-flex items-center gap-2 text-terra hover:text-terra-dark text-sm font-bold"
            type="button"
          >
            <FaRotate className="w-4 h-4" />
            Refresh Data
          </button>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-12">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white border-4 border-black shadow-hard-sm p-4 hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-ash text-xs font-bold uppercase tracking-wider">{stat.title}</p>
                  <p className="font-h text-2xl font-bold text-black mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-2 border-4 border-black text-white shadow-hard-sm`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          ))}
        </div>


        <h2 className="font-h text-2xl font-bold text-black uppercase mb-6 flex items-center">
          <FaArrowTrendUp className="mr-2 text-terra" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {adminActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className="bg-white border-4 border-black shadow-hard-sm p-6 hover:-translate-y-2 transition-all duration-300 group"
            >
              <div className="flex items-start space-x-4">
                <div className={`${action.color} p-3 border-4 border-black text-white group-hover:scale-110 transition-transform shadow-hard-sm`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-h font-bold text-black text-lg uppercase tracking-wider">{action.title}</h3>
                  <p className="text-sm text-ash mt-1">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>


        {stats.cancelledOrders.length > 0 && (
          <div className="mb-8">
            <h2 className="font-h text-2xl font-bold text-black uppercase mb-6 flex items-center">
              <FaCircleXmark className="mr-2 text-red-600" />
              Recently Cancelled Orders
            </h2>
            <div className="bg-red-50 border-4 border-red-600 shadow-hard-sm p-6">
              <div className="grid grid-cols-1 gap-4">
                {stats.cancelledOrders.map((order) => (
                  <div key={order.id} className="bg-white border-2 border-red-500 p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-wrap justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <p className="font-bold text-black text-lg">Order {String(order.id).replace(/^#/, "")}</p>
                          <span className={`text-xs px-2 py-0.5 border font-bold ${getOrderStatusBadge(order.status)}`}>
                            {order.status?.toUpperCase() || 'CANCELLED'}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <FaCalendarDays className="w-3 h-3" />
                            {new Date(order.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="mb-2 p-2 bg-green-50 border-l-4 border-green-500">
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <FaUser className="text-green-600" />
                            <span className="font-bold">Ordered by:</span>
                            {order.customer_name ? (
                              <>
                                <span className="font-semibold text-black">{order.customer_name}</span>
                                {order.customer_email && (
                                  <span className="text-gray-500">({order.customer_email})</span>
                                )}
                              </>
                            ) : (
                              <span className="text-gray-500">User not found</span>
                            )}
                          </p>
                        </div>

                        <div className="p-2 bg-red-50 border-l-4 border-red-500">
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <FaUserXmark className="text-red-600" />
                            <span className="font-bold">Reason:</span>
                            <span className="font-semibold text-red-700">{order.payment_error || 'No reason provided'}</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-red-600 text-lg">{formatMoney(order.total || 0)}</p>
                        <button
                          onClick={() => setSelectedCancelledOrder(order)}
                          className="mt-2 inline-flex items-center gap-1 text-terra hover:text-terra-dark text-sm font-bold uppercase"
                          type="button"
                        >
                          <FaEye className="w-4 h-4" />
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {stats.cancelledOrders.length > 0 && (
                <Link
                  to="/admin/cancelled-orders"
                  className="block w-full mt-4 bg-red-600 text-white text-center py-2 font-bold uppercase tracking-wider border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                >
                  View All Cancelled Orders ({stats.cancelledOrders.length})
                </Link>
              )}
            </div>
          </div>
        )}


        {(stats.lowStockProducts.length > 0 || stats.outOfStockProducts.length > 0) && (
          <div className="mb-8">
            <h2 className="font-h text-2xl font-bold text-black uppercase mb-6 flex items-center">
              <FaTriangleExclamation className="mr-2 text-orange-600" />
              Inventory Alerts
            </h2>

            {stats.outOfStockProducts.length > 0 && (
              <div className="mb-6 bg-red-50 border-4 border-red-500 shadow-hard-sm p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-red-600 p-2 border-2 border-black mr-3">
                    <FaTriangleExclamation className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-h text-xl font-bold text-red-700 uppercase">Out of Stock - Immediate Action Required</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stats.outOfStockProducts.map((product) => (
                    <div key={product.id} className="bg-white border-2 border-red-500 p-4 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-black">{product.name}</p>
                        <p className="text-xs text-ash">Category: {product.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">Out of Stock</p>
                        <Link to={`/admin/edit-product/${product.id}`} className="text-xs text-terra hover:text-terra-dark font-bold uppercase">
                          Restock Now
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {stats.lowStockProducts.length > 0 && (
              <div className="bg-yellow-50 border-4 border-yellow-500 shadow-hard-sm p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-yellow-600 p-2 border-2 border-black mr-3">
                    <FaTriangleExclamation className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-h text-xl font-bold text-yellow-700 uppercase">Low Stock - Needs Attention</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stats.lowStockProducts.map((product) => (
                    <div key={product.id} className="bg-white border-2 border-yellow-500 p-4 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-black">{product.name}</p>
                        <p className="text-xs text-ash">Category: {product.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-orange-600">Only {product.stock} left</p>
                        <Link to={`/admin/edit-product/${product.id}`} className="text-xs text-terra hover:text-terra-dark font-bold uppercase">
                          Restock Now
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border-4 border-black shadow-hard-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-h text-xl font-bold text-black uppercase flex items-center">
                <FaBagShopping className="mr-2 text-terra" />
                Recent Active Orders
              </h2>
              <Link to="/orders" className="text-terra hover:text-terra-dark text-sm font-bold uppercase tracking-wider transition-colors">
                View All
              </Link>
            </div>
            {stats.recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-ash">No active orders yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {stats.recentOrders.map((order) => (
                  <div key={order.id} className="flex justify-between items-center p-3 bg-terra/5 border-2 border-terra">
                    <div>
                      <p className="font-bold text-black">Order {String(order.id).replace(/^#/, "")}</p>
                      <div className="flex items-center gap-2 text-xs text-ash mt-1">
                        <FaUser className="w-3 h-3" />
                        <span>{order.customer_name || 'Guest'}</span>
                      </div>
                      <p className="text-xs text-ash">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-terra">{formatMoney(order.total || 0)}</p>
                      <span className={`text-xs px-2 py-0.5 border ${getOrderStatusBadge(order.status)}`}>
                        {order.status?.toUpperCase() || 'PENDING'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border-4 border-black shadow-hard-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-h text-xl font-bold text-black uppercase flex items-center">
                <FaCube className="mr-2 text-terra" />
                Products Overview
              </h2>
              <Link to="/admin/products" className="text-terra hover:text-terra-dark text-sm font-bold uppercase tracking-wider transition-colors">
                Manage All
              </Link>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 border-2 border-green-500">
                <span className="font-bold text-black">Healthy Stock (&gt;10)</span>
                <span className="font-bold text-green-600">{stats.totalProducts - stats.lowStockProducts.length - stats.outOfStockProducts.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 border-2 border-yellow-500">
                <span className="font-bold text-black">Low Stock (1-10)</span>
                <span className="font-bold text-orange-600">{stats.lowStockProducts.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 border-2 border-red-500">
                <span className="font-bold text-black">Out of Stock</span>
                <span className="font-bold text-red-600">{stats.outOfStockProducts.length}</span>
              </div>
            </div>

            {(stats.lowStockProducts.length > 0 || stats.outOfStockProducts.length > 0) && (
              <Link
                to="/admin/products"
                className="block w-full mt-6 bg-terra text-white text-center py-2 font-bold uppercase tracking-wider border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
              >
                Review Inventory
              </Link>
            )}
          </div>
        </div>

        <div className="mt-8 p-6 bg-terra/10 border-4 border-terra text-center">
          <p className="text-sm text-black font-semibold">
            Pro Tip: Monitor cancelled orders to identify potential issues with products or customer satisfaction. Track who cancels most frequently to improve service.
          </p>
        </div>
      </div>


      {selectedCancelledOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedCancelledOrder(null)}>
          <div className="bg-white border-4 border-black shadow-hard-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="bg-red-600 p-4 border-b-4 border-black sticky top-0">
              <div className="flex justify-between items-center">
                <h2 className="font-h text-xl font-bold text-white uppercase">Cancelled Order Details</h2>
                <button onClick={() => setSelectedCancelledOrder(null)} className="text-white hover:text-gray-200" type="button">
                  <FaCircleXmark className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                  <div>
                    <p className="text-sm text-ash">Order ID</p>
                    <p className="font-bold text-black text-lg">Order {String(selectedCancelledOrder.id).replace(/^#/, "")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-ash">Status</p>
                    <span className={`inline-block text-xs px-2 py-0.5 border font-bold ${getOrderStatusBadge(selectedCancelledOrder.status)}`}>
                      {selectedCancelledOrder.status?.toUpperCase() || 'CANCELLED'}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-green-50 border-2 border-green-500">
                  <h3 className="font-bold text-green-800 uppercase text-sm mb-2 flex items-center gap-2">
                    <FaUser /> Customer Who Placed Order
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-600">Name</p>
                      <p className="font-semibold text-black">
                        {selectedCancelledOrder.customer_name || 'Unknown'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Email</p>
                      <p className="font-semibold text-black">
                        {selectedCancelledOrder.customer_email || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">User ID</p>
                      <p className="font-semibold text-black">{selectedCancelledOrder.user_id || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Order Date</p>
                      <p className="font-semibold text-black">{new Date(selectedCancelledOrder.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-red-50 border-2 border-red-500">
                  <h3 className="font-bold text-red-800 uppercase text-sm mb-2 flex items-center gap-2">
                    <FaUserXmark /> Cancellation Reason
                  </h3>
                  <p className="font-semibold text-red-700">
                    {selectedCancelledOrder.payment_error || 'No reason provided'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-ash font-bold mb-2">Order Items</p>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedCancelledOrder.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 border">
                        <div>
                          <p className="font-semibold">{item.name || item.product_name}</p>
                          <p className="text-sm text-ash">Qty: {item.quantity} × {formatMoney(item.price)}</p>
                        </div>
                        <p className="font-medium">{formatMoney((item.price || 0) * (item.quantity || 0))}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t flex justify-between items-center">
                  <p className="font-bold text-black">Total Amount</p>
                  <p className="font-bold text-red-600 text-xl">{formatMoney(selectedCancelledOrder.total || 0)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;