import React, { useState, useContext, useCallback, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import axios from "axios";
import "../styles/HeroSlideForm.css";
import { BASE_URL } from "../config";

export default function HeroSlideForm() {
  const { userInfo } = useContext(UserContext);
  const userEmail = userInfo?.email || userInfo?.user?.email || "";

  const initialFormState = {
    type: "image",
    srcType: "url",
    src: "",
    text: "",
    subtitle: "",
    overlayColor: "rgba(0,0,0,0.3)"
  };

  const [formData, setFormData] = useState(initialFormState);
  const [filePreview, setFilePreview] = useState(null);
  const [fileUpload, setFileUpload] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [slides, setSlides] = useState([]);

  useEffect(() => {
    fetchSlides();
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  const fetchSlides = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/admin/hero-slide`, {
        headers: { "X-User-Email": userEmail },
      });
      setSlides(res.data.slides);
    } catch (err) {
      console.error("Failed to fetch slides:", err);
    }
  };

  const deleteSlide = async (id) => {
    if (!window.confirm("Are you sure you want to delete this slide?")) return;
    try {
      await axios.delete(`${BASE_URL}/admin/hero-slide/${id}`, {
        headers: { "X-User-Email": userEmail },
      });
      setSlides((prev) => prev.filter((slide) => slide._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete slide.");
    }
  };

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.text.trim()) newErrors.text = "Heading is required";
    if (!formData.subtitle.trim()) newErrors.subtitle = "Subtitle is required";
    if (!formData.overlayColor.trim()) newErrors.overlayColor = "Overlay color required";

    if (formData.srcType === "url" && !formData.src.trim()) {
      newErrors.src = "Media source is required";
    } else if (formData.srcType === "device" && !fileUpload) {
      newErrors.src = "Please upload a file";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, fileUpload]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value || "" }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isValid =
      (formData.type === "image" && file.type.startsWith("image/")) ||
      (formData.type === "video" && file.type.startsWith("video/"));

    if (!isValid) {
      setErrors(prev => ({ ...prev, src: "Invalid file type selected." }));
      return;
    }

    if (filePreview) URL.revokeObjectURL(filePreview);
    const previewUrl = URL.createObjectURL(file);
    setFileUpload(file);
    setFilePreview(previewUrl);
    setMessage({ text: "File selected. Upload will begin on submit.", type: "info" });
  };

  const uploadFile = async () => {
    if (!fileUpload) return formData.src;

    setMessage({ text: "Uploading file...", type: "info" });

    const form = new FormData();
    form.append("file", fileUpload);

    try {
      const res = await axios.post(`${BASE_URL}/upload/hero`, form, {
        headers: { "X-User-Email": userEmail }
      });

      return res.data.fileUrl; // ✅ Cloudinary URL returned from backend
    } catch (err) {
      console.error(err);
      setMessage({
        text: err.response?.data?.message || "❌ File upload failed",
        type: "error"
      });
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    if (!userEmail) {
      setMessage({ text: "❌ Admin not authenticated.", type: "error" });
      return;
    }

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const src = formData.srcType === "device" ? await uploadFile() : formData.src.trim();
      const payload = {
        ...formData,
        src,
        text: formData.text.trim(),
        subtitle: formData.subtitle.trim(),
        overlayColor: formData.overlayColor.trim(),
      };

      await axios.post(`${BASE_URL}/admin/hero-slide`, payload, {
        headers: {
          "Content-Type": "application/json",
          "X-User-Email": userEmail,
        }
      });

      setMessage({ text: "✅ Slide uploaded successfully!", type: "success" });
      setFormData(initialFormState);
      setFileUpload(null);
      setFilePreview(null);
      setErrors({});
      fetchSlides();
    } catch (err) {
      console.error(err);
      setMessage({
        text: err.response?.data?.message || "❌ Failed to upload slide.",
        type: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!userEmail) {
    return <div className="alert alert-warning">Please log in as admin to upload hero slides.</div>;
  }

  return (
    <div className="product-form-container">
      <form onSubmit={handleSubmit} className="product-form">
        <h2 className="form-title">Add Hero Slide</h2>

        {message.text && (
          <div className={`alert alert-${message.type === "error" ? "danger" : "success"}`}>
            {message.text}
          </div>
        )}

        <div className="form-group">
          <label>Slide Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="form-control"
          >
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </div>

        <div className="form-group">
          <label>Source Type</label>
          <select
            name="srcType"
            value={formData.srcType}
            onChange={handleInputChange}
            className="form-control"
          >
            <option value="url">Paste URL</option>
            <option value="device">Upload from Device</option>
          </select>
        </div>

        {formData.srcType === "url" ? (
          <div className="form-group">
            <label>{formData.type === "video" ? "Video URL" : "Image URL"}*</label>
            <input
              type="url"
              name="src"
              value={formData.src}
              onChange={handleInputChange}
              className={`form-control ${errors.src ? "is-invalid" : ""}`}
              placeholder={`Enter ${formData.type} URL (e.g., https://...)`}
            />
            {errors.src && <div className="invalid-feedback">{errors.src}</div>}
          </div>
        ) : (
          <div className="form-group">
            <label>Upload {formData.type === "video" ? "Video" : "Image"}*</label>
            <input
              type="file"
              accept={formData.type === "video" ? "video/*" : "image/*"}
              className={`form-control-file ${errors.src ? "is-invalid" : ""}`}
              onChange={handleFileChange}
              key={filePreview ? "with-preview" : "no-preview"}
            />
            {filePreview && (
              formData.type === "image" ? (
                <img
                  src={filePreview}
                  alt="preview"
                  className="img-thumbnail mt-2"
                  style={{ maxHeight: "180px" }}
                />
              ) : (
                <video
                  src={filePreview}
                  controls
                  className="img-thumbnail mt-2"
                  style={{ maxHeight: "180px" }}
                />
              )
            )}
            {errors.src && <div className="invalid-feedback d-block">{errors.src}</div>}
          </div>
        )}

        <div className="form-group">
          <label>Heading*</label>
          <input
            type="text"
            name="text"
            value={formData.text}
            onChange={handleInputChange}
            className={`form-control ${errors.text ? "is-invalid" : ""}`}
            placeholder="Main heading text"
          />
          {errors.text && <div className="invalid-feedback">{errors.text}</div>}
        </div>

        <div className="form-group">
          <label>Subtitle*</label>
          <input
            type="text"
            name="subtitle"
            value={formData.subtitle}
            onChange={handleInputChange}
            className={`form-control ${errors.subtitle ? "is-invalid" : ""}`}
            placeholder="Supporting text"
          />
          {errors.subtitle && <div className="invalid-feedback">{errors.subtitle}</div>}
        </div>

        <div className="form-group">
          <label>Overlay Color*</label>
          <div className="input-group">
            <input
              type="color"
              value={formData.overlayColor.startsWith("#") ? formData.overlayColor : "#000000"}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, overlayColor: e.target.value }))
              }
              className="form-control form-control-color"
            />
            <input
              type="text"
              name="overlayColor"
              value={formData.overlayColor}
              onChange={handleInputChange}
              className={`form-control ${errors.overlayColor ? "is-invalid" : ""}`}
              placeholder="rgba(0,0,0,0.3)"
            />
          </div>
          {errors.overlayColor && <div className="invalid-feedback">{errors.overlayColor}</div>}
        </div>

        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Uploading...
            </>
          ) : (
            "Upload Slide"
          )}
        </button>
      </form>

      {slides.length > 0 && (
        <div className="mt-4">
          <h4 className="mb-3">All Hero Slides</h4>
          <table className="table table-bordered table-hover">
            <thead>
              <tr>
                <th>Preview</th>
                <th>Heading</th>
                <th>Subtitle</th>
                <th>Type</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {slides.map((slide) => (
                <tr key={slide._id}>
                  <td style={{ width: 150 }}>
                    {slide.type === "image" ? (
                      <img src={slide.src} alt="slide" style={{ width: 120, height: 60, objectFit: "cover" }} />
                    ) : (
                      <video src={slide.src} width={120} height={60} controls muted />
                    )}
                  </td>
                  <td>{slide.text}</td>
                  <td>{slide.subtitle}</td>
                  <td>{slide.type}</td>
                  <td>
                    <button onClick={() => deleteSlide(slide._id)} className="btn btn-danger btn-sm">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
