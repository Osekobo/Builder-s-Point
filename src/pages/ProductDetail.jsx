import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import useProductStore from "../store/productStore";
import useCartStore from "../store/cartStore";
import useAuthStore from "../store/authStore";
import axios from "axios";
import {
  FiShoppingCart,
  FiStar,
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiHeart,
  FiShare2,
  FiMinus,
  FiPlus,
  FiChevronLeft,
  FiMapPin,
  FiClock,
  FiCheckCircle,
  FiChevronRight,
} from "react-icons/fi";

const API_BASE_URL = "http://localhost:8000";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, isLoading, fetchProducts } = useProductStore();
  const { addToCart } = useCartStore();
  const { user } = useAuthStore();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stockStatus, setStockStatus] = useState("loading");

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(`${API_BASE_URL}/products/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setProduct(response.data);

      // Update stock status
      if (response.data.stock > 0) {
        setStockStatus("in-stock");
      } else {
        setStockStatus("out-of-stock");
      }

      // Fetch related products from the same category
      if (response.data.category) {
        await fetchRelatedProducts(response.data.category, response.data.id);
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      if (error.response?.status === 404) {
        toast.error("Product not found");
        navigate("/products");
      } else {
        toast.error("Failed to load product details");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (category, currentProductId) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        `${API_BASE_URL}/products/?category=${category}&limit=10`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );

      // Filter out current product and limit to 10 items
      const related = response.data.products.filter(
        (p) => p.id !== currentProductId,
      );
      setRelatedProducts(related.slice(0, 10));
    } catch (error) {
      console.error("Error fetching related products:", error);
      setRelatedProducts([]);
    }
  };

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 10)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }
    try {
      await addToCart(product.id, quantity);
      toast.success(`Added ${quantity} × ${product.name} to cart!`);
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  const handleRelatedProductClick = (productId) => {
    navigate(`/product/${productId}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Reload the product details
    setTimeout(() => {
      fetchProductDetails();
    }, 100);
  };

  const toggleWishlist = () => {
    if (!user) {
      toast.error("Please login to add to wishlist");
      navigate("/login");
      return;
    }
    setInWishlist(!inWishlist);
    if (!inWishlist) {
      toast.success("Added to wishlist!");
    } else {
      toast.success("Removed from wishlist!");
    }
  };

  // Helper function to get image URL
  const getImageUrl = (fileImage) => {
    if (!fileImage) return null;
    // If it's a full URL, use as is
    if (fileImage.startsWith("http")) return fileImage;
    // If it's a data URL, use as is
    if (fileImage.startsWith("data:")) return fileImage;
    // Otherwise, prepend the backend URL
    return `${API_BASE_URL}${fileImage}`;
  };

  // Get all product images (main image + any additional images)
  const getProductImages = () => {
    const images = [];

    // Add main product image
    if (product?.file_image) {
      images.push(getImageUrl(product.file_image));
    }

    // If no images found, add placeholder
    if (images.length === 0) {
      images.push(
        `https://placehold.co/600x600/D6B896/121518?text=${(product?.name || "Product").substring(0, 15)}`,
      );
    }

    return images;
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-warm flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terra mx-auto mb-4"></div>
          <p className="text-ash">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-warm flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="font-h text-2xl font-bold text-black mb-2">
            Product Not Found
          </h2>
          <p className="text-ash mb-4">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/products"
            className="inline-block bg-terra text-white px-6 py-3 font-bold uppercase tracking-wider border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const productImages = getProductImages();

  // Get category display name
  const getCategoryName = (category) => {
    const categories = {
      building: "Building Materials",
      paints: "Paints",
      hardware: "Hardware Tools",
      plumbing: "Plumbing",
      electrical: "Electrical",
      general: "General Store",
    };
    return (
      categories[category] ||
      category?.charAt(0).toUpperCase() + category?.slice(1) ||
      "Product"
    );
  };

  // Scroll related products horizontally
  const scrollRelated = (direction) => {
    const container = document.getElementById("related-products-scroll");
    if (container) {
      const scrollAmount = 300;
      if (direction === "left") {
        container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };

  return (
    <div className="min-h-screen bg-warm">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#E04E00",
              secondary: "#fff",
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: "#EF4444",
              secondary: "#fff",
            },
          },
        }}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center space-x-2 text-black hover:text-terra transition-colors group"
        >
          <FiChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold">Back to Products</span>
        </button>

        <div className="bg-white border-4 border-black shadow-hard-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
            {/* Product Images */}
            <div>
              <div className="mb-4 overflow-hidden border-4 border-black bg-sand/20">
                <img
                  src={productImages[selectedImage]}
                  alt={product.name}
                  className="w-full h-96 object-cover hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = `https://placehold.co/600x600/D6B896/121518?text=${(product.name || "Product").substring(0, 15)}`;
                  }}
                />
              </div>
              {productImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {productImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`overflow-hidden border-4 transition-all ${
                        selectedImage === index
                          ? "border-terra"
                          : "border-black hover:border-terra/50"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-24 object-cover"
                        onError={(e) => {
                          e.target.src = `https://placehold.co/200x200/D6B896/121518?text=Image`;
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <div className="mb-4">
                {/* Category Badge */}
                <div className="inline-block mb-3">
                  <span className="bg-terra/10 text-terra text-xs font-bold uppercase tracking-wider px-3 py-1 border border-terra">
                    {getCategoryName(product.category)}
                  </span>
                </div>

                <h1 className="font-h text-3xl lg:text-4xl font-bold text-black mb-2">
                  {product.name}
                </h1>

                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(product.rating || 0)
                            ? "text-yellow-500 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-ash">
                      ({product.rating?.toFixed(1) || "0"} reviews)
                    </span>
                  </div>
                  {product.stock > 0 && (
                    <div className="flex items-center text-green-600">
                      <FiCheckCircle className="w-4 h-4 mr-1" />
                      <span className="text-sm font-semibold">In Stock</span>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <span className="font-h text-3xl font-bold text-terra">
                    KSh {product.price?.toLocaleString() || 0}
                  </span>
                  {product.old_price && (
                    <span className="ml-2 text-lg text-ash line-through">
                      KSh {product.old_price.toLocaleString()}
                    </span>
                  )}
                </div>

                <p className="text-ash leading-relaxed mb-6">
                  {product.description}
                </p>

                {/* Additional Product Details */}
                {product.subcategory && (
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <span className="text-sm text-ash">
                      <strong>Subcategory:</strong> {product.subcategory}
                    </span>
                  </div>
                )}

                {/* Quantity Selector */}
                {product.stock > 0 && (
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-black uppercase tracking-wider mb-2">
                      Quantity
                    </label>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="p-2 border-4 border-black bg-white hover:bg-terra/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <FiMinus className="w-5 h-5" />
                      </button>
                      <span className="text-xl font-bold w-12 text-center text-black">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= product.stock}
                        className="p-2 border-4 border-black bg-white hover:bg-terra/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <FiPlus className="w-5 h-5" />
                      </button>
                      <span className="text-sm text-ash ml-2">
                        {product.stock} available
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="flex-1 bg-terra text-white py-3 font-bold uppercase tracking-wider border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <FiShoppingCart className="w-5 h-5" />
                    <span>
                      {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                    </span>
                  </button>
                  <button
                    onClick={toggleWishlist}
                    className={`px-6 py-3 font-bold uppercase tracking-wider border-4 transition-all flex items-center justify-center space-x-2 ${
                      inWishlist
                        ? "bg-terra text-white border-terra"
                        : "border-black hover:border-terra hover:text-terra"
                    }`}
                  >
                    <FiHeart
                      className={`w-5 h-5 ${inWishlist ? "fill-current" : ""}`}
                    />
                    <span>
                      {inWishlist ? "In Wishlist" : "Add to Wishlist"}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      const productUrl = window.location.href;
                      const shareText = `Check out this product: ${product.name}!\n\nPrice: KSh ${product.price?.toLocaleString()}\n\n${productUrl}`;
                      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
                      window.open(whatsappUrl, "_blank");
                    }}
                    className="px-6 py-3 font-bold uppercase tracking-wider border-4 border-black hover:border-terra hover:text-terra transition-all flex items-center justify-center space-x-2"
                  >
                    <FiShare2 className="w-5 h-5" />
                    <span>Share</span>
                  </button>
                </div>

                {/* Delivery & Payment Info */}
                <div className="border-t-4 border-black pt-6 space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-terra/10 p-2 border border-terra">
                      <FiTruck className="w-5 h-5 text-terra" />
                    </div>
                    <span className="text-sm text-black font-semibold">
                      Free delivery on orders over KSh 5,000
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-terra/10 p-2 border border-terra">
                      <FiShield className="w-5 h-5 text-terra" />
                    </div>
                    <span className="text-sm text-black font-semibold">
                      Secure payment with M-Pesa
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-terra/10 p-2 border border-terra">
                      <FiRefreshCw className="w-5 h-5 text-terra" />
                    </div>
                    <span className="text-sm text-black font-semibold">
                      30-day money-back guarantee
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-terra/10 p-2 border border-terra">
                      <FiMapPin className="w-5 h-5 text-terra" />
                    </div>
                    <span className="text-sm text-black font-semibold">
                      Located on A1 Highway, Migori
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-terra/10 p-2 border border-terra">
                      <FiClock className="w-5 h-5 text-terra" />
                    </div>
                    <span className="text-sm text-black font-semibold">
                      Same-day pickup available
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section - Horizontal Scrollable */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <div className="text-center mb-6">
              <h2 className="font-h text-2xl md:text-3xl font-bold text-black uppercase mb-2">
                You Might Also Like
              </h2>
              <div className="brick-line mx-auto"></div>
              <p className="text-ash mt-2">Products from the same category</p>
            </div>

            <div className="relative group">
              {/* Left Scroll Button */}
              {relatedProducts.length > 3 && (
                <button
                  onClick={() => scrollRelated("left")}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border-4 border-black shadow-hard-sm p-2 hover:bg-terra hover:text-white transition-all -ml-4 hidden md:flex items-center justify-center"
                >
                  <FiChevronLeft className="w-6 h-6" />
                </button>
              )}

              {/* Horizontal Scrollable Container */}
              <div
                id="related-products-scroll"
                className="flex overflow-x-auto gap-4 pb-4 scroll-smooth"
                style={{ scrollbarWidth: "thin", overflowX: "auto" }}
              >
                {relatedProducts.map((relatedProduct) => (
                  <div
                    key={relatedProduct.id}
                    onClick={() => handleRelatedProductClick(relatedProduct.id)}
                    className="flex-shrink-0 w-64 bg-white border-4 border-black shadow-hard-sm overflow-hidden hover:-translate-y-2 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="relative overflow-hidden h-48 border-b-4 border-black">
                      <img
                        src={
                          getImageUrl(relatedProduct.file_image) ||
                          `https://placehold.co/400x400/D6B896/121518?text=${(relatedProduct.name || "Product").substring(0, 15)}`
                        }
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = `https://placehold.co/400x400/D6B896/121518?text=${(relatedProduct.name || "Product").substring(0, 15)}`;
                        }}
                      />
                      {relatedProduct.stock < 10 &&
                        relatedProduct.stock > 0 && (
                          <div className="absolute top-2 left-2 bg-terra text-white px-1.5 py-0.5 text-[10px] font-bold uppercase border border-black">
                            Low Stock
                          </div>
                        )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-h font-bold text-sm text-black mb-1 line-clamp-1">
                        {relatedProduct.name}
                      </h3>
                      <p className="text-ash text-xs mb-2 line-clamp-2">
                        {relatedProduct.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="font-h font-bold text-sm text-terra">
                          KSh {relatedProduct.price?.toLocaleString() || 0}
                        </span>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <FiStar
                              key={i}
                              className={`w-3 h-3 ${i < Math.floor(relatedProduct.rating || 0) ? "text-yellow-500 fill-current" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-ash">
                        Stock: {relatedProduct.stock || 0} units
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Scroll Button */}
              {relatedProducts.length > 3 && (
                <button
                  onClick={() => scrollRelated("right")}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border-4 border-black shadow-hard-sm p-2 hover:bg-terra hover:text-white transition-all -mr-4 hidden md:flex items-center justify-center"
                >
                  <FiChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* If no related products */}
        {relatedProducts.length === 0 && !loading && (
          <div className="mt-12">
            <div className="text-center mb-6">
              <h2 className="font-h text-2xl md:text-3xl font-bold text-black uppercase mb-2">
                You Might Also Like
              </h2>
              <div className="brick-line mx-auto"></div>
            </div>
            <div className="bg-white border-4 border-black shadow-hard-sm p-8 text-center">
              <p className="text-ash">
                More products from this category coming soon!
              </p>
              <Link
                to="/products"
                className="inline-block mt-4 bg-terra text-white px-6 py-2 font-bold uppercase tracking-wider border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                Browse All Products
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
