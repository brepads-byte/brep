import React, { useState, useEffect } from "react";
import type { Project, ProjectPhoto } from "../src/types";

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [project]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!project) return null;

  const allImages = [
    {
      url: project.mainPhoto?.url,
      caption: "Main View",
      public_id: project.mainPhoto?.public_id,
    },
    ...project.descriptionPhotos,
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + allImages.length) % allImages.length
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-brand-white text-brand-black w-full max-w-4xl max-h-[90vh] rounded-lg shadow-2xl overflow-hidden flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-brand-black z-20 bg-white/50 rounded-full p-1"
        >
          &times;
        </button>

        <div className="w-full md:w-2/3 relative">
          <img
            src={allImages[currentImageIndex].url}
            alt={allImages[currentImageIndex].caption}
            className="w-full h-full object-cover"
          />
          {allImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/50 p-2 rounded-full"
              >
                &#10094;
              </button>
              <button
                onClick={nextImage}
                className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/50 p-2 rounded-full"
              >
                &#10095;
              </button>
            </>
          )}
        </div>

        <div className="w-full md:w-1/3 p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-2">{project.projectName}</h2>
          <p className="text-sm text-gray-600 mb-4">{project.location}</p>
          <p className="text-gray-800 leading-relaxed">{project.description}</p>
          {project.sqft && (
            <p className="mt-4 text-sm">
              <strong>Area:</strong> {project.sqft} sqft
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;
