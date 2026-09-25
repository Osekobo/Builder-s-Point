import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaCube,
  FaImage,
  FaBagShopping,
  FaTrash,
  FaFloppyDisk,
  FaXmark,
  FaTag,
  FaFolder,
  FaUpload,
  FaRotate,
} from "react-icons/fa6";
import api from "../../api/client";
import { getImageUrl } from "../../utils/image";
import { logError } from "../../utils/logger";
import ConfirmModal from "../../components/Common/ConfirmModal";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    subcategory: "",
    stock: "",
  });

  const categories = [
    { id: "building", name: "Building Materials", icon: "🧱" },
    { id: "paints", name: "Paints", icon: "🎨" },
    { id: "hardware", name: "Hardware Tools", icon: "🔧" },
    { id: "plumbing", name: "Plumbing", icon: "🚰" },
    { id: "electrical", name: "Electrical", icon: "⚡" },
    { id: "general", name: "General Store", icon: "🏪" },
  ];

  const fetchProduct = useCallback(async () => {
    try {
      const response = await api.get(`/products/${id}`);
      const product = response.data;
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        category: product.category || "building",
        subcategory: product.subcategory || "",
        stock: product.stock || "",
      });

      if (product.file_image) {
        const imageUrl = getImageUrl(product.file_image);
        setPreviewUrl(imageUrl);
      }
    } catch (error) {
      logError("Error fetching product:", error);
      toast.error("Failed to load product details");
      navigate("/admin/products");
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a valid image (JPEG, PNG, GIF, or WEBP)");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      setSelectedFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!selectedFile) return null;

    setIsUploading(true);
    setUploadProgress(0);

    const formDataToSend = new FormData();
    formDataToSend.append("file", selectedFile);

    try {
      const response = await api.post(
        `/products/${id}/upload-image`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total,
              );
              setUploadProgress(percentCompleted);
            }
          },
        },
      );

      setUploadProgress(0);
      return response.data.file_image;
    } catch (error) {
      logError("Error uploading image:", error);
      if (error.response?.status === 413) {
        toast.error("File too large. Maximum size is 5MB");
      } else if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error("Failed to upload image. Please try again.");
      }
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      let imageUploaded = false;
      if (selectedFile) {
        const uploadedUrl = await uploadImage();
        if (!uploadedUrl) {
          setIsSaving(false);
          return;
        }
        imageUploaded = true;
      }

      const updateData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        subcategory: formData.subcategory || null,
        stock: parseInt(formData.stock),
      };

      await api.put(`/products/${id}`, updateData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      toast.success(
        imageUploaded
          ? "Product updated with new image successfully!"
          : "Product updated successfully!",
      );
      navigate("/admin/products");
    } catch (error) {
      logError("Error updating product:", error);
      let errorMessage = "Failed to update product";
      if (error.response?.status === 400) {
        errorMessage = error.response.data.detail || "Invalid data provided";
      } else if (error.response?.status === 401) {
        errorMessage = "Please login to update products";
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!previewUrl) {
      toast.error("This product has no image to delete");
      return;
    }

    if (
      window.confirm(
        "Are you sure you want to delete the product image? This action cannot be undone.",
      )
    ) {
      try {
        await api.delete(`/products/${id}/image`);

        setPreviewUrl(null);
        setSelectedFile(null);
        toast.success("Product image deleted successfully!");
      } catch (error) {
        logError("Error deleting image:", error);
        toast.error(
          "Failed to delete image: " +
            (error.response?.data?.detail || error.message),
        );
      }
    }
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);

    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted successfully!");
      navigate("/admin/products");
    } catch (error) {
      logError("Error deleting product:", error);
      toast.error(
        "Failed to delete product: " +
          (error.response?.data?.detail || error.message),
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terra mx-auto mb-4"></div>
          <p className="text-ash">Loading product details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm py-3 px-3 md:py-4">
      <div className="mx-auto w-full max-w-5xl">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-terra border-4 border-black shadow-hard-sm mb-4">
            <FaCube className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-h text-3xl md:text-4xl font-bold text-black uppercase mb-2">
            Edit Product
          </h1>
          <div className="brick-line mx-auto"></div>
          <p className="text-ash mt-2">
            Update product information and inventory
          </p>
        </div>

        
        <div className="bg-white border-4 border-black shadow-hard-lg p-8">
          <div className="flex justify-between items-center mb-6 pb-4 border-b-4 border-black">
            <h2 className="font-h text-xl font-bold text-black uppercase">
              Product Details
            </h2>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || isSaving || isUploading}
              className="bg-red-600 text-white px-4 py-2 font-bold uppercase tracking-wider border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaTrash className="w-5 h-5" />
              <span>Delete Product</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label className="block text-sm font-bold text-black uppercase tracking-wider mb-2">
                Product Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCube className="h-5 w-5 text-ash" />
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

            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div>
                <label className="block text-sm font-bold text-black uppercase tracking-wider mb-2">
                  Category *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaFolder className="h-5 w-5 text-ash" />
                  </div>
                  <select
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-terra bg-white"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              
              <div>
                <label className="block text-sm font-bold text-black uppercase tracking-wider mb-2">
                  Subcategory (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaTag className="h-5 w-5 text-ash" />
                  </div>
                  <input
                    type="text"
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleChange}
                    placeholder="e.g., cement, power_tools, interior_paint"
                    className="w-full pl-10 pr-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-terra"
                  />
                </div>
              </div>
            </div>

            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div>
                <label className="block text-sm font-bold text-black uppercase tracking-wider mb-2">
                  Price (KSh) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaTag className="h-5 w-5 text-ash" />
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

              
              <div>
                <label className="block text-sm font-bold text-black uppercase tracking-wider mb-2">
                  Stock Quantity *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaBagShopping className="h-5 w-5 text-ash" />
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

            
            <div>
              <label className="block text-sm font-bold text-black uppercase tracking-wider mb-2">
                Product Image
              </label>

              
              {previewUrl && (
                <div className="mb-4">
                  <div className="relative inline-block">
                    <div className="w-32 h-32 border-4 border-black overflow-hidden bg-gray-100">
                      <img
                        src={previewUrl}
                        alt={formData.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src =
                            "https://placehold.co/400x400/D6B896/121518?text=Image+Error";
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleDeleteImage}
                      className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full border-2 border-black hover:bg-red-700 transition-colors"
                      title="Delete image"
                    >
                      <FaXmark className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-ash mt-2">Current product image</p>
                </div>
              )}

              
              <div className="mt-2">
                <div className="flex items-center justify-center w-full">
                  <label
                    className={`flex flex-col items-center justify-center w-full h-32 border-4 border-black border-dashed cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FaUpload className="w-8 h-8 mb-2 text-terra" />
                      <p className="mb-2 text-sm text-black">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-ash">
                        PNG, JPG, GIF, WEBP (MAX. 5MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleFileChange}
                      disabled={isUploading}
                    />
                  </label>
                </div>

                
                {isUploading && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-terra">
                        Uploading...
                      </span>
                      <span className="text-xs text-ash">
                        {uploadProgress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-terra h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {selectedFile && !isUploading && (
                  <div className="mt-2 flex items-center space-x-2 text-sm">
                    <FaRotate className="text-green-600" />
                    <span className="text-green-600">
                      New image selected: {selectedFile.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        fetchProduct();
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <FaXmark className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <p className="text-xs text-ash mt-2">
                * Upload a new image to replace the current one. Images are
                uploaded separately using the image upload endpoint.
              </p>
            </div>

            
            <div className="flex space-x-4 pt-6 border-t-2 border-black">
              <button
                type="submit"
                disabled={isSaving || isUploading}
                className="flex-1 bg-terra text-white py-3 font-bold uppercase tracking-wider border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSaving || isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>
                      {isUploading ? "Uploading Image..." : "Saving..."}
                    </span>
                  </>
                ) : (
                  <>
                    <FaFloppyDisk className="w-5 h-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/products")}
                className="flex-1 bg-gray-300 text-black py-3 font-bold uppercase tracking-wider border-4 border-black shadow-hard-sm hover:bg-gray-400 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center space-x-2"
              >
                <FaXmark className="w-5 h-5" />
                <span>Cancel</span>
              </button>
            </div>
          </form>
        </div>

        
        <div className="mt-6 text-center">
          <p className="text-xs text-ash">
            All fields marked with * are required. Changes will be reflected
            immediately on the store.
          </p>
        </div>

        <ConfirmModal
          isOpen={isDeleteModalOpen}
          title="Delete Product"
          message="Are you sure you want to delete this product? This action cannot be undone."
          confirmLabel="Delete Product"
          isLoading={isDeleting}
          onConfirm={confirmDelete}
          onCancel={() => setIsDeleteModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default EditProduct;
