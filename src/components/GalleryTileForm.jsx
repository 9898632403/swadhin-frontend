import React, { useState, useContext, useEffect, useCallback } from "react";
import axios from "axios";
import { UserContext } from "../context/UserContext";
import { BASE_URL } from "../config";
import "../styles/HeroSlideForm.css"; // reuse same style for pro look

const GalleryTileForm = () => {
  const { userInfo } = useContext(UserContext);
  const userEmail = userInfo?.email || userInfo?.user?.email || "";

  const [formData, setFormData] = useState({
    type: "image",
    srcType: "url",
    src: "",
    caption: ""
  });

  const [fileUpload, setFileUpload] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [tiles, setTiles] = useState([]);

  useEffect(() => {
    fetchTiles();
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  const fetchTiles = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/admin/gallery`, {
        headers: { "X-User-Email": userEmail }
      });
      setTiles(res.data.tiles || []);
    } catch (err) {
      console.error("Gallery fetch failed:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (filePreview) URL.revokeObjectURL(filePreview);
    const previewUrl = URL.createObjectURL(file);
    setFileUpload(file);
    setFilePreview(previewUrl);
    setMessage({ text: "File selected. Upload will start on submit.", type: "info" });
  };

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.caption.trim()) newErrors.caption = "Caption is required";
    if (formData.srcType === "url" && !formData.src.trim()) {
      newErrors.src = "Media URL is required";
    } else if (formData.srcType === "device" && !fileUpload) {
      newErrors.src = "Please upload a file";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, fileUpload]);

  const uploadFile = async () => {
    if (!fileUpload) return formData.src;
    const form = new FormData();
    form.append("file", fileUpload);

    setMessage({ text: "Uploading file...", type: "info" });

    try {
      const res = await axios.post(`${BASE_URL}/upload/gallery`, form, {
        headers: { "X-User-Email": userEmail }
      });
      return res.data.fileUrl;
    } catch (err) {
      console.error(err);
      setMessage({ text: "❌ File upload failed", type: "error" });
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });
    if (!userEmail) return setMessage({ text: "❌ Admin not authenticated.", type: "error" });
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const src = formData.srcType === "device" ? await uploadFile() : formData.src.trim();
      const payload = {
        type: formData.type,
        src,
        caption: formData.caption.trim()
      };

      await axios.post(`${BASE_URL}/admin/gallery`, payload, {
        headers: {
          "Content-Type": "application/json",
          "X-User-Email": userEmail
        }
      });

      setMessage({ text: "✅ Gallery tile uploaded!", type: "success" });
      setFormData({ type: "image", srcType: "url", src: "", caption: "" });
      setFileUpload(null);
      setFilePreview(null);
      setErrors({});
      fetchTiles();
    } catch (err) {
      console.error(err);
      setMessage({ text: "❌ Upload failed", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteTile = async (id) => {
    if (!window.confirm("Delete this gallery tile?")) return;
    try {
      await axios.delete(`${BASE_URL}/admin/gallery/${id}`, {
        headers: { "X-User-Email": userEmail }
      });
      setTiles((prev) => prev.filter((tile) => tile._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete tile.");
    }
  };

  if (!userEmail) {
    return <div className="alert alert-warning">Please login as admin to upload gallery content.</div>;
  }

  return (
    <div className="product-form-container">
      <form onSubmit={handleSubmit} className="product-form">
        <h2 className="form-title">Add Gallery Tile</h2>

        {message.text && (
          <div className={`alert alert-${message.type === "error" ? "danger" : "success"}`}>
            {message.text}
          </div>
        )}

        <div className="form-group">
          <label>Media Type</label>
          <select name="type" value={formData.type} onChange={handleInputChange} className="form-control">
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </div>

        <div className="form-group">
          <label>Source Type</label>
          <select name="srcType" value={formData.srcType} onChange={handleInputChange} className="form-control">
            <option value="url">Paste URL</option>
            <option value="device">Upload from Device</option>
          </select>
        </div>

        {formData.srcType === "url" ? (
          <div className="form-group">
            <label>Media URL*</label>
            <input
              type="url"
              name="src"
              value={formData.src}
              onChange={handleInputChange}
              className={`form-control ${errors.src ? "is-invalid" : ""}`}
              placeholder="https://..."
            />
            {errors.src && <div className="invalid-feedback">{errors.src}</div>}
          </div>
        ) : (
          <div className="form-group">
            <label>Upload File*</label>
            <input
              type="file"
              accept={formData.type === "video" ? "video/*" : "image/*"}
              onChange={handleFileChange}
              className={`form-control-file ${errors.src ? "is-invalid" : ""}`}
            />
            {filePreview && (
              formData.type === "image" ? (
                <img src={filePreview} alt="Preview" className="img-thumbnail mt-2" style={{ maxHeight: "180px" }} />
              ) : (
                <video src={filePreview} controls className="img-thumbnail mt-2" style={{ maxHeight: "180px" }} />
              )
            )}
            {errors.src && <div className="invalid-feedback d-block">{errors.src}</div>}
          </div>
        )}

        <div className="form-group">
          <label>Caption*</label>
          <input
            type="text"
            name="caption"
            value={formData.caption}
            onChange={handleInputChange}
            className={`form-control ${errors.caption ? "is-invalid" : ""}`}
            placeholder="E.g., Natural Dye Process"
          />
          {errors.caption && <div className="invalid-feedback">{errors.caption}</div>}
        </div>

        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Uploading..." : "Upload Tile"}
        </button>
      </form>

      {tiles.length > 0 && (
        <div className="mt-4">
          <h4>All Gallery Tiles</h4>
          <table className="table table-bordered table-hover">
            <thead>
              <tr>
                <th>Preview</th>
                <th>Caption</th>
                <th>Type</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tiles.map((tile) => (
                <tr key={tile._id}>
                  <td>
                    {tile.type === "image" ? (
                      <img src={tile.src} alt="tile" style={{ width: 120, height: 60, objectFit: "cover" }} />
                    ) : (
                      <video src={tile.src} width={120} height={60} controls muted />
                    )}
                  </td>
                  <td>{tile.caption}</td>
                  <td>{tile.type}</td>
                  <td>
                    <button onClick={() => deleteTile(tile._id)} className="btn btn-danger btn-sm">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GalleryTileForm;