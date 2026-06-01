import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";
import useAuthStore from "../../store/authStore";
import {
  FiPlus,
  FiPackage,
  FiImage,
  FiShoppingBag,
  FiTrash2,
} from "react-icons/fi";
import { FaMoneyBill1Wave } from "react-icons/fa6";
import { IoMdImages } from "react-icons/io";

const AddProduct = () => {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "building",
    subcategory: "",
    file_image: null, // Changed from "" to null
    stock: "",
  });
  
  // Add preview state for the image
  const [imagePreview, setImagePreview] = useState(null);

  const categories = [
    { id: "building", name: "Building Materials", icon: "🧱" },
    { id: "paints", name: "Paints", icon: "🎨" },
    { id: "hardware", name: "Hardware Tools", icon: "🔧" },
    { id: "plumbing", name: "Plumbing", icon: "🚰" },
    { id: "electrical", name: "Electrical", icon: "⚡" },
    { id: "general", name: "General Store", icon: "🏪" },
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle file selection separately
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        file_image: file,
      });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", parseFloat(formData.price));
      formDataToSend.append("category", formData.category);
      formDataToSend.append("subcategory", formData.subcategory);
      formDataToSend.append("stock", parseInt(formData.stock));
      formDataToSend.append("rating", "0");
      
      // Append the actual file, not a string
      if (formData.file_image) {
        formDataToSend.append("file_image", formData.file_image);
      } else {
        // Optional: Send a default image URL if no file selected
        formDataToSend.append("file_image", "https://placehold.co/400x400/D6B896/121518?text=Product");
      }

      // Important: Don't set Content-Type header - let the browser set it with boundary
      const response = await api.post("/products/", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Product added successfully!");
      navigate("/products");
    } catch (error) {
      console.error("Error adding product:", error);
      
      // Better error logging
      if (error.response?.status === 422) {
        console.error("Validation errors:", error.response.data);
        const errorMessage = error.response.data?.detail || 
                           JSON.stringify(error.response.data) || 
                           "Validation failed. Please check all fields.";
        alert(`Failed to add product: ${errorMessage}`);
      } else {
        alert(
          "Failed to add product: " +
            (error.response?.data?.detail || error.message),
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-terra border-4 border-black shadow-hard-sm mb-4">
            <FiPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-h text-3xl md:text-4xl font-bold text-black uppercase mb-2">
            Add New Product
          </h1>
          <div className="brick-line mx-auto"></div>
          <p className="text-ash mt-2">
            Fill in the details to add a new product to your store
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white border-4 border-black shadow-hard-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-bold text-black uppercase tracking-wider mb-2">
                Product Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiPackage className="h-5 w-5 text-ash" />
                </div>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  className="w-full pl-10 pr-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-terra"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-black uppercase tracking-wider mb-2">
                Description *
              </label>
              <textarea
                name="description"
                required
                rows="4"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter product description"
                className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-terra resize-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-bold text-black uppercase tracking-wider mb-2">
                Category *
              </label>
              <select
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-terra bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategory */}
            <div>
              <label className="block text-sm font-bold text-black uppercase tracking-wider mb-2">
                Subcategory (Optional)
              </label>
              <input
                type="text"
                name="subcategory"
                value={formData.subcategory}
                onChange={handleChange}
                placeholder="e.g., cement, power_tools, interior_paint"
                className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-terra"
              />
            </div>

            {/* Price and Stock Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Price */}
              <div>
                <label className="block text-sm font-bold text-black uppercase tracking-wider mb-2">
                  Price (KSh)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaMoneyBill1Wave className="h-5 w-5 text-ash" />
                  </div>
                  <input
                    type="number"
                    name="price"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full pl-10 pr-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-terra"
                  />
                </div>
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-bold text-black uppercase tracking-wider mb-2">
                  Stock Quantity
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiShoppingBag className="h-5 w-5 text-ash" />
                  </div>
                  <input
                    type="number"
                    name="stock"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full pl-10 pr-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-terra"
                  />
                </div>
              </div>
            </div>

            {/* Image Upload - FIXED */}
            <div>
              <label className="block text-sm font-bold text-black uppercase tracking-wider mb-2">
                Product Image *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IoMdImages className="h-5 w-5 text-ash" />
                </div>
                <input
                  type="file"
                  name="file_image"
                  required
                  onChange={handleFileChange} // Changed from handleChange
                  accept="image/*" // Only accept images
                  className="w-full pl-10 pr-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-terra file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-terra file:text-white file:cursor-pointer hover:file:bg-terra/80"
                />
              </div>
              
              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-4">
                  <p className="text-sm text-ash mb-2">Image Preview:</p>
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-32 h-32 object-cover border-2 border-black"
                  />
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex space-x-4 pt-6 border-t-2 border-black">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-terra text-white py-3 font-bold uppercase tracking-wider border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Adding Product...</span>
                  </div>
                ) : (
                  "Add Product"
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate("/products")}
                className="flex-1 bg-gray-300 text-black py-3 font-bold uppercase tracking-wider border-4 border-black shadow-hard-sm hover:bg-gray-400 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-xs text-ash">
            All fields marked with * are required. Products will be visible
            immediately after addition.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;