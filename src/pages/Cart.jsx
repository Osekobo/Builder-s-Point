import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import { FiTrash2, FiMinus, FiPlus, FiShoppingCart, FiTruck, FiShield, FiRefreshCw } from 'react-icons/fi';

const Cart = () => {
  const { items, total, fetchCart, updateQuantity, removeFromCart } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, []);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-warm flex items-center justify-center py-12 px-4">
        <div className="text-center max-w-md mx-auto bg-white border-4 border-black shadow-hard-lg p-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-terra/10 border-4 border-terra mb-6">
            <FiShoppingCart className="w-10 h-10 text-terra" />
          </div>
          <h2 className="font-h text-2xl font-bold text-black uppercase mb-4">Your cart is empty</h2>
          <p className="text-ash mb-6">Looks like you haven't added any items to your cart yet.</p>
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
    <div className="min-h-screen bg-warm py-8 px-4">
      <div className="container mx-auto">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-terra border-4 border-black shadow-hard-sm mb-4">
            <FiShoppingCart className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-h text-3xl md:text-4xl font-bold text-black uppercase mb-2">Shopping Cart</h1>
          <div className="brick-line mx-auto"></div>
          <p className="text-ash mt-2">Review and manage your items</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white border-4 border-black shadow-hard-sm p-4 transition-all hover:-translate-y-1 duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  {/* Product Image */}
                  <div className="w-32 h-32 flex-shrink-0 bg-sand/20 border-2 border-black overflow-hidden">
                    <img
                      src={item.product.file_image || 'https://placehold.co/400x400/D6B896/121518?text=Product'}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Product Details */}
                  <div className="flex-1">
                    <h3 className="font-h text-lg font-bold text-black uppercase mb-1">
                      {item.product.name}
                    </h3>
                    <p className="text-terra font-bold text-xl">
                      KSh {item.product.price.toLocaleString()}
                    </p>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2 mt-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="p-2 border-2 border-black hover:bg-terra/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <FiMinus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-bold text-black">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 border-2 border-black hover:bg-terra/10 transition-colors"
                      >
                        <FiPlus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="ml-4 p-2 border-2 border-red-500 text-red-600 hover:bg-red-500 hover:text-white transition-all"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Item Total */}
                  <div className="text-right sm:text-left">
                    <p className="text-sm text-ash uppercase tracking-wider">Total</p>
                    <p className="font-h text-2xl font-bold text-terra">
                      KSh {(item.product.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border-4 border-black shadow-hard-lg p-6 sticky top-20">
              <h2 className="font-h text-xl font-bold text-black uppercase text-center mb-4">Order Summary</h2>
              <div className="brick-line mx-auto mb-6"></div>
              
              <div className="space-y-3">
                <div className="flex justify-between py-2">
                  <span className="text-ash">Subtotal</span>
                  <span className="font-bold text-black">KSh {total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-ash">Shipping</span>
                  <span className="text-green-600 font-semibold">Free</span>
                </div>
                <div className="border-t-2 border-black my-2"></div>
                <div className="flex justify-between py-2">
                  <span className="font-h text-xl font-bold text-black">Total</span>
                  <span className="font-h text-2xl font-bold text-terra">KSh {total.toLocaleString()}</span>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="mt-6 p-4 bg-terra/10 border-2 border-terra">
                <div className="flex items-center space-x-2 mb-2">
                  <FiTruck className="w-5 h-5 text-terra" />
                  <span className="text-sm font-bold text-black uppercase">Free Delivery</span>
                </div>
                <p className="text-xs text-ash">Free delivery on orders over KSh 5,000</p>
              </div>

              <Link
                to="/checkout"
                className="block w-full bg-terra text-white text-center py-3 font-bold uppercase tracking-wider border-4 border-black shadow-hard-sm mt-6 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
              >
                Proceed to Checkout
              </Link>

              {/* Security Badges */}
              <div className="mt-6 pt-6 border-t-2 border-black">
                <div className="flex justify-around">
                  <div className="text-center">
                    <FiShield className="w-6 h-6 text-terra mx-auto mb-1" />
                    <p className="text-[10px] text-ash uppercase">Secure Payment</p>
                  </div>
                  <div className="text-center">
                    <FiRefreshCw className="w-6 h-6 text-terra mx-auto mb-1" />
                    <p className="text-[10px] text-ash uppercase">Easy Returns</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Shopping Link */}
        <div className="text-center mt-8">
          <Link
            to="/products"
            className="inline-flex items-center space-x-2 text-terra hover:text-terra-dark font-semibold transition-colors group"
          >
            <span>← Continue Shopping</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;