import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import useProductStore from "../store/productStore";
import useCartStore from "../store/cartStore";
import useAuthStore from "../store/authStore";
import { FaWhatsapp } from "react-icons/fa";
import {
  FiShoppingCart,
  FiStar,
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiChevronRight,
  FiChevronLeft,
  FiHeart,
  FiEye,
  FiClock,
  FiTrendingUp,
  FiAward,
  FiHeadphones,
} from "react-icons/fi";

const Home = () => {
  const { products, isLoading, fetchProducts } = useProductStore();
  const { addToCart } = useCartStore();
  const { user } = useAuthStore();

  // State for carousels
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [currentPartnerIndex, setCurrentPartnerIndex] = useState(0);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [addedToCart, setAddedToCart] = useState({});
  const [wishlist, setWishlist] = useState([]);

  // Hero slides data
  const heroSlides = [
    {
      id: 1,
      title: "Quality Building Materials",
      subtitle: "Build your dream home with trusted supplies",
      image:
        "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1200",
      cta: "Shop Now",
    },
    {
      id: 2,
      title: "Premium Paints",
      subtitle: "Transform your space with quality finishes",
      image:
        "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1200",
      cta: "Explore Deals",
    },
    {
      id: 3,
      title: "Hardware & Tools",
      subtitle: "Everything for professional and DIY projects",
      image:
        "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1200",
      cta: "Shop Now",
    },
  ];

  // Why Choose Us data
  const whyChooseUs = [
    {
      icon: <FiTruck className="w-8 h-8" />,
      title: "Free Delivery",
      description: "Free shipping on orders over KSh 5,000",
      color: "bg-terra/10 text-terra",
    },
    {
      icon: <FiShield className="w-8 h-8" />,
      title: "Secure Payment",
      description: "100% secure payment with M-Pesa",
      color: "bg-terra/10 text-terra",
    },
    {
      icon: <FiRefreshCw className="w-8 h-8" />,
      title: "Easy Returns",
      description: "30-day money-back guarantee",
      color: "bg-terra/10 text-terra",
    },
    {
      icon: <FiHeadphones className="w-8 h-8" />,
      title: "24/7 Support",
      description: "Dedicated customer service team",
      color: "bg-terra/10 text-terra",
    },
    {
      icon: <FiTrendingUp className="w-8 h-8" />,
      title: "Best Prices",
      description: "Price match guarantee",
      color: "bg-terra/10 text-terra",
    },
    {
      icon: <FiAward className="w-8 h-8" />,
      title: "Quality Products",
      description: "100% authentic products",
      color: "bg-terra/10 text-terra",
    },
  ];

  // Marquee text items - sliding from right to left
  const marqueeItems = [
    "🏗️ Quality Building Materials",
    "🎨 Premium Paints",
    "🔧 Hardware Tools",
    "🚰 Plumbing Supplies",
    "⚡ Electrical Products",
    "🏪 General Store",
    "🚚 Free Delivery Over KSh 5,000",
    "💳 Secure M-Pesa Payment",
    "⭐ Trusted Since Day One",
    "📍 A1 Highway, Migori",
  ];

  // Testimonials data
  const testimonials = [
    {
      id: 1,
      name: "John Mwangi",
      location: "Nairobi, Kenya",
      rating: 5,
      text: "Absolutely love shopping at Kione Hardware! The delivery was fast, and the product quality exceeded my expectations.",
      image: "https://randomuser.me/api/portraits/men/1.jpg",
      date: "March 2026",
    },
    {
      id: 2,
      name: "Sarah Kamau",
      location: "Mombasa, Kenya",
      rating: 5,
      text: "Best hardware shopping experience in Kenya! The M-Pesa payment integration is seamless.",
      image: "https://randomuser.me/api/portraits/women/2.jpg",
      date: "February 2026",
    },
    {
      id: 3,
      name: "David Ochieng",
      location: "Kisumu, Kenya",
      rating: 5,
      text: "I've bought building materials from Kione twice now. The products are authentic.",
      image: "https://randomuser.me/api/portraits/men/3.jpg",
      date: "January 2026",
    },
  ];

  // Partners data
  const partners = [
    {
      id: 1,
      name: "Safaricom",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Safaricom_logo.svg/2560px-Safaricom_logo.svg.png",
      description: "Official M-Pesa Partner",
      website: "#",
    },
    {
      id: 2,
      name: "Visa",
      logo: "https://cdn-icons-png.flaticon.com/512/196/196578.png",
      description: "Payment Partner",
      website: "#",
    },
    {
      id: 3,
      name: "Mastercard",
      logo: "https://cdn-icons-png.flaticon.com/512/196/196561.png",
      description: "Payment Partner",
      website: "#",
    },
    {
      id: 4,
      name: "Aramex",
      logo: "https://1000logos.net/wp-content/uploads/2021/05/Aramex-logo.png",
      description: "Delivery Partner",
      website: "#",
    },
  ];

  // Categories data
  const categories = [
    {
      name: "Building Materials",
      icon: "🧱",
      color: "bg-terra/10",
      textColor: "text-terra",
      count: "50+ products",
    },
    {
      name: "Paints",
      icon: "🎨",
      color: "bg-terra/10",
      textColor: "text-terra",
      count: "30+ products",
    },
    {
      name: "Hardware Tools",
      icon: "🔧",
      color: "bg-terra/10",
      textColor: "text-terra",
      count: "80+ products",
    },
    {
      name: "Plumbing",
      icon: "🚰",
      color: "bg-terra/10",
      textColor: "text-terra",
      count: "40+ products",
    },
    {
      name: "Electrical",
      icon: "⚡",
      color: "bg-terra/10",
      textColor: "text-terra",
      count: "60+ products",
    },
    {
      name: "General Store",
      icon: "🏪",
      color: "bg-terra/10",
      textColor: "text-terra",
      count: "100+ products",
    },
  ];

  const partnersPerView = 4;
  const visiblePartners = Array.isArray(partners)
    ? partners.slice(currentPartnerIndex, currentPartnerIndex + partnersPerView)
    : [];

  // ✅ OPTIMIZED: Fetch only 8 products for home page (faster load)
  useEffect(() => {
    fetchProducts(1, 8);
  }, []);

  useEffect(() => {
    const timer = setInterval(
      () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length),
      5000,
    );
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(
      () => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length),
      6000,
    );
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () =>
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () =>
    setCurrentSlide(
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length,
    );
  const nextTestimonial = () =>
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  const prevTestimonial = () =>
    setCurrentTestimonial(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length,
    );
  const nextPartners = () => {
    if (currentPartnerIndex + partnersPerView < partners.length) {
      setCurrentPartnerIndex(currentPartnerIndex + partnersPerView);
    } else {
      setCurrentPartnerIndex(0);
    }
  };
  const prevPartners = () => {
    if (currentPartnerIndex - partnersPerView >= 0) {
      setCurrentPartnerIndex(currentPartnerIndex - partnersPerView);
    } else {
      setCurrentPartnerIndex(Math.max(0, partners.length - partnersPerView));
    }
  };

  const handleAddToCart = async (product) => {
    if (!user) {
      toast.error("Please login to add items to cart");
      return;
    }
    try {
      await addToCart(product.id);
      setAddedToCart({ [product.id]: true });
      toast.success(`${product.name} added to cart!`);
      setTimeout(() => setAddedToCart({}), 2000);
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  const toggleWishlist = (productId) => {
    if (!user) {
      toast.error("Please login to add to wishlist");
      return;
    }
    if (wishlist.includes(productId)) {
      setWishlist(wishlist.filter((id) => id !== productId));
      toast.success("Removed from wishlist");
    } else {
      setWishlist([...wishlist, productId]);
      toast.success("Added to wishlist");
    }
  };

  const latestProducts = Array.isArray(products) ? products : [];

  // ✅ Loading Skeleton - Better UX while loading
  if (isLoading && latestProducts.length === 0) {
    return (
      <div className="min-h-screen bg-warm">
        <div className="container mx-auto px-4 py-8">
          {/* Hero Skeleton */}
          <div className="animate-pulse">
            <div className="h-[500px] md:h-[600px] bg-gray-200 rounded-lg mb-8"></div>

            {/* Why Choose Us Skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 mb-16">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white border-4 border-black shadow-hard-sm p-6"
                >
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mx-auto"></div>
                </div>
              ))}
            </div>

            {/* Products Skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white border-4 border-black shadow-hard-sm overflow-hidden"
                >
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-3">
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

  // Double the marquee items for seamless looping
  const doubledMarqueeItems = [...marqueeItems, ...marqueeItems];

  return (
    <div className="min-h-screen bg-warm">
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      {/* Hero Carousel Section */}
      <section className="relative overflow-hidden">
        <div className="relative h-[500px] md:h-[600px] overflow-hidden">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-transform duration-700 ease-in-out transform ${index === currentSlide ? "translate-x-0" : "translate-x-full"} ${index < currentSlide ? "-translate-x-full" : ""}`}
              style={{
                backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%), url(${slide.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
              <div className="relative h-full flex items-center">
                <div className="container mx-auto px-4">
                  <div className="max-w-2xl text-white">
                    <p className="text-terra font-semibold mb-2">
                      Kione Hardware
                    </p>
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in">
                      {slide.title}
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 opacity-90">
                      {slide.subtitle}
                    </p>
                    <Link
                      to="/products"
                      className="inline-flex items-center px-6 py-3 bg-terra text-white border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all group"
                    >
                      {slide.cta}{" "}
                      <FiChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full"
          >
            <FiChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full"
          >
            <FiChevronRight className="w-6 h-6" />
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`transition-all ${index === currentSlide ? "w-8 h-2 bg-terra" : "w-2 h-2 bg-white/50"}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Marquee / Sliding Text Section - Right to Left */}
      <div className="relative overflow-hidden bg-terra border-y-4 border-black py-4">
        <div className="flex whitespace-nowrap animate-marquee">
          {doubledMarqueeItems.map((item, index) => (
            <div key={index} className="flex items-center">
              <span className="mx-8 text-white font-bold uppercase tracking-wider text-sm md:text-base">
                {item}
              </span>
              <span className="w-2 h-2 bg-white rounded-full"></span>
            </div>
          ))}
        </div>
      </div>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="brick-line mx-auto mb-4"></div>
            <h2 className="font-h text-3xl md:text-4xl font-bold text-black uppercase mb-4">
              Why Choose Kione Hardware?
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {whyChooseUs.map((item, index) => (
              <div
                key={index}
                className="text-center group hover:-translate-y-2 transition-all duration-300 p-4 md:p-6 bg-white border-4 border-black shadow-hard-sm"
              >
                <div
                  className={`inline-flex p-3 md:p-4 ${item.color} rounded-full mb-3 md:mb-4 group-hover:scale-110 transition-transform`}
                >
                  {item.icon}
                </div>
                <h3 className="font-h font-bold text-sm md:text-lg text-black uppercase mb-1 md:mb-2">
                  {item.title}
                </h3>
                <p className="text-ash text-xs md:text-sm">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Category Section */}
      <section className="py-16 bg-warm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="brick-line mx-auto mb-4"></div>
            <h2 className="font-h text-3xl md:text-4xl font-bold text-black uppercase mb-4">
              Shop by Category
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <Link
                key={index}
                to="/products"
                className={`${category.color} border-4 border-black p-6 text-center hover:-translate-y-1 transition-all shadow-hard-sm`}
              >
                <div className="text-5xl mb-2">{category.icon}</div>
                <h3
                  className={`font-h font-bold text-sm uppercase ${category.textColor}`}
                >
                  {category.name}
                </h3>
                <p className="text-xs text-ash mt-1">{category.count}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Arrivals Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="font-h text-3xl md:text-4xl font-bold text-black uppercase mb-2">
                Latest Arrivals
              </h2>
              <p className="text-ash">Check out our newest products</p>
            </div>
            <Link
              to="/products"
              className="text-terra hover:text-terra-dark font-bold uppercase tracking-wider flex items-center group"
            >
              View All{" "}
              <FiChevronRight className="ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
            {latestProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-white border-4 border-black shadow-hard-sm overflow-hidden hover:-translate-y-2 transition-all duration-300"
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                <div className="relative overflow-hidden aspect-square border-b-4 border-black">
                  <img
                    src={
                      product.file_image ||
                      `https://placehold.co/400x400/D6B896/121518?text=${(product.name || "Product").substring(0, 15)}`
                    }
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                    decoding="async"
                  />
                  <div
                    className={`absolute inset-0 bg-black/60 items-center justify-center space-x-3 transition-opacity duration-300 ${hoveredProduct === product.id ? "md:flex" : "md:hidden"} hidden`}
                  >
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="p-2 bg-terra text-white border-2 border-black"
                    >
                      <FiShoppingCart className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className={`p-2 border-2 ${wishlist.includes(product.id) ? "bg-terra text-white border-terra" : "bg-white text-terra border-black"}`}
                    >
                      <FiHeart className="w-5 h-5" />
                    </button>
                    <Link
                      to={`/product/${product.id}`}
                      className="p-2 bg-terra text-white border-2 border-black"
                    >
                      <FiEye className="w-5 h-5" />
                    </Link>
                  </div>
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2 md:hidden">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="p-1.5 bg-terra text-white border border-black"
                    >
                      <FiShoppingCart className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className={`p-1.5 border ${wishlist.includes(product.id) ? "bg-terra text-white border-terra" : "bg-white text-terra border-black"}`}
                    >
                      <FiHeart className="w-3 h-3" />
                    </button>
                    <Link
                      to={`/product/${product.id}`}
                      className="p-1.5 bg-terra text-white border border-black"
                    >
                      <FiEye className="w-3 h-3" />
                    </Link>
                  </div>
                  {product.stock < 10 && product.stock > 0 && (
                    <div className="absolute top-2 left-2 bg-terra text-white px-1.5 py-0.5 text-[8px] font-bold uppercase border border-black">
                      Low Stock
                    </div>
                  )}
                  {wishlist.includes(product.id) && (
                    <div className="absolute top-2 right-2 bg-terra text-white px-1.5 py-0.5 text-[8px] font-bold uppercase border border-black">
                      Wishlist
                    </div>
                  )}
                </div>
                <div className="p-2 sm:p-3 md:p-4">
                  <h3 className="font-h font-bold text-xs sm:text-sm md:text-lg text-black mb-1 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-ash text-[10px] sm:text-xs md:text-sm mb-2 line-clamp-2 hidden sm:block">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="font-h font-bold text-xs sm:text-sm md:text-2xl text-terra">
                      KSh {product.price?.toLocaleString() || 0}
                    </span>
                    {addedToCart[product.id] && (
                      <span className="text-green-600 text-[8px] sm:text-xs font-semibold animate-bounce">
                        Added!
                      </span>
                    )}
                  </div>
                  <div className="flex items-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 ${i < 4 ? "text-yellow-500 fill-current" : "text-gray-300"}`}
                      />
                    ))}
                    <span className="ml-1 text-[8px] sm:text-xs text-ash">
                      (24)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gradient-to-r from-terra/5 to-terra/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="brick-line mx-auto mb-4"></div>
            <h2 className="font-h text-3xl md:text-4xl font-bold text-black uppercase mb-4">
              What Our Customers Say
            </h2>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-white border-4 border-black shadow-hard-lg p-8 md:p-12">
              <div className="absolute top-4 left-4 text-6xl text-terra/20">
                "
              </div>
              <div className="flex justify-center mb-6">
                {[...Array(testimonials[currentTestimonial].rating)].map(
                  (_, i) => (
                    <FiStar
                      key={i}
                      className="w-6 h-6 text-yellow-500 fill-current"
                    />
                  ),
                )}
              </div>
              <p className="text-ash text-lg md:text-xl text-center italic mb-8 leading-relaxed">
                "{testimonials[currentTestimonial].text}"
              </p>
              <div className="flex flex-col items-center text-center">
                <img
                  src={testimonials[currentTestimonial].image}
                  alt={testimonials[currentTestimonial].name}
                  className="w-16 h-16 rounded-full object-cover border-4 border-terra mb-4"
                  loading="lazy"
                />
                <h4 className="font-h text-xl font-bold text-black">
                  {testimonials[currentTestimonial].name}
                </h4>
                <p className="text-ash text-sm">
                  {testimonials[currentTestimonial].location}
                </p>
                <p className="text-ash/50 text-xs mt-1">
                  {testimonials[currentTestimonial].date}
                </p>
              </div>
              <button
                onClick={prevTestimonial}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white border-4 border-black shadow-hard-sm p-2 hover:bg-terra hover:text-white"
              >
                <FiChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextTestimonial}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white border-4 border-black shadow-hard-sm p-2 hover:bg-terra hover:text-white"
              >
                <FiChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="brick-line mx-auto mb-4"></div>
            <h2 className="font-h text-3xl md:text-4xl font-bold text-black uppercase mb-4">
              Our Trusted Partners
            </h2>
          </div>
          <div className="relative">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {visiblePartners.map((partner) => (
                <a
                  key={partner.id}
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-warm border-4 border-black p-6 text-center hover:-translate-y-1 transition-all duration-300 shadow-hard-sm"
                >
                  <div className="h-20 flex items-center justify-center mb-3">
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="max-h-12 object-contain group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://placehold.co/100x60?text=${partner.name}`;
                      }}
                    />
                  </div>
                  <h3 className="font-h font-bold text-sm uppercase text-black">
                    {partner.name}
                  </h3>
                  <p className="text-xs text-ash mt-1">{partner.description}</p>
                </a>
              ))}
            </div>
            {partners.length > partnersPerView && (
              <>
                <button
                  onClick={prevPartners}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 bg-white border-4 border-black shadow-hard-sm p-2 hover:bg-terra hover:text-white"
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextPartners}
                  className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 bg-white border-4 border-black shadow-hard-sm p-2 hover:bg-terra hover:text-white"
                >
                  <FiChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      {!user && (
        <section className="py-16 bg-terra">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="font-h text-3xl md:text-4xl font-bold text-white uppercase mb-4">
                Ready to Start Shopping?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Create an account and get 10% off your first purchase
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="px-8 py-3 bg-white text-terra border-4 border-black shadow-hard-sm font-bold uppercase tracking-wider hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                >
                  Create Account
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-3 bg-transparent border-4 border-white text-white font-bold uppercase tracking-wider hover:bg-white hover:text-terra transition-all"
                >
                  Login
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* WhatsApp Button */}
      <div className="fixed bottom-6 left-6 z-50 group">
        <a
          href="https://wa.me/254714391137?text=Hello%21%20I%20have%20a%20question%20about%20your%20products"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-14 h-14 bg-terra rounded-full shadow-hard-sm hover:bg-terra-dark hover:scale-110 transition-all duration-300"
        >
          <FaWhatsapp className="w-7 h-7 text-white" />
        </a>
      </div>
    </div>
  );
};

export default Home;
