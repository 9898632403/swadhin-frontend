import React, { useState, useContext, useCallback } from "react";
import { UserContext } from "../context/UserContext";
import "../styles/Addform.css";
import axios from "axios";
import { BASE_URL } from "../config"; // ✅ ADDED

export default function ProductForm() {
  const { userInfo } = useContext(UserContext);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    colors: "",
    sizes: ""
  });

  const [mainImage, setMainImage] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.price || Number(formData.price) <= 0) newErrors.price = "Valid price is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!mainImage) newErrors.mainImage = "Main image is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, mainImage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match("image.*")) {
        setErrors(prev => ({ ...prev, mainImage: "Please select an image file" }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, mainImage: "File size should be less than 5MB" }));
        return;
      }
      setMainImage(file);
      setErrors(prev => ({ ...prev, mainImage: "" }));
    }
  };

  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      return file.type.match("image.*") && file.size <= 5 * 1024 * 1024;
    });

    if (validFiles.length !== files.length) {
      setErrors(prev => ({
        ...prev,
        additionalImages: "Some files were invalid (must be images <5MB)"
      }));
    } else {
      setErrors(prev => ({ ...prev, additionalImages: "" }));
    }

    setAdditionalImages(prev => [...prev, ...validFiles]);
  };

  const removeAdditionalImage = (index) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await axios.post(`${BASE_URL}/api/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "X-User-Email": userInfo.email,
      }
    });

    return response.data.url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");

    if (!userInfo || !userInfo.email) {
      alert("You must be logged in to add products.");
      return;
    }

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const mainImageUrl = await uploadImage(mainImage);
      const additionalImageUrls = await Promise.all(additionalImages.map(uploadImage));

      const payload = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        image: mainImageUrl,
        images: additionalImageUrls,
        description: formData.description.trim(),
        colors: formData.colors
          .split(",")
          .map(c => c.trim())
          .filter(Boolean),
        sizes: formData.sizes
          .split(",")
          .map(s => s.trim())
          .filter(Boolean)
      };

      const response = await axios.post(`${BASE_URL}/api/products`, payload, {
        headers: {
          "Content-Type": "application/json",
          "X-User-Email": userInfo.email,
        }
      });

      setSuccessMessage("Product added successfully!");
      setFormData({ name: "", price: "", description: "", colors: "", sizes: "" });
      setMainImage(null);
      setAdditionalImages([]);
    } catch (err) {
      console.error("Error:", err);
      setErrors(prev => ({
        ...prev,
        submit: err.response?.data?.error || "Failed to add product. Please try again."
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!userInfo || !userInfo.email) {
    return (
      <div className="alert alert-warning">
        Please log in to add products.
      </div>
    );
  }

  return (
    <div className="product-form-container">
      <form onSubmit={handleSubmit} className="product-form">
        <h2 className="form-title">Add New Product</h2>

        {successMessage && <div className="alert alert-success">{successMessage}</div>}
        {errors.submit && <div className="alert alert-danger">{errors.submit}</div>}

        <div className="form-group">
          <label>Product Name*</label>
          <input type="text" name="name" value={formData.name}
            className={`form-control ${errors.name ? "is-invalid" : ""}`}
            onChange={handleChange} />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>

        <div className="form-group">
          <label>Price*</label>
          <input type="number" name="price" value={formData.price}
            className={`form-control ${errors.price ? "is-invalid" : ""}`}
            onChange={handleChange} />
          {errors.price && <div className="invalid-feedback">{errors.price}</div>}
        </div>

        <div className="form-group">
          <label>Description*</label>
          <textarea name="description" value={formData.description}
            className={`form-control ${errors.description ? "is-invalid" : ""}`}
            onChange={handleChange}></textarea>
          {errors.description && <div className="invalid-feedback">{errors.description}</div>}
        </div>

        <div className="form-group">
          <label>Colors (comma separated)</label>
          <input type="text" name="colors" value={formData.colors}
            className="form-control" onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Sizes (comma separated)</label>
          <input type="text" name="sizes" value={formData.sizes}
            className="form-control" onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Main Product Image*</label>
          <input type="file" accept="image/*"
            className={`form-control-file ${errors.mainImage ? "is-invalid" : ""}`}
            onChange={handleMainImageChange} />
          {errors.mainImage && <div className="invalid-feedback d-block">{errors.mainImage}</div>}
          {mainImage && (
            <img src={URL.createObjectURL(mainImage)} alt="Preview" className="img-thumbnail mt-2" style={{ maxHeight: "150px" }} />
          )}
        </div>

        <div className="form-group">
          <label>Additional Images</label>
          <input type="file" multiple accept="image/*"
            className="form-control-file"
            onChange={handleAdditionalImagesChange} />
          <div className="additional-images-preview mt-2">
            {additionalImages.map((img, i) => (
              <div key={i} className="image-preview-item mb-2">
                <img src={URL.createObjectURL(img)} className="img-thumbnail" style={{ maxHeight: "100px" }} alt={`Preview ${i + 1}`} />
                <p>{img.name}</p>
                <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeAdditionalImage(i)}>Remove</button>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Adding Product..." : "Add Product"}
        </button>
      </form>
    </div>
  );
}
