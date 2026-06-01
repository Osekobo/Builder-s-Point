import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiPackage,
  FiDollarSign,
  FiShoppingBag,
  FiSearch,
  FiRefreshCw,
} from "react-icons/fi";

const API_BASE_URL = "http://localhost:8000";

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, selectedCategory, products]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      // Fetch all products (you might want to add pagination here for large inventories)
      const response = await axios.get(`${API_BASE_URL}/products/?limit=100`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      let productsData = [];
      let total = 0;

      if (Array.isArray(response.data)) {
        productsData = response.data;
        total = productsData.length;
      } else if (
        response.data.products &&
        Array.isArray(response.data.products)
      ) {
        productsData = response.data.products;
        total = response.data.total || productsData.length;
      }

      setProducts(productsData);
      setTotalProducts(total);

      // Calculate total inventory value
      const totalInventoryValue = productsData.reduce(
        (sum, product) => sum + (product.price || 0) * (product.stock || 0),
        0,
      );
      setTotalValue(totalInventoryValue);
    } catch (error) {
      console.error("Error fetching products:", error);
      if (error.response?.status === 401) {
        alert("Please login to manage products");
      } else {
        alert(
          "Failed to fetch products: " +
            (error.response?.data?.detail || error.message),
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(`${API_BASE_URL}/products/categories`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      // Use default categories if API fails
      setCategories([
        "building",
        "paints",
        "hardware",
        "plumbing",
        "electrical",
        "general",
      ]);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.description &&
            product.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase())),
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory,
      );
    }

    setFilteredProducts(filtered);
  };

  const handleDelete = async (id, name) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      )
    ) {
      try {
        const token = localStorage.getItem("access_token");
        await axios.delete(`${API_BASE_URL}/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Product deleted successfully!");
        // Refresh the product list
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
        let errorMessage = "Failed to delete product";
        if (error.response?.status === 401) {
          errorMessage = "Please login to delete products";
        } else if (error.response?.data?.detail) {
          errorMessage = error.response.data.detail;
        }
        alert(errorMessage);
      }
    }
  };

  // Helper function to get image URL
  const getImageUrl = (fileImage) => {
    if (!fileImage) return null;
    if (fileImage.startsWith("http")) return fileImage;
    if (fileImage.startsWith("data:")) return fileImage;
    return `${API_BASE_URL}${fileImage}`;
  };

  const getCategoryName = (category) => {
    const categoriesMap = {
      building: "Building Materials",
      paints: "Paints",
      hardware: "Hardware Tools",
      plumbing: "Plumbing",
      electrical: "Electrical",
      general: "General Store",
    };
    return categoriesMap[category] || category || "Uncategorized";
  };

  const getCategoryIcon = (category) => {
    const icons = {
      building: "🧱",
      paints: "🎨",
      hardware: "🔧",
      plumbing: "🚰",
      electrical: "⚡",
      general: "🏪",
    };
    return icons[category] || "📦";
  };

  const getStockBadge = (stock) => {
    if (stock > 50) {
      return "bg-green-100 text-green-800 border-green-500";
    } else if (stock > 10) {
      return "bg-yellow-100 text-yellow-800 border-yellow-500";
    } else if (stock > 0) {
      return "bg-orange-100 text-orange-800 border-orange-500";
    } else {
      return "bg-red-100 text-red-800 border-red-500";
    }
  };

  const getStockText = (stock) => {
    if (stock > 50) return "In Stock";
    if (stock > 10) return "Low Stock";
    if (stock > 0) return "Very Low";
    return "Out of Stock";
  };

  const categoryOptions = [
    { id: "all", name: "All Categories", icon: "📦" },
    ...categories.map((cat) => ({
      id: cat,
      name: getCategoryName(cat),
      icon: getCategoryIcon(cat),
    })),
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terra mx-auto mb-4"></div>
          <p className="text-ash">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-terra border-4 border-black shadow-hard-sm mb-4">
            <FiPackage className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-h text-3xl md:text-4xl font-bold text-black uppercase mb-2">
            Manage Products
          </h1>
          <div className="brick-line mx-auto"></div>
          <p className="text-ash mt-2">
            View, edit, and manage your product inventory
          </p>
        </div>

        {/* Actions Bar */}
        <div className="bg-white border-4 border-black shadow-hard-sm p-4 mb-6">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <Link
              to="/admin/add-product"
              className="bg-terra text-white px-4 py-2 font-bold uppercase tracking-wider border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center space-x-2"
            >
              <FiPlus className="w-5 h-5" />
              <span>Add New Product</span>
            </Link>

            <div className="flex flex-wrap gap-3">
              {/* Refresh Button */}
              <button
                onClick={fetchProducts}
                className="px-3 py-2 border-2 border-black hover:bg-terra/10 transition-colors flex items-center space-x-2"
                title="Refresh products"
              >
                <FiRefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-terra bg-white"
              >
                {categoryOptions.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>

              {/* Search Bar */}
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ash" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-terra w-64"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white border-4 border-black shadow-hard-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y-2 divide-black">
              <thead className="bg-terra/10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-ash">
                      <FiPackage className="w-12 h-12 mx-auto mb-3 text-ash" />
                      <p className="font-h text-lg">No products found</p>
                      <p className="text-sm mt-1">
                        Try adjusting your search or add a new product
                      </p>
                      <Link
                        to="/admin/add-product"
                        className="inline-block mt-4 bg-terra text-white px-4 py-2 font-bold uppercase tracking-wider border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                      >
                        Add New Product
                      </Link>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-terra/5 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-ash">
                        {product.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 object-cover border-2 border-black"
                              src={
                                getImageUrl(product.file_image) ||
                                "https://placehold.co/400x400/D6B896/121518?text=Product"
                              }
                              alt={product.name}
                              onError={(e) => {
                                e.target.src =
                                  "https://placehold.co/400x400/D6B896/121518?text=Product";
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-black">
                              {product.name}
                            </div>
                            {product.description && (
                              <div className="text-xs text-ash truncate max-w-xs">
                                {product.description.substring(0, 50)}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-bold uppercase bg-terra/10 text-terra border border-terra inline-flex items-center space-x-1">
                          <span>{getCategoryIcon(product.category)}</span>
                          <span>{getCategoryName(product.category)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <FiDollarSign className="w-4 h-4 text-terra" />
                          <span className="text-sm font-bold text-terra">
                            KSh {product.price?.toLocaleString() || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-bold uppercase border ${getStockBadge(product.stock)}`}
                        >
                          {getStockText(product.stock)} ({product.stock})
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-3">
                          <Link
                            to={`/admin/edit-product/${product.id}`}
                            className="text-terra hover:text-terra-dark transition-colors"
                            title="Edit Product"
                          >
                            <FiEdit2 className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() =>
                              handleDelete(product.id, product.name)
                            }
                            className="text-red-600 hover:text-red-700 transition-colors"
                            title="Delete Product"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-white border-4 border-black shadow-hard-sm p-4 text-center">
            <FiPackage className="w-6 h-6 text-terra mx-auto mb-2" />
            <p className="text-ash text-xs uppercase tracking-wider">
              Total Products
            </p>
            <p className="font-h text-2xl font-bold text-black">
              {totalProducts}
            </p>
          </div>
          <div className="bg-white border-4 border-black shadow-hard-sm p-4 text-center">
            <FiShoppingBag className="w-6 h-6 text-terra mx-auto mb-2" />
            <p className="text-ash text-xs uppercase tracking-wider">
              Categories
            </p>
            <p className="font-h text-2xl font-bold text-black">
              {categories.length}
            </p>
          </div>
          <div className="bg-white border-4 border-black shadow-hard-sm p-4 text-center">
            <FiDollarSign className="w-6 h-6 text-terra mx-auto mb-2" />
            <p className="text-ash text-xs uppercase tracking-wider">
              Inventory Value
            </p>
            <p className="font-h text-2xl font-bold text-terra">
              KSh {totalValue.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Export/Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-ash">
            Showing {filteredProducts.length} of {totalProducts} products
            {selectedCategory !== "all" &&
              ` in ${getCategoryName(selectedCategory)}`}
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ManageProducts;
