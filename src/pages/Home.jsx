import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useProductStore from "../store/productStore";
import useCartStore from "../store/cartStore";
import useAuthStore from "../store/authStore";
import { getCategoryCounts } from "../api/products";
import { getImageUrl } from "../utils/image";
import { logError } from "../utils/logger";
import {
  FaCartShopping,
  FaStar,
  FaTruck,
  FaShieldHalved,
  FaChevronRight,
  FaEye,
  FaArrowTrendUp,
  FaAward,
  FaHeadphones,
  FaBox,
  FaDroplet,
  FaBolt,
  FaScrewdriverWrench,
  FaBagShopping,
} from "react-icons/fa6";

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

const HomeProductCard = ({
  product,
  isHovered,
  onHover,
  added,
  onAdd,
  onBuy,
}) => (
  <div
    className="group bg-white border-4 border-black shadow-hard-sm overflow-hidden hover:-translate-y-2 transition-all duration-300"
    onMouseEnter={() => onHover(true)}
    onMouseLeave={() => onHover(false)}
  >
    <div className="relative overflow-hidden aspect-square border-b-4 border-black">
      <img
        src={
          getImageUrl(product.file_image) ||
          `https://placehold.co/400x400/D6B896/121518?text=${(product.name || "Product").substring(0, 15)}`
        }
        alt={product.name}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        loading="lazy"
        decoding="async"
      />
      <div
        className={`absolute inset-0 bg-black/60 items-center justify-center space-x-3 transition-opacity duration-300 ${isHovered ? "md:flex" : "md:hidden"} hidden`}
      >
        <button
          onClick={onAdd}
          className="p-2 bg-terra text-white border-2 border-black"
        >
          <FaCartShopping className="w-5 h-5" />
        </button>
        <Link
          to={`/product/${product.id}`}
          className="p-2 bg-terra text-white border-2 border-black"
        >
          <FaEye className="w-5 h-5" />
        </Link>
      </div>
      <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2 md:hidden">
        <button
          onClick={onAdd}
          className="p-1.5 bg-terra text-white border border-black"
        >
          <FaCartShopping className="w-3 h-3" />
        </button>
        <Link
          to={`/product/${product.id}`}
          className="p-1.5 bg-terra text-white border border-black"
        >
          <FaEye className="w-3 h-3" />
        </Link>
      </div>
      {product.stock < 10 && product.stock > 0 && (
        <div className="absolute top-2 left-2 bg-terra text-white px-1.5 py-0.5 text-[8px] font-bold uppercase border border-black">
          Low Stock
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
        {added && (
          <span className="text-green-600 text-[8px] sm:text-xs font-semibold animate-bounce">
            Added!
          </span>
        )}
      </div>
      <div className="flex items-center mt-1">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            className={`w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 ${i < Math.floor(product.rating || 0) ? "text-yellow-500 fill-current" : "text-gray-300"}`}
          />
        ))}
        {product.rating > 0 && (
          <span className="ml-1 text-[8px] sm:text-xs text-ash">
            {product.rating?.toFixed(1)}
          </span>
        )}
      </div>
      <div className="flex gap-2 mt-2">
        <button
          onClick={onAdd}
          className="flex-1 px-3 py-2 bg-white text-terra font-bold uppercase text-xs sm:text-sm border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
        >
          Add to Cart
        </button>
        <button
          onClick={onBuy}
          className="flex-1 px-3 py-2 bg-terra text-white font-bold uppercase text-xs sm:text-sm border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
        >
          Buy Now
        </button>
      </div>
    </div>
  </div>
);

const Home = () => {
  const { products, isLoading, fetchProducts } = useProductStore();
  const { addToCart, addGuestItem } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [addedToCart, setAddedToCart] = useState({});
  const [categories, setCategories] = useState([]);

  const whyChooseUs = [
    {
      icon: <FaTruck className="w-8 h-8" />,
      title: "Reliable Service",
      description: "Helpful support from a local team",
      color: "bg-terra/10 text-terra",
    },
    {
      icon: <FaShieldHalved className="w-8 h-8" />,
      title: "Secure Payment",
      description: "100% secure payment with M-Pesa",
      color: "bg-terra/10 text-terra",
    },
    {
      icon: <FaHeadphones className="w-8 h-8" />,
      title: "24/7 Support",
      description: "Dedicated customer service team",
      color: "bg-terra/10 text-terra",
    },
    {
      icon: <FaArrowTrendUp className="w-8 h-8" />,
      title: "Best Prices",
      description: "Price match guarantee",
      color: "bg-terra/10 text-terra",
    },
    {
      icon: <FaAward className="w-8 h-8" />,
      title: "Quality Products",
      description: "100% authentic products",
      color: "bg-terra/10 text-terra",
    },
  ];

  const marqueeItems = [
    "Quality Building Materials",
    "Premium Paints",
    "Hardware Tools",
    "Plumbing Supplies",
    "Electrical Products",
    "General Store",
    "Secure M-Pesa Payment",
    "Trusted Since Day One",
    "Migori, Kenya",
  ];

  const categoryMeta = {
    building: { name: "Building Materials", icon: FaBox },
    paints: { name: "Paints", icon: FaDroplet },
    hardware: { name: "Hardware Tools", icon: FaScrewdriverWrench },
    plumbing: { name: "Plumbing", icon: FaDroplet },
    electrical: { name: "Electrical", icon: FaBolt },
    general: { name: "General Store", icon: FaBagShopping },
  };

  useEffect(() => {
    fetchProducts(1, 8);
  }, [fetchProducts]);

  useEffect(() => {
    const fetchCategoryStats = async () => {
      try {
        const response = await getCategoryCounts();
        setCategories(response.data);
      } catch (error) {
        logError("Failed to fetch categories:", error);
      }
    };
    fetchCategoryStats();
  }, []);

  useEffect(() => {
    const timer = setInterval(
      () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length),
      5000,
    );
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () =>
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () =>
    setCurrentSlide(
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length,
    );

  const handleAddToCart = async (product) => {
    try {
      if (user) {
        await addToCart(product.id);
      } else {
        addGuestItem(product);
      }
      setAddedToCart({ [product.id]: true });
      toast.success(`${product.name} added to cart!`);
      setTimeout(() => setAddedToCart({}), 2000);
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  const handleBuyNow = async (product) => {
    try {
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
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  const latestProducts = Array.isArray(products) ? products : [];

  if (isLoading && latestProducts.length === 0) {
    return (
      <div className="min-h-screen bg-warm">
        <div className="mx-auto w-full max-w-[1600px] px-3 py-3 md:px-4 md:py-4">

          <div className="animate-pulse">
            <div className="h-[500px] md:h-[600px] bg-gray-200 rounded-lg mb-8"></div>

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

  const doubledMarqueeItems = [...marqueeItems, ...marqueeItems];

  return (
    <div className="min-h-screen bg-warm">
      <section className="relative overflow-hidden">
        <div className="relative h-[500px] md:h-[600px] overflow-hidden">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? "opacity-100" : "pointer-events-none opacity-0"}`}
              style={{
                backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%), url(${slide.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
              <div className="relative h-full flex items-center">
                <div className="mx-auto w-full max-w-[1600px] px-4">
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
                      <FaChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition hover:bg-white/30"
            aria-label="Previous slide"
          >
            <span aria-hidden="true">&#8592;</span>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full"
          >
            <FaChevronRight className="w-6 h-6" />
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

      <section className="py-16 bg-warm">
        <div className="mx-auto w-full max-w-[1600px] px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <div className="brick-line mb-4"></div>
              <h2 className="font-h text-3xl md:text-4xl font-bold text-black uppercase mb-2">
                Featured Products
              </h2>
              <p className="text-ash">
                Handpicked products our customers love
              </p>
            </div>
            <Link
              to="/products"
              className="text-terra hover:text-terra-dark font-bold uppercase tracking-wider flex items-center group"
            >
              View All{" "}
              <FaChevronRight className="ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {latestProducts.slice(0, 4).map((product) => (
              <HomeProductCard
                key={product.id}
                product={product}
                isHovered={hoveredProduct === product.id}
                onHover={(entered) =>
                  setHoveredProduct(entered ? product.id : null)
                }
                added={!!addedToCart[product.id]}
                onAdd={() => handleAddToCart(product)}
                onBuy={() => handleBuyNow(product)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="mx-auto w-full max-w-[1600px] px-4">
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

      <section className="py-16 bg-warm">
        <div className="mx-auto w-full max-w-[1600px] px-4">
          <div className="text-center mb-12">
            <div className="brick-line mx-auto mb-4"></div>
            <h2 className="font-h text-3xl md:text-4xl font-bold text-black uppercase mb-4">
              Shop by Category
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => {
              const meta = categoryMeta[category.name] || {};
              const Icon = meta.icon || FaBox;
              const displayName = meta.name || category.name;
              return (
                <Link
                  key={index}
                  to={`/products?category=${category.name}`}
                  className="bg-terra/10 border-4 border-black p-6 text-center hover:-translate-y-1 transition-all shadow-hard-sm"
                >
                  <div className="mb-2 flex justify-center text-terra">
                    <Icon className="h-10 w-10" aria-hidden="true" />
                  </div>
                  <h3 className="font-h font-bold text-sm uppercase text-terra">
                    {displayName}
                  </h3>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="mx-auto w-full max-w-[1600px] px-4">
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
              <FaChevronRight className="ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {latestProducts.map((product) => (
              <HomeProductCard
                key={product.id}
                product={product}
                isHovered={hoveredProduct === product.id}
                onHover={(entered) =>
                  setHoveredProduct(entered ? product.id : null)
                }
                added={!!addedToCart[product.id]}
                onAdd={() => handleAddToCart(product)}
                onBuy={() => handleBuyNow(product)}
              />
            ))}
          </div>
        </div>
      </section>

      <div className="fixed bottom-6 left-6 z-50">
        <a
          href="https://wa.me/254714391137?text=Hello%21%20I%20have%20a%20question%20about%20your%20products"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-terra transition-colors duration-300 hover:bg-terra-dark"
          aria-label="Contact Kione Hardware on WhatsApp"
        >
          <span className="text-sm font-bold text-white">WA</span>
        </a>
      </div>
    </div>
  );
};

export default Home;
