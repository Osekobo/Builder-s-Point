import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useCartStore from "../store/cartStore";
import toast from "react-hot-toast";
import {
  FaTrash,
  FaMinus,
  FaPlus,
  FaCartShopping,
  FaShieldHalved,
} from "react-icons/fa6";
import { getImageUrl } from "../utils/image";

const Cart = () => {
  const { items, total, fetchCart, updateQuantity, removeFromCart } =
    useCartStore();
  const [itemToRemove, setItemToRemove] = useState(null);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleUpdateQuantity = async (itemId, quantity) => {
    const result = await updateQuantity(itemId, quantity);
    if (!result.success) {
      toast.error("Failed to update quantity");
    }
  };

  const handleRemoveItem = async (itemId) => {
    setItemToRemove(null);
    const result = await removeFromCart(itemId);
    if (result.success) {
      toast.success("Item removed from cart");
    } else {
      toast.error("Failed to remove item from cart");
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-warm flex items-center justify-center py-12 px-4">
        <div className="text-center max-w-md mx-auto bg-white border-4 border-black shadow-hard-lg p-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-terra/10 border-4 border-terra mb-6">
            <FaCartShopping className="w-10 h-10 text-terra" />
          </div>
          <h2 className="font-h text-2xl font-bold text-black uppercase mb-4">
            Your cart is empty
          </h2>
          <p className="text-ash mb-6">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link
            to="/products"
            className="inline-block bg-terra text-white px-8 py-3 font-bold uppercase tracking-wider border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm py-3 px-3 md:py-4">
      <div className="mx-auto w-full max-w-[1600px]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-terra border-4 border-black shadow-hard-sm mb-4">
            <FaCartShopping className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-h text-3xl md:text-4xl font-bold text-black uppercase mb-2">
            Shopping Cart
          </h1>
          <div className="brick-line mx-auto"></div>
          <p className="text-ash mt-2">Review and manage your items</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white border-4 border-black shadow-hard-sm p-4 transition-all hover:-translate-y-1 duration-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="w-32 h-32 flex-shrink-0 bg-sand/20 border-2 border-black overflow-hidden">
                    <img
                      src={
                        getImageUrl(item.product.file_image) ||
                        "https://placehold.co/400x400/D6B896/121518?text=Product"
                      }
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-h text-lg font-bold text-black uppercase mb-1">
                      {item.product.name}
                    </h3>
                    <p className="text-terra font-bold text-xl">
                      KSh {item.product.price.toLocaleString()}
                    </p>

                    <div className="flex items-center space-x-2 mt-3">
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                        className="p-2 border-2 border-black hover:bg-terra/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <FaMinus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-bold text-black">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity + 1)
                        }
                        className="p-2 border-2 border-black hover:bg-terra/10 transition-colors"
                      >
                        <FaPlus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setItemToRemove(item)}
                        className="ml-4 p-2 border-2 border-red-500 text-red-600 hover:bg-red-500 hover:text-white transition-all"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right sm:text-left">
                    <p className="text-sm text-ash uppercase tracking-wider">
                      Total
                    </p>
                    <p className="font-h text-2xl font-bold text-terra">
                      KSh{" "}
                      {(item.product.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white border-4 border-black shadow-hard-lg p-6 sticky top-20">
              <h2 className="font-h text-xl font-bold text-black uppercase text-center mb-4">
                Order Summary
              </h2>
              <div className="brick-line mx-auto mb-6"></div>

              <div className="space-y-3">
                <div className="flex justify-between py-2">
                  <span className="text-ash">Subtotal</span>
                  <span className="font-bold text-black">
                    KSh {total.toLocaleString()}
                  </span>
                </div>
                <div className="border-t-2 border-black my-2"></div>
                <div className="flex justify-between py-2">
                  <span className="font-h text-xl font-bold text-black">
                    Total
                  </span>
                  <span className="font-h text-2xl font-bold text-terra">
                    KSh {total.toLocaleString()}
                  </span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="block w-full bg-terra text-white text-center py-3 font-bold uppercase tracking-wider border-4 border-black shadow-hard-sm mt-6 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
              >
                Proceed to Checkout
              </Link>

              <div className="mt-6 pt-6 border-t-2 border-black">
                <div className="flex justify-around">
                  <div className="text-center">
                    <FaShieldHalved className="w-6 h-6 text-terra mx-auto mb-1" />
                    <p className="text-[10px] text-ash uppercase">
                      Secure Payment
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link
            to="/products"
            className="inline-flex items-center space-x-2 text-terra hover:text-terra-dark font-semibold transition-colors group"
          >
            <span>← Continue Shopping</span>
          </Link>
        </div>
      </div>

      {itemToRemove && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setItemToRemove(null)}
        >
          <div
            className="bg-white border-4 border-black shadow-hard-lg p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-h text-lg font-bold text-black uppercase mb-3">
              Remove from cart?
            </h2>
            <p className="text-ash mb-6">
              Are you sure you want to remove{" "}
              <span className="font-semibold text-black">
                {itemToRemove.product.name}
              </span>{" "}
              from your cart?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleRemoveItem(itemToRemove.id)}
                className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-bold uppercase border-2 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                Yes, Remove
              </button>
              <button
                onClick={() => setItemToRemove(null)}
                className="flex-1 px-4 py-2 bg-gray-300 text-black text-sm font-bold uppercase border-2 border-black hover:bg-gray-400 transition-all"
              >
                Keep Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;