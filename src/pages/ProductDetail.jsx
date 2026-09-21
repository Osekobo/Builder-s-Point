import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useProductStore from "../store/productStore";
import useCartStore from "../store/cartStore";
import useAuthStore from "../store/authStore";
import { getProduct, getProducts } from "../api/products";
import { getImageUrl } from "../utils/image";
import { logError } from "../utils/logger";
import {
  FaCartShopping,
  FaStar,
  FaShieldHalved,
  FaShareNodes,
  FaMinus,
  FaPlus,
  FaChevronLeft,
  FaCircleCheck,
  FaChevronRight,
} from "react-icons/fa6";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoading } = useProductStore();
  const { addToCart, addGuestItem } = useCartStore();
  const { user } = useAuthStore();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const fetchRelatedProducts = useCallback(async (category, currentProductId) => {
    try {
      const response = await getProducts({ category, limit: 10 });
      const related = response.data.products.filter(
        (p) => p.id !== currentProductId,
      );
      setRelatedProducts(related.slice(0, 10));
    } catch (error) {
      logError("Error fetching related products:", error);
      setRelatedProducts([]);
    }
  }, []);

  const fetchProductDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getProduct(id);
      setProduct(response.data);

      if (response.data.category) {
        await fetchRelatedProducts(response.data.category, response.data.id);
      }
    } catch (error) {
      logError("Error fetching product details:", error);
      if (error.response?.status === 404) {
        toast.error("Product not found");
        navigate("/products");
      } else {
        toast.error("Failed to load product details");
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate, fetchRelatedProducts]);

  useEffect(() => {
    fetchProductDetails();
  }, [fetchProductDetails]);

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 10)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    try {
      if (user) {
        await addToCart(product.id, quantity);
      } else {
        addGuestItem(product, quantity);
      }
      toast.success(`Added ${quantity} × ${product.name} to cart!`);
    } catch {
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
      <div className="mx-auto w-full max-w-[1600px] px-3 py-3 md:px-4 md:py-4">

        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center space-x-2 text-black hover:text-terra transition-colors group"
        >
          <FaChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold">Back to Products</span>
        </button>

        <div className="bg-white border-4 border-black shadow-hard-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
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

            <div>
              <div className="mb-4">
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
                      <FaStar
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(product.rating || 0)
                            ? "text-yellow-500 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-ash">
                      Rating: {product.rating?.toFixed(1) || "0"}
                    </span>
                  </div>
                  {product.stock > 0 && (
                    <div className="flex items-center text-green-600">
                      <FaCircleCheck className="w-4 h-4 mr-1" />
                      <span className="text-sm font-semibold">In Stock</span>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <span className="font-h text-3xl font-bold text-terra">
                    KSh {product.price?.toLocaleString() || 0}
                  </span>
                </div>

                <p className="text-ash leading-relaxed mb-6">
                  {product.description}
                </p>

                {product.subcategory && (
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <span className="text-sm text-ash">
                      <strong>Subcategory:</strong> {product.subcategory}
                    </span>
                  </div>
                )}

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
                        <FaMinus className="w-5 h-5" />
                      </button>
                      <span className="text-xl font-bold w-12 text-center text-black">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= product.stock}
                        className="p-2 border-4 border-black bg-white hover:bg-terra/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <FaPlus className="w-5 h-5" />
                      </button>
                      <span className="text-sm text-ash ml-2">
                        {product.stock} available
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="flex-1 bg-terra text-white py-3 font-bold uppercase tracking-wider border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <FaCartShopping className="w-5 h-5" />
                    <span>
                      {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
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
                    <FaShareNodes className="w-5 h-5" />
                    <span>Share</span>
                  </button>
                </div>

                <div className="border-t-4 border-black pt-6 space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-terra/10 p-2 border border-terra">
                      <FaShieldHalved className="w-5 h-5 text-terra" />
                    </div>
                    <span className="text-sm text-black font-semibold">
                      Secure payment with M-Pesa
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

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
              {relatedProducts.length > 3 && (
                <button
                  onClick={() => scrollRelated("left")}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border-4 border-black shadow-hard-sm p-2 hover:bg-terra hover:text-white transition-all -ml-4 hidden md:flex items-center justify-center"
                >
                  <FaChevronLeft className="w-6 h-6" />
                </button>
              )}

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
                            <FaStar
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

              {relatedProducts.length > 3 && (
                <button
                  onClick={() => scrollRelated("right")}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border-4 border-black shadow-hard-sm p-2 hover:bg-terra hover:text-white transition-all -mr-4 hidden md:flex items-center justify-center"
                >
                  <FaChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>
        )}

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
