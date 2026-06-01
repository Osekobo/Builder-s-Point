import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useProductStore from "../store/productStore";
import useCartStore from "../store/cartStore";
import useAuthStore from "../store/authStore";
import {
  FiShoppingCart,
  FiStar,
  FiGrid,
  FiList,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiHeart,
  FiEye,
  FiX,
  FiSliders,
  FiSearch,
} from "react-icons/fi";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

const Products = () => {
  const { products, isLoading, fetchProducts } = useProductStore();
  const { addToCart } = useCartStore();
  const { user } = useAuthStore();

  // State for filters and sorting
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000000 });
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [addedToCart, setAddedToCart] = useState({});
  const [wishlist, setWishlist] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const itemsPerPage = 12;

  // Categories with icons
  const categoryIcons = {
    building: "🧱",
    paints: "🎨",
    hardware: "🔧",
    plumbing: "🚰",
    electrical: "⚡",
    general: "🏪",
  };

  // Default categories if API doesn't return any
  const defaultCategories = [{ id: "all", name: "All Products", icon: "📦" }];

  // Price ranges for filtering
  const priceRanges = [
    { label: "All", min: 0, max: 1000000 },
    { label: "Under KSh 1,000", min: 0, max: 1000 },
    { label: "KSh 1,000 - KSh 5,000", min: 1000, max: 5000 },
    { label: "KSh 5,000 - KSh 10,000", min: 5000, max: 10000 },
    { label: "KSh 10,000 - KSh 50,000", min: 10000, max: 50000 },
    { label: "Over KSh 50,000", min: 50000, max: 1000000 },
  ];

  // Sort options matching backend
  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "name_asc", label: "Name: A to Z" },
    { value: "name_desc", label: "Name: Z to A" },
    { value: "rating", label: "Best Rating" },
    { value: "popular", label: "Most Popular" },
  ];

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await axios.get(
          `${API_BASE_URL}/products/categories`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          },
        );
        const apiCategories = response.data;
        // Transform categories to match our format
        const formattedCategories = [
          { id: "all", name: "All Products", icon: "📦" },
          ...apiCategories.map((cat) => ({
            id: cat,
            name: cat.charAt(0).toUpperCase() + cat.slice(1),
            icon: categoryIcons[cat] || "📦",
          })),
        ];
        setCategories(formattedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories(defaultCategories);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products with filters
  const fetchFilteredProducts = async () => {
    try {
      const skip = (currentPage - 1) * itemsPerPage;
      let url = `${API_BASE_URL}/products/?skip=${skip}&limit=${itemsPerPage}&sort_by=${sortBy}`;

      if (selectedCategory !== "all") {
        url += `&category=${selectedCategory}`;
      }
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      if (priceRange.min > 0) {
        url += `&min_price=${priceRange.min}`;
      }
      if (priceRange.max < 1000000) {
        url += `&max_price=${priceRange.max}`;
      }

      const token = localStorage.getItem("access_token");
      const response = await axios.get(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching products:", error);
      return { products: [], total: 0, total_pages: 0 };
    }
  };

  // Load products when filters change
  useEffect(() => {
    const loadProducts = async () => {
      const data = await fetchFilteredProducts();
      // Update the store with fetched products
      if (useProductStore.getState().setProducts) {
        useProductStore.getState().setProducts(data.products);
      }
      setTotalProducts(data.total);
      setTotalPages(data.total_pages || 0);
    };
    loadProducts();
  }, [currentPage, selectedCategory, searchTerm, priceRange, sortBy]);

  // Initial load
  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddToCart = async (product) => {
    if (!user) {
      alert("Please login to add items to cart");
      return;
    }
    try {
      await addToCart(product.id);
      setAddedToCart({ [product.id]: true });
      setTimeout(() => setAddedToCart({}), 2000);
    } catch (error) {
      alert("Failed to add to cart");
    }
  };

  const toggleWishlist = (productId) => {
    if (!user) {
      alert("Please login to add to wishlist");
      return;
    }
    if (wishlist.includes(productId)) {
      setWishlist(wishlist.filter((id) => id !== productId));
    } else {
      setWishlist([...wishlist, productId]);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setPriceRange({ min: 0, max: 1000000 });
    setSortBy("newest");
    setCurrentPage(1);
  };

  // Get paginated products (use store products or fetched products)
  const displayProducts = products || [];
  const paginatedProducts = displayProducts;

  // Calculate category counts
  const getCategoryCount = (categoryId) => {
    if (categoryId === "all") return totalProducts;
    return products?.filter((p) => p.category === categoryId).length || 0;
  };

  // Helper function to get image URL
  const getImageUrl = (fileImage) => {
    if (!fileImage) return null;
    // If it's a full URL, use as is
    if (fileImage.startsWith("http")) return fileImage;
    // Otherwise, prepend the backend URL
    return `${API_BASE_URL}${fileImage}`;
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white border-4 border-black shadow-hard-sm overflow-hidden"
                >
                  <div className="h-48 sm:h-56 md:h-64 bg-gray-200"></div>
                  <div className="p-3 sm:p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm">
      {/* Page Header */}
      <div className="bg-terra text-white py-8 border-b-8 border-black">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-h text-3xl sm:text-4xl md:text-5xl font-bold uppercase mb-3">
            Browse Our Collection
          </h1>
          <div className="brick-line mx-auto mb-3"></div>
          <p className="text-base sm:text-lg opacity-90 max-w-2xl mx-auto">
            Discover quality building materials, premium paints, hardware tools,
            and more at affordable prices
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="sticky top-16 z-30 bg-warm py-4 border-b-4 border-black shadow-hard-sm">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-ash w-5 h-5" />
              <input
                type="text"
                placeholder="Search for cement, paint, tools, plumbing and more..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-12 pr-4 py-3 border-4 border-black focus:outline-none focus:ring-2 focus:ring-terra text-base"
              />
            </div>
            {searchTerm && (
              <div className="text-center mt-2">
                <p className="text-sm text-ash">
                  Found {totalProducts}{" "}
                  {totalProducts === 1 ? "result" : "results"} for "{searchTerm}
                  "
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-4 sm:mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full bg-white border-4 border-black px-4 py-3 shadow-hard-sm flex items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <FiSliders className="w-5 h-5 text-terra" />
              <span className="font-semibold">Filters & Sort</span>
            </div>
            <FiChevronDown
              className={`w-5 h-5 transition-transform ${showFilters ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar Filters */}
          <div
            className={`lg:w-80 ${showFilters ? "block" : "hidden lg:block"}`}
          >
            <div className="bg-white border-4 border-black shadow-hard-sm p-4 sm:p-6 sticky top-36">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-h text-xl font-bold text-black uppercase">
                  Filters
                </h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-terra hover:text-terra-dark font-semibold"
                >
                  Clear All
                </button>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-black mb-3">
                  Categories
                </label>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2 border-2 transition-colors flex items-center justify-between ${
                        selectedCategory === category.id
                          ? "bg-terra text-white border-terra"
                          : "border-transparent hover:border-terra hover:bg-terra/10"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span>{category.icon}</span>
                        <span>{category.name}</span>
                      </div>
                      <span className="text-xs">
                        {getCategoryCount(category.id)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-black mb-3">
                  Price Range
                </label>
                <div className="space-y-2">
                  {priceRanges.map((range, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        setPriceRange({ min: range.min, max: range.max })
                      }
                      className={`w-full text-left px-3 py-2 border-2 transition-colors ${
                        priceRange.min === range.min &&
                        priceRange.max === range.max
                          ? "bg-terra text-white border-terra"
                          : "border-transparent hover:border-terra hover:bg-terra/10"
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>

                {/* Custom Range */}
                <div className="mt-4 space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) =>
                        setPriceRange({
                          ...priceRange,
                          min: Number(e.target.value),
                        })
                      }
                      className="w-1/2 px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-terra"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) =>
                        setPriceRange({
                          ...priceRange,
                          max: Number(e.target.value),
                        })
                      }
                      className="w-1/2 px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-terra"
                    />
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              {(searchTerm ||
                selectedCategory !== "all" ||
                priceRange.min > 0 ||
                priceRange.max < 1000000) && (
                <div className="mt-6 pt-6 border-t-2 border-black">
                  <h3 className="text-sm font-semibold text-black mb-3">
                    Active Filters
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="inline-flex items-center space-x-1 px-2 py-1 bg-terra/10 text-terra border border-terra text-sm"
                      >
                        <span>Search: {searchTerm}</span>
                        <FiX className="w-3 h-3" />
                      </button>
                    )}
                    {selectedCategory !== "all" && (
                      <button
                        onClick={() => setSelectedCategory("all")}
                        className="inline-flex items-center space-x-1 px-2 py-1 bg-terra/10 text-terra border border-terra text-sm"
                      >
                        <span>Category: {selectedCategory}</span>
                        <FiX className="w-3 h-3" />
                      </button>
                    )}
                    {(priceRange.min > 0 || priceRange.max < 1000000) && (
                      <button
                        onClick={() => setPriceRange({ min: 0, max: 1000000 })}
                        className="inline-flex items-center space-x-1 px-2 py-1 bg-terra/10 text-terra border border-terra text-sm"
                      >
                        <span>
                          Price: KSh {priceRange.min} - {priceRange.max}
                        </span>
                        <FiX className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Toolbar with Sort and View Toggle */}
            <div className="bg-white border-4 border-black shadow-hard-sm p-4 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-ash font-semibold text-sm sm:text-base">
                  Showing{" "}
                  {paginatedProducts.length > 0
                    ? (currentPage - 1) * itemsPerPage + 1
                    : 0}{" "}
                  -{" "}
                  {Math.min(
                    (currentPage - 1) * itemsPerPage + itemsPerPage,
                    totalProducts,
                  )}{" "}
                  of {totalProducts} products
                </div>

                <div className="flex items-center space-x-4">
                  {/* Sort Dropdown */}
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-3 sm:px-4 py-2 text-sm sm:text-base border-2 border-black focus:outline-none focus:ring-2 focus:ring-terra"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  {/* View Toggle */}
                  <div className="flex border-2 border-black overflow-hidden">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 transition-colors ${
                        viewMode === "grid"
                          ? "bg-terra text-white"
                          : "hover:bg-terra/10"
                      }`}
                    >
                      <FiGrid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 transition-colors ${
                        viewMode === "list"
                          ? "bg-terra text-white"
                          : "hover:bg-terra/10"
                      }`}
                    >
                      <FiList className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* No Results */}
            {paginatedProducts.length === 0 && (
              <div className="bg-white border-4 border-black shadow-hard-sm p-8 sm:p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="font-h text-xl font-bold text-black mb-2">
                  No products found
                </h3>
                <p className="text-ash mb-4">
                  Try adjusting your filters or search terms
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 bg-terra text-white border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Products Display - Grid View */}
            {viewMode === "grid" && paginatedProducts.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                {paginatedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group bg-white border-4 border-black shadow-hard-sm overflow-hidden hover:-translate-y-2 transition-all duration-300"
                    onMouseEnter={() => setHoveredProduct(product.id)}
                    onMouseLeave={() => setHoveredProduct(null)}
                  >
                    <div className="relative overflow-hidden aspect-square border-b-4 border-black">
                      <img
                        src={
                          getImageUrl(product.file_image) ||
                          `https://placehold.co/400x400/D6B896/121518?text=${(product.name || "Product").substring(0, 15)}`
                        }
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = `https://placehold.co/400x400/D6B896/121518?text=${(product.name || "Product").substring(0, 15)}`;
                        }}
                      />
                      <div
                        className={`absolute inset-0 bg-black/60 items-center justify-center space-x-3 transition-opacity duration-300 ${hoveredProduct === product.id ? "md:flex" : "md:hidden"} hidden`}
                      >
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="p-2 bg-terra text-white border-2 border-black hover:bg-terra-dark"
                        >
                          <FiShoppingCart className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => toggleWishlist(product.id)}
                          className={`p-2 border-2 transition-colors ${wishlist.includes(product.id) ? "bg-terra text-white border-terra" : "bg-white text-terra border-black hover:bg-terra hover:text-white"}`}
                        >
                          <FiHeart className="w-5 h-5" />
                        </button>
                        <Link
                          to={`/product/${product.id}`}
                          className="p-2 bg-terra text-white border-2 border-black hover:bg-terra-dark"
                        >
                          <FiEye className="w-5 h-5" />
                        </Link>
                      </div>
                      <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2 md:hidden">
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="p-2 bg-terra text-white border-2 border-black text-xs"
                        >
                          <FiShoppingCart className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleWishlist(product.id)}
                          className={`p-2 border-2 text-xs ${wishlist.includes(product.id) ? "bg-terra text-white border-terra" : "bg-white text-terra border-black"}`}
                        >
                          <FiHeart className="w-4 h-4" />
                        </button>
                        <Link
                          to={`/product/${product.id}`}
                          className="p-2 bg-terra text-white border-2 border-black text-xs"
                        >
                          <FiEye className="w-4 h-4" />
                        </Link>
                      </div>
                      {product.stock < 10 && product.stock > 0 && (
                        <div className="absolute top-2 left-2 bg-terra text-white px-1.5 py-0.5 text-[10px] sm:text-xs font-bold uppercase border border-black">
                          Low Stock
                        </div>
                      )}
                      {wishlist.includes(product.id) && (
                        <div className="absolute top-2 right-2 bg-terra text-white px-1.5 py-0.5 text-[10px] sm:text-xs font-bold uppercase border border-black">
                          Wishlist
                        </div>
                      )}
                    </div>
                    <div className="p-2 sm:p-3 md:p-4">
                      <h3 className="font-h font-bold text-sm sm:text-base md:text-lg text-black mb-1 line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-ash text-xs sm:text-sm mb-2 line-clamp-2 hidden sm:block">
                        {product.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="font-h font-bold text-sm sm:text-base md:text-2xl text-terra">
                          KSh {product.price?.toLocaleString() || 0}
                        </span>
                        {addedToCart[product.id] && (
                          <span className="text-green-600 text-xs sm:text-sm font-semibold animate-bounce">
                            Added!
                          </span>
                        )}
                      </div>
                      <div className="flex items-center mt-1 sm:mt-2">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            className={`w-3 h-3 sm:w-4 sm:h-4 ${i < Math.floor(product.rating || 0) ? "text-yellow-500 fill-current" : "text-gray-300"}`}
                          />
                        ))}
                        <span className="ml-1 sm:ml-2 text-xs sm:text-sm text-ash">
                          ({product.rating?.toFixed(1) || "0"})
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Products Display - List View */}
            {viewMode === "list" && paginatedProducts.length > 0 && (
              <div className="space-y-4">
                {paginatedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white border-4 border-black shadow-hard-sm overflow-hidden"
                  >
                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-48 h-48 relative overflow-hidden border-b-4 sm:border-b-0 sm:border-r-4 border-black">
                        <img
                          src={
                            getImageUrl(product.file_image) ||
                            `https://placehold.co/200x200/D6B896/121518?text=${(product.name || "Product").substring(0, 10)}`
                          }
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = `https://placehold.co/200x200/D6B896/121518?text=${(product.name || "Product").substring(0, 10)}`;
                          }}
                        />
                        {product.stock < 10 && product.stock > 0 && (
                          <div className="absolute top-2 left-2 bg-terra text-white px-2 py-1 text-xs font-bold uppercase border border-black">
                            Low Stock
                          </div>
                        )}
                      </div>
                      <div className="flex-1 p-6">
                        <div className="flex justify-between items-start flex-wrap gap-4">
                          <div className="flex-1">
                            <h3 className="font-h text-xl font-bold text-black mb-2">
                              {product.name}
                            </h3>
                            <p className="text-ash mb-4">
                              {product.description}
                            </p>
                            <div className="flex items-center mb-4">
                              {[...Array(5)].map((_, i) => (
                                <FiStar
                                  key={i}
                                  className={`w-4 h-4 ${i < Math.floor(product.rating || 0) ? "text-yellow-500 fill-current" : "text-gray-300"}`}
                                />
                              ))}
                              <span className="ml-2 text-sm text-ash">
                                ({product.rating?.toFixed(1) || "0"} reviews)
                              </span>
                            </div>
                            <div className="font-h text-2xl font-bold text-terra">
                              KSh {product.price?.toLocaleString() || 0}
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <button
                              onClick={() => handleAddToCart(product)}
                              className="px-6 py-2 bg-terra text-white border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center space-x-2"
                            >
                              <FiShoppingCart className="w-5 h-5" />
                              <span>Add to Cart</span>
                            </button>
                            <button
                              onClick={() => toggleWishlist(product.id)}
                              className={`px-6 py-2 border-4 transition-colors flex items-center space-x-2 ${wishlist.includes(product.id) ? "bg-terra text-white border-terra" : "border-black hover:bg-terra hover:text-white"}`}
                            >
                              <FiHeart
                                className={`w-5 h-5 ${wishlist.includes(product.id) ? "fill-current" : ""}`}
                              />
                              <span>
                                {wishlist.includes(product.id)
                                  ? "In Wishlist"
                                  : "Add to Wishlist"}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex space-x-1 sm:space-x-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 sm:px-4 py-2 border-4 border-black hover:bg-terra/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiChevronLeft className="w-5 h-5" />
                  </button>
                  {[...Array(Math.min(totalPages, 7))].map((_, i) => {
                    let pageNumber;
                    if (totalPages <= 7) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 4) {
                      pageNumber = i + 1;
                      if (i === 6) pageNumber = totalPages;
                    } else if (currentPage >= totalPages - 3) {
                      pageNumber = totalPages - 6 + i;
                    } else {
                      pageNumber = currentPage - 3 + i;
                    }

                    if (pageNumber > 0 && pageNumber <= totalPages) {
                      if (i === 5 && totalPages > 7 && currentPage <= 4) {
                        return (
                          <span key="dots1" className="px-2 py-2">
                            ...
                          </span>
                        );
                      }
                      if (
                        i === 1 &&
                        totalPages > 7 &&
                        currentPage >= totalPages - 3
                      ) {
                        return (
                          <span key="dots2" className="px-2 py-2">
                            ...
                          </span>
                        );
                      }
                      if (
                        i === 3 &&
                        totalPages > 7 &&
                        currentPage > 4 &&
                        currentPage < totalPages - 3
                      ) {
                        return (
                          <span key="dots3" className="px-2 py-2">
                            ...
                          </span>
                        );
                      }

                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`px-3 sm:px-4 py-2 border-4 transition-colors ${currentPage === pageNumber ? "bg-terra text-white border-terra" : "border-black hover:bg-terra/10"}`}
                        >
                          {pageNumber}
                        </button>
                      );
                    }
                    return null;
                  })}
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 sm:px-4 py-2 border-4 border-black hover:bg-terra/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
