import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import useCartStore from "../store/cartStore";
import useAuthStore from "../store/authStore";
import { getDefaultAddress, createAddress } from "../api/address";
import LocationPicker from "../components/Map/LocationPicker";
import {
  FiMapPin,
  FiCheckCircle,
  FiNavigation,
  FiSkipForward,
  FiAlertCircle,
  FiSmartphone,
  FiShield,
  FiClock,
  FiInfo,
  FiCreditCard,
  FiDollarSign,
  FiTrendingUp,
  FiShoppingBag,
  FiTruck,
  FiArrowLeft,
} from "react-icons/fi";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const Checkout = () => {
  const [phone, setPhone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [skipAddress, setSkipAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [addressDetails, setAddressDetails] = useState({
    full_name: "",
    phone_number: "",
    address_line1: "",
    city: "",
    county: "",
  });
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [checkoutRequestId, setCheckoutRequestId] = useState(null);
  const { items, total, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Calculate order details
  const subtotal = total;
  // const shippingFee = subtotal > 5000 ? 0 : 250;
  const shippingFee = 0;
  // const grandTotal = subtotal + shippingFee;
  const grandTotal = subtotal;

  // Debug auth on mount
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    console.log("=== CHECKOUT DEBUG ===");
    console.log("Token exists:", !!token);
    console.log("Cart items:", items.length);
    console.log("Grand total:", grandTotal);
  }, []);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate("/cart");
    }
    loadDefaultAddress();
  }, [items, navigate]);

  const loadDefaultAddress = async () => {
    try {
      const response = await getDefaultAddress();
      if (response.data) {
        setSelectedLocation({
          lat: response.data.latitude,
          lng: response.data.longitude,
          address: response.data.address_line1,
        });
        setAddressDetails({
          full_name: response.data.full_name,
          phone_number: response.data.phone_number,
          address_line1: response.data.address_line1,
          city: response.data.city,
          county: response.data.county,
        });
        setPhone(response.data.phone_number);
      }
    } catch (error) {
      console.error("Failed to load default address:", error);
    }
  };

  const handleLocationSelect = (locationData) => {
    setSelectedLocation(locationData);
    setAddressDetails({
      full_name: user?.name || "",
      phone_number: phone,
      address_line1: locationData.address,
      city: locationData.city || "",
      county: locationData.county || "",
    });
  };

  const handleSaveAddress = async () => {
    if (!addressDetails.full_name || !addressDetails.phone_number) {
      alert("Please enter your name and phone number");
      return false;
    }

    try {
      await createAddress({
        full_name: addressDetails.full_name,
        phone_number: addressDetails.phone_number,
        address_line1: selectedLocation?.address || "",
        city: addressDetails.city,
        county: addressDetails.county,
        latitude: selectedLocation?.lat,
        longitude: selectedLocation?.lng,
        is_default: true,
      });
      return true;
    } catch (error) {
      console.error("Failed to save address:", error);
      return false;
    }
  };

  const pollPaymentStatus = async (checkoutRequestId, maxAttempts = 15) => {
    let attempts = 0;
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
    const poll = setInterval(async () => {
      attempts++;
      try {
        const response = await fetch(
          `${API_URL}/mpesa/status/${checkoutRequestId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          },
        );
        const data = await response.json();

        if (data.status === "paid") {
          clearInterval(poll);
          alert("Payment successful! Your order has been confirmed.");
          await clearCart();
          navigate("/orders");
        } else if (attempts >= maxAttempts) {
          clearInterval(poll);
          alert(
            "Payment confirmation is taking longer. Please check your orders page later.",
          );
          navigate("/orders");
        }
      } catch (error) {
        console.error("Status check error:", error);
        if (attempts >= maxAttempts) {
          clearInterval(poll);
        }
      }
    }, 3000);
  };

  const handlePayment = async () => {
    console.log("=== HANDLE PAYMENT STARTED ===");

    const token = localStorage.getItem("access_token");
    console.log("Token found:", !!token);

    if (!token) {
      alert("Please login to continue");
      navigate("/login");
      return;
    }

    if (paymentMethod === "mpesa" && (!phone || phone.length < 10)) {
      alert("Please enter a valid M-Pesa phone number");
      return;
    }

    if (!skipAddress && !selectedLocation) {
      alert('Please either pick a delivery location or click "Skip Address"');
      return;
    }

    setIsProcessing(true);

    try {
      // Save address if not skipped
      if (!skipAddress && selectedLocation) {
        await handleSaveAddress();
      }

      // Check if cart has items
      if (!items || items.length === 0) {
        alert("Your cart is empty");
        setIsProcessing(false);
        return;
      }

      // Map cart items to order items
      const orderItems = items.map((item) => ({
        product_id: item.product_id || item.product?.id,
        quantity: item.quantity,
        price: item.product?.price || item.price,
      }));

      console.log("Order items:", orderItems);
      console.log("Grand total:", grandTotal);

      // Create order
      const orderResponse = await fetch(`${API_URL}/orders/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: orderItems,
          total: grandTotal,
        }),
      });

      console.log("Order response status:", orderResponse.status);

      if (orderResponse.status === 401) {
        alert("Your session has expired. Please login again.");
        localStorage.removeItem("access_token");
        navigate("/login");
        return;
      }

      const orderData = await orderResponse.json();
      console.log("Order response:", orderData);

      if (!orderResponse.ok) {
        throw new Error(orderData.detail || "Failed to create order");
      }

      const orderId = orderData.order_id;

      if (paymentMethod === "mpesa") {
        // Format phone number before sending
        let formattedPhone = phone.toString().replace(/\D/g, "");
        if (formattedPhone.startsWith("0")) {
          formattedPhone = "254" + formattedPhone.substring(1);
        }
        if (!formattedPhone.startsWith("254")) {
          formattedPhone = "254" + formattedPhone;
        }

        console.log("Sending payment with:", {
          amount: grandTotal,
          phone_number: formattedPhone,
          order_id: orderId,
        });

        // Initiate M-Pesa STK Push - WITH CORRECT AUTH HEADER
        const paymentResponse = await fetch(`${API_URL}/mpesa/stkpush`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ← THIS WAS MISSING!
          },
          body: JSON.stringify({
            amount: grandTotal, // Round up to whole number
            phone_number: formattedPhone, // Use formatted phone
            order_id: orderId,
          }),
        });

        console.log("Payment response status:", paymentResponse.status);
        const paymentData = await paymentResponse.json();
        console.log("Payment response:", paymentData);

        if (paymentData.success) {
          setCheckoutRequestId(paymentData.checkout_request_id);
          alert(
            `STK push sent to ${formattedPhone}. Please check your phone and enter your PIN to complete payment.`,
          );
          pollPaymentStatus(paymentData.checkout_request_id);
        } else {
          alert(
            `Payment initiation failed: ${paymentData.message || paymentData.response_description}`,
          );
          setIsProcessing(false);
        }
      } else {
        alert("Order placed successfully!");
        navigate("/orders");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert(`Checkout failed: ${error.message}`);
      setIsProcessing(false);
    }
  };

  const formatMoney = (amount) => {
    return `KSh ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-warm flex items-center justify-center py-12 px-4">
        <div className="text-center max-w-md mx-auto bg-white border-4 border-black shadow-hard-lg p-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-terra/10 border-4 border-terra mb-6">
            <FiShoppingBag className="w-10 h-10 text-terra" />
          </div>
          <h2 className="font-h text-2xl font-bold text-black uppercase mb-4">
            Your cart is empty
          </h2>
          <p className="text-ash mb-6">
            Add some products to your cart before checking out.
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
    <div className="min-h-screen bg-warm py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Page Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="absolute left-4 top-24 text-black hover:text-terra transition-colors flex items-center space-x-1 group"
          >
            <FiArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back</span>
          </button>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-terra border-4 border-black shadow-hard-sm mb-4">
            <FiShoppingBag className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-h text-3xl md:text-4xl font-bold text-black uppercase mb-2">
            Checkout
          </h1>
          <div className="brick-line mx-auto"></div>
          <p className="text-ash mt-2">Complete your purchase securely</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Left Column - Delivery Location and Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Location Section */}
            <div className="bg-white border-4 border-black shadow-hard-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-h text-xl font-bold text-black uppercase flex items-center">
                  <FiMapPin className="mr-2 text-terra" />
                  Delivery Location
                </h2>
                {!skipAddress && !showMap && !selectedLocation && (
                  <button
                    onClick={() => setSkipAddress(true)}
                    className="text-terra hover:text-terra-dark text-sm flex items-center space-x-1 font-semibold"
                  >
                    <FiSkipForward className="w-4 h-4" />
                    <span>Skip Address</span>
                  </button>
                )}
              </div>

              {skipAddress ? (
                <div className="bg-yellow-50 border-2 border-yellow-500 p-4">
                  <div className="flex items-start space-x-3">
                    <FiAlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-bold text-black">Address Skipped</p>
                      <p className="text-ash text-sm">
                        You can continue without providing a delivery address.
                      </p>
                      <button
                        onClick={() => {
                          setSkipAddress(false);
                          setShowMap(false);
                        }}
                        className="mt-2 text-terra text-sm font-semibold"
                      >
                        Add Address Instead
                      </button>
                    </div>
                  </div>
                </div>
              ) : showMap ? (
                <div>
                  <p className="text-ash text-sm mb-4">
                    Pin your exact delivery location on the map below:
                  </p>
                  <LocationPicker
                    onLocationSelect={handleLocationSelect}
                    initialLocation={selectedLocation}
                  />
                  {selectedLocation && (
                    <div className="mt-4 flex space-x-3">
                      <button
                        onClick={() => setShowMap(false)}
                        className="flex-1 bg-terra text-white py-2 font-bold border-4 border-black shadow-hard-sm"
                      >
                        Confirm Location
                      </button>
                      <button
                        onClick={() => {
                          setShowMap(false);
                          setSkipAddress(true);
                        }}
                        className="flex-1 bg-gray-300 text-black py-2 font-bold border-4 border-black"
                      >
                        Skip Address
                      </button>
                    </div>
                  )}
                </div>
              ) : selectedLocation ? (
                <div>
                  <div className="bg-green-50 border-2 border-green-500 p-4 mb-4">
                    <div className="flex items-start space-x-3">
                      <FiNavigation className="w-5 h-5 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-bold text-black">Delivery Address</p>
                        <p className="text-ash text-sm">
                          {selectedLocation?.address}
                        </p>
                      </div>
                      <button
                        onClick={() => setShowMap(true)}
                        className="text-terra text-sm font-semibold"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-black uppercase mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={addressDetails.full_name}
                        onChange={(e) =>
                          setAddressDetails({
                            ...addressDetails,
                            full_name: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border-2 border-black focus:ring-2 focus:ring-terra"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-black uppercase mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-black focus:ring-2 focus:ring-terra"
                        placeholder="0712345678"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiMapPin className="w-12 h-12 text-ash mx-auto mb-3" />
                  <p className="text-ash">No delivery address selected</p>
                  <div className="flex space-x-3 justify-center">
                    <button
                      onClick={() => setShowMap(true)}
                      className="bg-terra text-white px-4 py-2 font-bold border-4 border-black shadow-hard-sm"
                    >
                      Add Address
                    </button>
                    <button
                      onClick={() => setSkipAddress(true)}
                      className="bg-gray-300 text-black px-4 py-2 font-bold border-4 border-black flex items-center space-x-2"
                    >
                      <FiSkipForward className="w-4 h-4" />
                      <span>Skip Address</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Methods Section */}
            <div className="bg-white border-4 border-black shadow-hard-sm p-6">
              <h2 className="font-h text-xl font-bold text-black uppercase mb-4 flex items-center">
                <FiSmartphone className="mr-2 text-terra" />
                Payment Methods
              </h2>

              <div className="space-y-4 mb-6">
                {/* M-Pesa Option */}
                <div
                  className={`border-4 cursor-pointer transition-all p-4 ${
                    paymentMethod === "mpesa"
                      ? "border-terra bg-terra/10"
                      : "border-black hover:border-terra/50"
                  }`}
                  onClick={() => setPaymentMethod("mpesa")}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FiSmartphone className="w-6 h-6 text-terra" />
                      <div>
                        <p className="font-h font-bold text-black">M-Pesa</p>
                        <p className="text-sm text-ash">
                          Pay using your M-Pesa account
                        </p>
                      </div>
                    </div>
                    {paymentMethod === "mpesa" && (
                      <FiCheckCircle className="w-6 h-6 text-terra" />
                    )}
                  </div>
                </div>

                {/* Cash on Delivery Option */}
                <div
                  className={`border-4 cursor-pointer transition-all p-4 ${
                    paymentMethod === "cod"
                      ? "border-terra bg-terra/10"
                      : "border-black hover:border-terra/50"
                  }`}
                  onClick={() => setPaymentMethod("cod")}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FiDollarSign className="w-6 h-6 text-terra" />
                      <div>
                        <p className="font-h font-bold text-black">
                          Cash on Delivery
                        </p>
                        <p className="text-sm text-ash">
                          Pay when you receive your order
                        </p>
                      </div>
                    </div>
                    {paymentMethod === "cod" && (
                      <FiCheckCircle className="w-6 h-6 text-terra" />
                    )}
                  </div>
                </div>
              </div>

              {/* M-Pesa Payment Details */}
              {paymentMethod === "mpesa" && (
                <div className="bg-terra/5 border-2 border-terra p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <FiInfo className="w-5 h-5 text-terra" />
                    <p className="font-bold text-black">M-Pesa Instructions</p>
                  </div>
                  <ol className="space-y-1 text-sm text-ash list-decimal list-inside">
                    <li>Enter your M-Pesa registered phone number below</li>
                    <li>Click "Place Order" to initiate payment</li>
                    <li>You will receive an STK Push prompt on your phone</li>
                    <li>Enter your M-Pesa PIN to complete the transaction</li>
                  </ol>
                  <div className="mt-4">
                    <label className="block text-sm font-bold text-black uppercase mb-2">
                      M-Pesa Phone Number *
                    </label>
                    <div className="relative">
                      <FiSmartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ash" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0712345678"
                        className="w-full pl-10 pr-4 py-2 border-2 border-black focus:ring-2 focus:ring-terra"
                        required
                        disabled={isProcessing}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border-4 border-black shadow-hard-lg p-6 sticky top-20">
              <h2 className="font-h text-xl font-bold text-black uppercase text-center mb-4">
                Order Summary
              </h2>
              <div className="brick-line mx-auto mb-6"></div>

              {/* Items List */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto border-b-2 border-black pb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <span className="font-bold text-black">
                        {item.product?.name}
                      </span>
                      <span className="text-ash ml-1">x {item.quantity}</span>
                    </div>
                    <span className="font-bold text-terra">
                      {formatMoney((item.product?.price || 0) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-ash">Subtotal</span>
                  <span className="font-bold text-black">
                    {formatMoney(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ash">Shipping Fee</span>
                  <span className="font-bold text-black">
                    {shippingFee === 0 ? "Free" : formatMoney(shippingFee)}
                  </span>
                </div>
                {subtotal < 5000 && (
                  <div className="bg-yellow-50 border-2 border-yellow-500 p-2 text-xs">
                    Add {formatMoney(5000 - subtotal)} more for free shipping!
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="border-t-2 border-black pt-4 mb-4">
                <div className="flex justify-between text-lg font-bold">
                  <span className="font-h text-black">Total</span>
                  <span className="font-h text-2xl text-terra">
                    {formatMoney(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Delivery Estimate */}
              <div className="bg-terra/5 border-2 border-terra p-3 mb-4 flex items-center space-x-2">
                <FiTruck className="w-4 h-4 text-terra" />
                <p className="text-xs text-black font-semibold">
                  Estimated delivery: 2-4 business days
                </p>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-terra text-white py-3 font-bold uppercase border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  `Place Order - ${formatMoney(grandTotal)}`
                )}
              </button>

              {/* Trust Badges */}
              <div className="mt-4 text-center">
                <div className="flex justify-center space-x-4 text-ash text-xs">
                  <span className="flex items-center space-x-1">
                    <FiShield className="w-3 h-3 text-terra" />
                    <span>Secure Payment</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <FiClock className="w-3 h-3 text-terra" />
                    <span>Fast Delivery</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
