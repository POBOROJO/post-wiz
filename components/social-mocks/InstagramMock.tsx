import React, { useState } from "react";
import { Heart, MessageCircle, Send, Bookmark, ChevronLeft, ChevronRight, X } from "lucide-react";

interface InstagramMockProps {
  content: string;
  images?: File[];
  onImageUpload?: (files: File[]) => void;
  onImageRemove?: (index: number) => void;
}

export const InstagramMock: React.FC<InstagramMockProps> = ({ 
  content, 
  images = [], 
  onImageUpload, 
  onImageRemove 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  // For handling navigation between images
  const goToPrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // File handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      onImageUpload?.(filesArray);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      onImageUpload?.(filesArray);
    }
  };

  const handleRemoveImage = (index: number) => {
    onImageRemove?.(index);
    if (currentImageIndex >= index && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  // Generate image previews
  const renderImagePreview = () => {
    if (images.length === 0) {
      return (
        <label 
          htmlFor="image-upload" 
          className={`bg-gray-200 h-64 flex flex-col items-center justify-center cursor-pointer transition-colors ${dragActive ? 'bg-gray-300' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Send size={32} className="text-gray-500 mb-2" />
          <span className="text-gray-500">Drop images here or click to upload</span>
          <span className="text-gray-400 text-xs mt-2">Upload multiple images for a carousel</span>
          <input 
            id="image-upload" 
            type="file" 
            multiple 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileChange} 
          />
        </label>
      );
    }

    return (
      <div className="relative h-64 bg-black">
        {/* Image display */}
        <div className="relative h-full w-full">
          {images.map((image, index) => (
            <div 
              key={index} 
              className={`absolute top-0 left-0 w-full h-full flex items-center justify-center transition-opacity duration-300 ${currentImageIndex === index ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
              <img 
                src={URL.createObjectURL(image)} 
                alt={`Uploaded preview ${index + 1}`} 
                className="h-full w-full object-contain"
              />
              <button 
                onClick={() => handleRemoveImage(index)} 
                className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1 text-white hover:bg-opacity-70"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button 
              onClick={goToPrevImage} 
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-1 text-white hover:bg-opacity-70"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={goToNextImage} 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-1 text-white hover:bg-opacity-70"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Dot indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1">
            {images.map((_, index) => (
              <button 
                key={index} 
                onClick={() => setCurrentImageIndex(index)} 
                className={`w-1.5 h-1.5 rounded-full ${currentImageIndex === index ? 'bg-blue-500' : 'bg-gray-300'}`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Add more images button */}
        <label 
          htmlFor="add-more-images" 
          className="absolute bottom-2 right-2 bg-black bg-opacity-50 rounded-full p-2 text-white hover:bg-opacity-70 cursor-pointer"
        >
          <Send size={16} />
          <input 
            id="add-more-images" 
            type="file" 
            multiple 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileChange} 
          />
        </label>
      </div>
    );
  };

  return (
    <div className="bg-white text-black rounded-lg p-4 max-w-md mx-auto">
      <div className="flex items-center mb-3">
        <div className="w-8 h-8 bg-gray-300 rounded-full mr-3"></div>
        <p className="font-bold">Your Name</p>
      </div>
      
      {/* Image carousel */}
      {renderImagePreview()}
      
      <div className="flex justify-between mb-3 mt-3">
        <div className="flex space-x-4">
          <Heart size={24} />
          <MessageCircle size={24} />
          <Send size={24} />
        </div>
        <Bookmark size={24} />
      </div>
      <p className="text-sm">{content}</p>
    </div>
  );
};