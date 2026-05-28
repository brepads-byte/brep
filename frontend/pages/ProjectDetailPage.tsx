import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProjectById } from "../services/projectService";
import type { Project } from "../src/types";

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Hooks are now properly placed inside the functional component
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; caption?: string } | null>(null);
  const [isZoomedIn, setIsZoomedIn] = useState(false);
/*
  useEffect(() => {
    const fetchProject = async () => {
      const projects = await getProjects();
      const found = projects.find((p) => p._id === id);
      setProject(found || null);
      setLoading(false);
    };
    fetchProject();
  }, [id]);
*/
useEffect(() => {
  const fetchSingleProject = async () => {
    if (!id) return;
    setLoading(true);
    
    // Calls the targeted endpoint /api/projects/:id directly!
    const data = await getProjectById(id);
    
    setProject(data);
    setLoading(false);
  };
  
  fetchSingleProject();
}, [id]);
  if (loading) return <div className="py-24 text-center">Loading...</div>;
  if (!project) return <div className="py-24 text-center">Project not found.</div>;

  return (
    <div className="container mx-auto px-0 md:px-6 pt-24 pb-16">
      {/* Top Section */}
      <div className="relative w-full">
        {/* Architectural Background */}
        <div className="absolute inset-0">
          <div
            className="w-full h-full opacity-5"
            style={{
              backgroundImage: `
                repeating-linear-gradient(
                  45deg,
                  #111 0px,
                  #111 1px,
                  transparent 1px,
                  transparent 20px
                ),
                repeating-linear-gradient(
                  -45deg,
                  #111 0px,
                  #111 1px,
                  transparent 1px,
                  transparent 20px
                )
              `,
              backgroundSize: "40px 40px",
              backgroundColor: "#f7f7f7",
            }}
          />
        </div>

        {/* Content */}
        <div className="relative container mx-auto px-6 md:px-12 pt-10 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
            {/* Main Photo */}
            <div className="md:col-span-3 relative">
              <div className="bg-white border border-gray-200 shadow-lg overflow-hidden">
                <img
                  src={project.mainPhoto?.url}
                  alt={project.projectName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Project Info */}
            <div className="md:col-span-2 flex flex-col items-start mt-3">
              <h1 className="text-2xl font-bold text-black mb-6">
                {project.projectName}
              </h1>

              <div className="space-y-3 text-sm text-gray-700 w-full">
                <div>
                  <span className="font-semibold text-black">Category:</span>{" "}
                  {project.category.charAt(0).toUpperCase() + project.category.slice(1)}
                </div>

                {project.sqft && (
                  <div>
                    <span className="font-semibold text-black">Sqft:</span>{" "}
                    {project.sqft}
                  </div>
                )}

                <div>
                  <span className="font-semibold text-black">Location:</span>{" "}
                  {project.location}
                </div>
              </div>

              <p className="mt-8 text-sm leading-relaxed text-gray-800 text-justify">
                {project.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="container mx-auto px-0 md:px-6">
        {project.descriptionPhotos?.length > 0 && (
          <div className="px-6 md:px-12 mt-12">
            <h2 className="text-xl font-semibold text-black mb-6">Gallery</h2>
            <div className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4">
              {project.descriptionPhotos.map((photo, idx) => (
                <div
                  key={photo.public_id || idx}
                  className="break-inside-avoid mb-6 group relative overflow-hidden bg-gray-50 border border-gray-200 shadow-sm rounded-sm"
                >
                  {/* Image Container */}
                  <div className="relative overflow-hidden">
                    <img
                      src={photo.url}
                      alt={photo.caption || `Project photo ${idx + 1}`}
                      className="w-full transition duration-300 group-hover:scale-[1.02]"
                    />
                    
                    {/* Hover Overlay with Zoom Button */}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPhoto({ url: photo.url, caption: photo.caption });
                          setIsZoomedIn(false);
                        }}
                        className="bg-white/90 hover:bg-white text-black font-medium text-xs py-2 px-4 shadow-md transition-all uppercase tracking-wider rounded-sm transform translate-y-2 group-hover:translate-y-0 duration-300"
                      >
                        Zoom View
                      </button>
                    </div>
                  </div>

                  {photo.caption && (
                    <p className="p-3 text-xs text-gray-600 font-medium italic text-justify">
                      {photo.caption}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lightbox Modal Layer */}
        {selectedPhoto && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-sm p-4">
            
            {/* Top Control Bar */}
            <div className="absolute top-4 right-4 flex items-center gap-6 z-50">
              <button
                type="button"
                onClick={() => setIsZoomedIn(!isZoomedIn)}
                className="text-white/70 hover:text-white text-xs uppercase tracking-widest transition"
              >
                {isZoomedIn ? "Zoom Out" : "Zoom In"}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setSelectedPhoto(null);
                  setIsZoomedIn(false);
                }}
                className="text-white/70 hover:text-white text-2xl font-light p-2 transition-transform duration-200 hover:rotate-90"
                aria-label="Close interactive modal"
              >
                ✕
              </button>
            </div>

            {/* Lightbox Active Image Frame */}
            <div 
              className={`relative max-w-5xl max-h-[80vh] transition-all duration-300 ease-out select-none ${
                isZoomedIn ? "overflow-auto cursor-zoom-out" : "overflow-hidden cursor-zoom-in"
              }`}
              onClick={() => setIsZoomedIn(!isZoomedIn)}
            >
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.caption || "Expanded view"}
                className={`max-w-full max-h-[80vh] object-contain transition-transform duration-300 ${
                  isZoomedIn ? "scale-[1.6] max-h-none my-12" : "scale-100"
                }`}
              />
            </div>

            {/* Caption Display */}
            {selectedPhoto.caption && !isZoomedIn && (
              <p className="mt-4 text-xs text-gray-400 max-w-2xl text-center italic transition-opacity">
                {selectedPhoto.caption}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailPage;