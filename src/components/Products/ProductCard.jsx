import { Link } from "react-router-dom";
import useCartStore from "../../store/cartStore";
import useAuthStore from "../../store/authStore";
import toast from "react-hot-toast";
import { FaCartShopping, FaEye, FaStar } from "react-icons/fa6";
import { getImageUrl } from "../../utils/image";

const ProductCard = ({ product }) => {
  const { addToCart, addGuestItem } = useCartStore();
  const { user } = useAuthStore();

  const handleAddToCart = async () => {
    if (user) {
      const result = await addToCart(product.id, 1);
      if (result.success) {
        toast.success(`${product.name} added to cart!`);
      } else {
        toast.error("Failed to add to cart");
      }
    } else {
      addGuestItem(product);
      toast.success(`${product.name} added to cart!`);
    }
  };

  return (
    <div className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative overflow-hidden h-64">
        <img
          src={getImageUrl(product.file_image) || "https://via.placeholder.com/300"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleAddToCart}
            className="p-2 bg-white rounded-full hover:bg-blue-600 hover:text-white transition-colors"
            title="Add to Cart"
          >
            <FaCartShopping className="w-5 h-5" />
          </button>
          <Link
            to={`/product/${product.id}`}
            className="p-2 bg-white rounded-full hover:bg-blue-600 hover:text-white transition-colors"
            title="View Product"
          >
            <FaEye className="w-5 h-5" />
          </Link>
        </div>

        
        {product.stock < 10 && product.stock > 0 && (
          <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
            Low Stock
          </div>
        )}

        
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        <div className="flex justify-between items-center">
          <div>
            <span className="text-2xl font-bold text-blue-600">
              KSh {product.price.toLocaleString()}
            </span>
          </div>
        </div>

        
        <div className="flex items-center mt-2">
          {[...Array(5)].map((_, i) => (
            <FaStar
              key={i}
              className={`w-4 h-4 ${
                i < Math.floor(product.rating || 0) ? "text-yellow-400 fill-current" : "text-gray-300"
              }`}
            />
          ))}
          {product.rating > 0 && (
            <span className="ml-2 text-sm text-gray-600">
              {product.rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
