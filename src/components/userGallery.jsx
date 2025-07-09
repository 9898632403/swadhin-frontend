import React, { useState, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import '../styles/userGalleryForm.css';

const fashionQuotes = [
  "Confidence is the best outfit 👑",
  "Own your look, own your story ✨",
  "Stay classy, sassy & a bit smart-assy 💅",
  "Slaying one outfit at a time 🔥",
  "Fashion is freedom 💃",
];

const emojiMap = {
  happy: '😊',
  stylish: '💃',
  cool: '😎',
  love: '❤️',
  fun: '🎉',
  glam: '✨',
  // Added more emoji mappings for better coverage
  beautiful: '🌸',
  fierce: '🐯',
  trendy: '👟',
  elegant: '🦢',
};

const UserGallery = () => {
  const { userInfo } = useContext(UserContext);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [status, setStatus] = useState('');
  const [previewURL, setPreviewURL] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false); // For better drag UI feedback

  // Enhanced caption with emoji replacement
  const enhanceCaption = (text) => {
    let enhanced = text;
    Object.entries(emojiMap).forEach(([word, emoji]) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      enhanced = enhanced.replace(regex, `${word} ${emoji}`);
    });
    return enhanced;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const validateAndSetFile = (file) => {
    // Basic file validation
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!validTypes.includes(file.type)) {
      setStatus('❌ Please upload only images (JPEG, PNG, GIF) or videos (MP4, MOV)');
      return;
    }
    
    if (file.size > maxSize) {
      setStatus('❌ File size too large (max 10MB)');
      return;
    }
    
    setFile(file);
    setPreviewURL(URL.createObjectURL(file));
    setStatus(''); // Clear any previous errors
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const suggestCaption = () => {
    const randomQuote = fashionQuotes[Math.floor(Math.random() * fashionQuotes.length)];
    setCaption(prev => enhanceCaption(prev ? `${prev} ${randomQuote}` : randomQuote));
  };

  const clearForm = () => {
    setFile(null);
    setCaption('');
    setPreviewURL(null);
    setStatus('');
    setDragActive(false);
    document.getElementById('fileInput').value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setStatus('❗ Please upload a file.');
      return;
    }
    
    if (!caption.trim()) {
      setStatus('❗ Please write a caption.');
      return;
    }

    const formData = new FormData();
    formData.append('media', file);
    formData.append('caption', caption);
    formData.append('email', userInfo?.email || 'guest@swadhin.in');
    formData.append('timestamp', new Date().toISOString());

    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/lookbook', {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) throw new Error(await res.text());
      
      const data = await res.json();
      alert(data.message);
      setStatus('✅ Look uploaded successfully!');
      clearForm();
    } catch (err) {
      console.error('Upload error:', err);
      setStatus('⚠️ Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-look-container">
      <h2>📤 Share Your Fashion Look</h2>
      <p className="user-email">
        Posting as: <strong>{userInfo?.email || 'Guest User'}</strong>
      </p>
      <div className="file-input-container">
  <label htmlFor="fileInput" className="file-input-label">
    📁 Choose File
  </label>
  <input
    id="fileInput"
    type="file"
    accept="image/*,video/*"
    onChange={handleFileChange}
    className="file-input"
  />
</div>

      <div
        className={`drag-drop-zone ${dragActive ? 'active' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      >
        <p>{dragActive ? '🎉 Drop it like it\'s hot!' : '📂 Drag & Drop your image/video here'}</p>
        <p className="hint-text">(Supports: JPEG, PNG, GIF, MP4 up to 10MB)</p>
      </div>

      <form onSubmit={handleSubmit} className="upload-form">
        <input
          id="fileInput"
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="file-input"
        />
        
        {previewURL && (
          <div className="media-preview">
            {file?.type?.startsWith('video') ? (
              <video src={previewURL} controls width="100%" />
            ) : (
              <img src={previewURL} alt="Preview" style={{ maxWidth: '100%' }} />
            )}
          </div>
        )}

        <div className="caption-container">
          <textarea
            placeholder="Write a caption about your style... (e.g., 'Feeling stylish and confident today!')"
            value={caption}
            onChange={(e) => setCaption(enhanceCaption(e.target.value))}
            rows={3}
          />
          <button 
            type="button" 
            onClick={suggestCaption}
            className="caption-suggestion-btn"
            aria-label="Suggest caption"
          >
            ✨ Inspire Me
          </button>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={clearForm}
            className="secondary-btn"
          >
            🧼 Clear All
          </button>
          <button 
            type="submit" 
            disabled={loading || !file || !caption.trim()}
            className="primary-btn"
          >
            {loading ? (
              <>
                <span className="spinner" aria-hidden="true"></span>
                Posting...
              </>
            ) : (
              'Post to Gallery'
            )}
          </button>
        </div>

        {status && (
          <p className={`status-msg ${status.includes('✅') ? 'success' : 'error'}`}>
            {status}
          </p>
        )}
      </form>
    </div>
  );
};

export default UserGallery;