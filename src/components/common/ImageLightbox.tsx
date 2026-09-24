import React, { useEffect, useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  altText: string;
  caption?: string;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  isOpen,
  onClose,
  imageSrc,
  altText,
  caption,
}) => {
  const [scale, setScale] = useState(1);

  // Reset zoom and lock background scroll on open
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale((prev) => Math.min(prev + 0.3, 3));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale((prev) => Math.max(prev - 0.3, 0.7));
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale(1);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 transition-opacity duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Expanded Image View"
    >
      {/* Top Floating Control Bar */}
      <div
        className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-neutral-900/80 border border-neutral-700/80 rounded-xl p-1.5 backdrop-blur-md shadow-xl text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleZoomIn}
          className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
          title="Zoom In"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
          title="Zoom Out"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleReset}
          className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
          title="Reset Zoom"
          aria-label="Reset zoom"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <span className="w-px h-4 bg-neutral-700 mx-1" />
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-red-500/20 text-neutral-300 hover:text-red-400 transition-colors cursor-pointer"
          title="Close (Esc)"
          aria-label="Close image viewer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Image Container */}
      <div
        className="relative max-w-5xl max-h-[85vh] flex flex-col items-center justify-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageSrc}
          alt={altText}
          style={{ transform: `scale(${scale})` }}
          className="max-w-full max-h-[78vh] object-contain rounded-lg shadow-2xl transition-transform duration-150 ease-out select-none cursor-grab active:cursor-grabbing"
        />

        {caption && (
          <p className="mt-3 text-xs text-neutral-300 text-center max-w-xl bg-neutral-900/60 px-4 py-1.5 rounded-full border border-neutral-800">
            {caption}
          </p>
        )}
      </div>
    </div>
  );
};
