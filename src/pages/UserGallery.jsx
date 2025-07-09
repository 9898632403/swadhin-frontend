import React, { useState } from 'react';
import UserGallery from '../components/userGallery';
import UserGalleryPreview from '../components/UserGalleryPreview';
import '../styles/userGallery.css';
import '../styles/galleryPage.css';

const GalleryPage = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <main className="gallery-page-container">
      {/* HERO SECTION */}
      <section className="gallery-hero">
        <div className="hero-content">
          <h1>Community Style Gallery</h1>
          <p className="subtitle">
            Share your looks and get inspired by our fashion community
          </p>
          <div className="hero-cta">
            <span className="cta-badge">✨ New looks added daily</span>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div className="gallery-content-wrapper">
        {/* GALLERY HEADER WITH UPLOAD BUTTON */}
        <div className="gallery-header-section">
          <div className="gallery-title-container">
            <h2 id="gallery-heading">Community Creations</h2>
            <p className="section-description">
              Discover looks from our fashion-forward community
            </p>
          </div>
          
          {!showForm && (
            <div className="upload-button-container">
              <button
                className="cta-upload-button"
                onClick={() => setShowForm(true)}
              >
                ➕ Post to Gallery
              </button>
            </div>
          )}
        </div>

        {/* UPLOAD FORM SECTION (TOGGLES VISIBILITY) */}
        {showForm && (
          <section className="upload-section" aria-labelledby="upload-heading">
            <div className="section-header">
              <h2 id="upload-heading">Share Your Style</h2>
              <p className="section-description">
                Upload your favorite outfit to inspire others
              </p>
              <button
                onClick={() => setShowForm(false)}
                className="back-to-gallery-btn"
              >
                ← Back to Gallery
              </button>
            </div>
            <div className="upload-card">
              <UserGallery />
            </div>
          </section>
        )}

        {/* GALLERY PREVIEW SECTION */}
        {!showForm && (
          <section className="gallery-preview-section">
            <UserGalleryPreview />
          </section>
        )}
      </div>
    </main>
  );
};

export default GalleryPage;