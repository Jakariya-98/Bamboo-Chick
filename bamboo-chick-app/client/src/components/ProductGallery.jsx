
import { useEffect, useState } from 'react';



export default function ProductGallery({ product }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);

  const images = product?.images?.length
  ? product.images.map((image) =>
      image.startsWith('/')
        ? image
        : `/products/${image}`
    )
  : ['/products/IMG_9773.JPG'];

  const activeImage = images[activeIndex];

  const previousImage = () => {
    setActiveIndex((current) =>
      (current - 1 + images.length) % images.length
    );
  };

  const nextImage = () => {
    setActiveIndex((current) =>
      (current + 1) % images.length
    );
  };

  useEffect(() => {
    if (!viewerOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setViewerOpen(false);
      if (event.key === 'ArrowLeft') previousImage();
      if (event.key === 'ArrowRight') nextImage();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [viewerOpen]);

  return (
    <>
      <section className="product-gallery" aria-label="Product images">
        <div className="gallery-main">
          <img
            key={activeImage}
            src={activeImage}
            alt={`${product?.name || 'Bamboo curtain'} - image ${activeIndex + 1}`}
            className="gallery-main-image"
            onClick={() => setViewerOpen(true)}
          />

          <span className="gallery-count">
            {activeIndex + 1} / {images.length}
          </span>

          <button
            type="button"
            className="gallery-arrow gallery-prev"
            onClick={previousImage}
            aria-label="Previous image"
          >
            ‹
          </button>

          <button
            type="button"
            className="gallery-arrow gallery-next"
            onClick={nextImage}
            aria-label="Next image"
          >
            ›
          </button>

          <button
            type="button"
            className="gallery-zoom"
            onClick={() => setViewerOpen(true)}
          >
            ⤢ Enlarge
          </button>
        </div>

        <div className="gallery-thumbnails" aria-label="Choose product image">
          {images.map((image, index) => (
            <button
              type="button"
              key={image}
              className={`gallery-thumbnail ${
                activeIndex === index ? 'active' : ''
              }`}
              onClick={() => setActiveIndex(index)}
              aria-label={`View product image ${index + 1}`}
              aria-pressed={activeIndex === index}
            >
              <img src={image} alt="" loading="lazy" />
            </button>
          ))}
        </div>

        <p className="gallery-hint">
          Select a photo to preview it. Click the main image to enlarge.
        </p>
      </section>

      {viewerOpen && (
        <div
          className="gallery-viewer"
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged product image"
          onClick={() => setViewerOpen(false)}
        >
          <button
            type="button"
            className="viewer-close"
            onClick={() => setViewerOpen(false)}
            aria-label="Close image viewer"
          >
            ×
          </button>

          <button
            type="button"
            className="viewer-arrow viewer-prev"
            onClick={(event) => {
              event.stopPropagation();
              previousImage();
            }}
            aria-label="Previous image"
          >
            ‹
          </button>

          <img
            src={activeImage}
            alt={`${product?.name || 'Bamboo curtain'} - image ${activeIndex + 1}`}
            className="viewer-image"
            onClick={(event) => event.stopPropagation()}
          />

          <button
            type="button"
            className="viewer-arrow viewer-next"
            onClick={(event) => {
              event.stopPropagation();
              nextImage();
            }}
            aria-label="Next image"
          >
            ›
          </button>

          <span className="viewer-count">
            {activeIndex + 1} / {images.length}
          </span>
        </div>
      )}
    </>
  );
}
