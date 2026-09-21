import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import useCartStore from "../store/cartStore";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";
import {
  FaCartShopping,
  FaStar,
  FaTableCellsLarge,
  FaList,
  FaChevronLeft,
  FaChevronRight,
  FaEye,
  FaBagShopping,
} from "react-icons/fa6";
import api from "../api/client";
import { getImageUrl } from "../utils/image";
import { logError } from "../utils/logger";

const Products = () => {
  const { addToCart, addGuestItem } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState(
    () => searchParams.get("search") || "",
  );
  const [selectedCategory, setSelectedCategory] = useState(
    () => searchParams.get("category") || "all",
  );
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000000 });
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [addedToCart, setAddedToCart] = useState({});
  const [categories, setCategories] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const itemsPerPage = 12;

  const priceRanges = [
    { label: "All", min: 0, max: 1000000 },
    { label: "Under KSh 1,000", min: 0, max: 1000 },
    { label: "KSh 1,000 - KSh 5,000", min: 1000, max: 5000 },
    { label: "KSh 5,000 - KSh 10,000", min: 5000, max: 10000 },
    { label: "KSh 10,000 - KSh 50,000", min: 10000, max: 50000 },
    { label: "Over KSh 50,000", min: 50000, max: 1000000 },
  ];

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "name_asc", label: "Name: A to Z" },
    { value: "name_desc", label: "Name: Z to A" },
    { value: "rating", label: "Best Rating" },
    { value: "popular", label: "Most Popular" },
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/products/categories");
        const apiCategories = response.data;
        const formattedCategories = [
          { id: "all", name: "All Products" },
          ...apiCategories.map((cat) => ({
            id: cat,
            name: cat.charAt(0).toUpperCase() + cat.slice(1),
          })),
        ];
        setCategories(formattedCategories);
      } catch (error) {
        logError("Error fetching categories:", error);
        setCategories([{ id: "all", name: "All Products" }]);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const category = searchParams.get("category") || "";
    const search = searchParams.get("search") || "";
    setSelectedCategory(category || "all");
    setSearchTerm(search);
    setCurrentPage(1);
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedCategory === "all") {
      params.delete("category");
    } else {
      params.set("category", selectedCategory);
    }
    if (searchTerm) {
      params.set("search", searchTerm);
    } else {
      params.delete("search");
    }
    const qs = params.toString();
    if (qs !== searchParams.toString()) {
      setSearchParams(params, { replace: true });
    }
  }, [selectedCategory, searchTerm, searchParams, setSearchParams]);

  const fetchFilteredProducts = useCallback(async () => {
    try {
      const skip = (currentPage - 1) * itemsPerPage;
      let url = `/products/?skip=${skip}&limit=${itemsPerPage}&sort_by=${sortBy}`;

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

      const response = await api.get(url);

      return response.data;
    } catch (error) {
      logError("Error fetching products:", error);
      return { products: [], total: 0, total_pages: 0 };
    }
  }, [currentPage, itemsPerPage, sortBy, selectedCategory, searchTerm, priceRange]);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      const data = await fetchFilteredProducts();
      setProducts(data.products);
      setTotalProducts(data.total);
      setTotalPages(data.total_pages || 0);
      setIsLoading(false);
    };
    loadProducts();
  }, [fetchFilteredProducts]);

  const handleAddToCart = async (product) => {
    try {
      if (user) {
        await addToCart(product.id);
      } else {
        addGuestItem(product);
      }
      setAddedToCart({ [product.id]: true });
      setTimeout(() => setAddedToCart({}), 2000);
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  const handleBuyNow = async (product) => {
    if (user) {
      const result = await addToCart(product.id, 1);
      if (!result.success) {
        toast.error("Failed to add to cart");
        return;
      }
    } else {
      addGuestItem(product);
    }

    toast.success(`${product.name} added! Taking you to your cart...`);
    navigate("/cart");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setPriceRange({ min: 0, max: 1000000 });
    setSortBy("newest");
    setCurrentPage(1);
  };

  const displayProducts = products || [];
  const paginatedProducts = displayProducts;

  const getCategoryCount = (categoryId) => {
    if (categoryId === "all") return totalProducts;
    return products?.filter((p) => p.category === categoryId).length || 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm">
        <div className="mx-auto w-full max-w-[1600px] px-3 py-3 md:px-4 md:py-4">
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
      
      <div className="bg-terra text-white py-6 border-b-8 border-black">
        <div className="mx-auto w-full max-w-[1600px] px-4 text-center">
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

      
      <div className="mx-auto w-full max-w-[1600px] px-3 py-3 md:px-4 md:py-4">
        
        <div className="lg:hidden mb-4 sm:mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full bg-white border-4 border-black px-4 py-3 shadow-hard-sm flex items-center justify-between"
          >
            <span className="font-semibold">Filters & Sort</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          
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

              
              <div className="mb-6">
                <label className="block text-sm font-semibold text-black mb-3">
                  Categories
                </label>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-3 py-2 border-2 transition-colors flex items-center justify-between ${
                        selectedCategory === category.id
                          ? "bg-terra text-white border-terra"
                          : "border-transparent hover:border-terra hover:bg-terra/10"
                      }`}
                    >
                      <span>{category.name}</span>
                      <span className="text-xs">
                        {getCategoryCount(category.id)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              
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

                      </button>
                    )}
                    {selectedCategory !== "all" && (
                      <button
                        onClick={() => {
                          setSelectedCategory("all");
                          setCurrentPage(1);
                        }}
                        className="inline-flex items-center space-x-1 px-2 py-1 bg-terra/10 text-terra border border-terra text-sm"
                      >
                        <span>Category: {selectedCategory}</span>

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

                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          
          <div className="flex-1">
            
            <div className="bg-white border-4 border-black shadow-hard-sm p-4 mb-6">
              <div className="flex justify-end">
                <div className="flex items-center space-x-4">
                  
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

                  
                  <div className="flex border-2 border-black overflow-hidden">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 transition-colors ${
                        viewMode === "grid"
                          ? "bg-terra text-white"
                          : "hover:bg-terra/10"
                      }`}
                    >
                      <FaTableCellsLarge className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 transition-colors ${
                        viewMode === "list"
                          ? "bg-terra text-white"
                          : "hover:bg-terra/10"
                      }`}
                    >
                      <FaList className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            
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
                          <FaCartShopping className="w-5 h-5" />
                        </button>
                        <Link
                          to={`/product/${product.id}`}
                          className="p-2 bg-terra text-white border-2 border-black hover:bg-terra-dark"
                        >
                          <FaEye className="w-5 h-5" />
                        </Link>
                      </div>
                      <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2 md:hidden">
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="p-2 bg-terra text-white border-2 border-black text-xs"
                        >
                          <FaCartShopping className="w-4 h-4" />
                        </button>
                        <Link
                          to={`/product/${product.id}`}
                          className="p-2 bg-terra text-white border-2 border-black text-xs"
                        >
                          <FaEye className="w-4 h-4" />
                        </Link>
                      </div>
                      {product.stock < 10 && product.stock > 0 && (
                        <div className="absolute top-2 left-2 bg-terra text-white px-1.5 py-0.5 text-[10px] sm:text-xs font-bold uppercase border border-black">
                          Low Stock
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
                          <FaStar
                            key={i}
                            className={`w-3 h-3 sm:w-4 sm:h-4 ${i < Math.floor(product.rating || 0) ? "text-yellow-500 fill-current" : "text-gray-300"}`}
                          />
                        ))}
                        <span className="ml-1 sm:ml-2 text-xs sm:text-sm text-ash">
                          ({product.rating?.toFixed(1) || "0"})
                        </span>
                      </div>
                      <div className="flex gap-2 mt-2 sm:mt-3">
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="flex-1 px-3 py-2 bg-white text-terra font-bold uppercase text-xs sm:text-sm border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                        >
                          Add to Cart
                        </button>
                        <button
                          onClick={() => handleBuyNow(product)}
                          className="flex-1 px-3 py-2 bg-terra text-white font-bold uppercase text-xs sm:text-sm border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                        >
                          Buy Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            
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
                                <FaStar
                                  key={i}
                                  className={`w-4 h-4 ${i < Math.floor(product.rating || 0) ? "text-yellow-500 fill-current" : "text-gray-300"}`}
                                />
                              ))}
                              <span className="ml-2 text-sm text-ash">
                                Rating: {product.rating?.toFixed(1) || "0"}
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
                              <FaCartShopping className="w-5 h-5" />
                              <span>Add to Cart</span>
                            </button>
                            <button
                              onClick={() => handleBuyNow(product)}
                              className="px-6 py-2 bg-white text-terra border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center space-x-2"
                            >
                              <FaBagShopping className="w-5 h-5" />
                              <span>Buy Now</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex space-x-1 sm:space-x-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 sm:px-4 py-2 border-4 border-black hover:bg-terra/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaChevronLeft className="w-5 h-5" />
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
                    <FaChevronRight className="w-5 h-5" />
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
