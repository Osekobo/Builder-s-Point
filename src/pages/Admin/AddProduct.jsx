// src/components/AddProduct.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AddProduct.css";
import api from "../../api/client";
// Configure axios base URL
const API_BASE_URL = "http://localhost:8000";

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    subcategory: "",
    stock: "",
    rating: 0,
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errors, setErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(`${API_BASE_URL}/products/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Product name must be at least 2 characters";
    } else if (formData.name.length > 100) {
      newErrors.name = "Product name must be less than 100 characters";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    if (!formData.price) {
      newErrors.price = "Price is required";
    } else if (parseFloat(formData.price) <= 0) {
      newErrors.price = "Price must be greater than 0";
    } else if (parseFloat(formData.price) > 1000000) {
      newErrors.price = "Price must be less than 1,000,000";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.stock) {
      newErrors.stock = "Stock quantity is required";
    } else if (parseInt(formData.stock) < 0) {
      newErrors.stock = "Stock cannot be negative";
    } else if (parseInt(formData.stock) > 999999) {
      newErrors.stock = "Stock quantity is too high";
    }

    if (!selectedFile) {
      newErrors.file = "Product image is required";
    } else {
      // Validate file type and size
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!validTypes.includes(selectedFile.type)) {
        newErrors.file =
          "Please upload a valid image (JPEG, PNG, GIF, or WEBP)";
      } else if (selectedFile.size > 5 * 1024 * 1024) {
        newErrors.file = "Image size must be less than 5MB";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);

      // Clear file error
      if (errors.file) {
        setErrors((prev) => ({ ...prev, file: "" }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll to first error
      const firstError = Object.keys(errors)[0];
      const errorElement = document.querySelector(`[name="${firstError}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name.trim());
    formDataToSend.append("description", formData.description.trim());
    formDataToSend.append("price", parseFloat(formData.price));
    formDataToSend.append("category", formData.category);
    formDataToSend.append("stock", parseInt(formData.stock));
    formDataToSend.append("rating", parseFloat(formData.rating));

    if (formData.subcategory) {
      formDataToSend.append("subcategory", formData.subcategory);
    }

    if (selectedFile) {
      formDataToSend.append("file", selectedFile);
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.post(
        `${API_BASE_URL}/products/`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
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

      if (response.status === 200 || response.status === 201) {
        // Show success message
        alert("Product created successfully!");
        // Navigate to products list or product detail page
        navigate("/products");
      }
    } catch (error) {
      console.error("Error creating product:", error);

      if (error.response) {
        // Server responded with error
        const errorMessage =
          error.response.data.detail || "Failed to create product";

        if (error.response.status === 400) {
          setErrors({ submit: errorMessage });
        } else if (error.response.status === 401) {
          alert("Please login to continue");
          navigate("/login");
        } else if (error.response.status === 413) {
          setErrors({ file: "File too large. Maximum size is 5MB" });
        } else {
          setErrors({ submit: errorMessage });
        }
      } else if (error.request) {
        // Request was made but no response
        setErrors({
          submit:
            "Network error. Please check if the backend server is running on http://localhost:8000",
        });
      } else {
        // Something else happened
        setErrors({ submit: "An unexpected error occurred." });
      }
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleCancel = () => {
    if (
      window.confirm(
        "Are you sure you want to cancel? Any unsaved changes will be lost.",
      )
    ) {
      navigate("/products");
    }
  };

  return (
    <div className="add-product-container">
      <div className="add-product-card">
        <div className="card-header">
          <h2>Add New Product</h2>
          <p>Fill in the product details below</p>
        </div>

        {errors.submit && (
          <div className="alert alert-error">{errors.submit}</div>
        )}

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">
                Product Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? "error" : ""}
                placeholder="Enter product name"
                maxLength="100"
              />
              {errors.name && (
                <span className="error-message">{errors.name}</span>
              )}
              <small className="char-count">{formData.name.length}/100</small>
            </div>

            <div className="form-group">
              <label htmlFor="price">
                Price ($) <span className="required">*</span>
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className={errors.price ? "error" : ""}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              {errors.price && (
                <span className="error-message">{errors.price}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">
              Description <span className="required">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={errors.description ? "error" : ""}
              placeholder="Enter product description"
              rows="5"
              maxLength="1000"
            />
            {errors.description && (
              <span className="error-message">{errors.description}</span>
            )}
            <small className="char-count">
              {formData.description.length}/1000
            </small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">
                Category <span className="required">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={errors.category ? "error" : ""}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
                <option value="other">Other</option>
              </select>
              {errors.category && (
                <span className="error-message">{errors.category}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="subcategory">Subcategory (Optional)</label>
              <input
                type="text"
                id="subcategory"
                name="subcategory"
                value={formData.subcategory}
                onChange={handleInputChange}
                placeholder="e.g., Electronics > Smartphones"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="stock">
                Stock Quantity <span className="required">*</span>
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                className={errors.stock ? "error" : ""}
                placeholder="0"
                min="0"
              />
              {errors.stock && (
                <span className="error-message">{errors.stock}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="rating">Initial Rating (0-5)</label>
              <input
                type="number"
                id="rating"
                name="rating"
                value={formData.rating}
                onChange={handleInputChange}
                placeholder="0"
                step="0.5"
                min="0"
                max="5"
              />
              <small>Optional - Default is 0</small>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="product-image">
              Product Image <span className="required">*</span>
            </label>
            <div className="image-upload-area">
              <input
                type="file"
                id="product-image"
                name="product-image"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleFileChange}
                className={errors.file ? "error" : ""}
                style={{ display: "none" }}
              />
              {previewUrl ? (
                <div className="image-preview">
                  <img src={previewUrl} alt="Product preview" />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div
                  className="image-upload-placeholder"
                  onClick={() =>
                    document.getElementById("product-image").click()
                  }
                >
                  <div className="upload-icon">📸</div>
                  <p>Click to upload product image</p>
                  <small>
                    Supported formats: JPEG, PNG, GIF, WEBP (Max 5MB)
                  </small>
                </div>
              )}
              {errors.file && (
                <span className="error-message">{errors.file}</span>
              )}
            </div>
          </div>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span>{uploadProgress}% uploaded</span>
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Creating Product...
                </>
              ) : (
                "Create Product"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
