import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProjects } from "../services/projectService";
import type { Project } from "../src/types";

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Hooks are now properly placed inside the functional component
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; caption?: string } | null>(null);
  const [isZoomedIn, setIsZoomedIn] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      const projects = await getProjects();
      const found = projects.find((p) => p._id === id);
      setProject(found || null);
      setLoading(false);
    };
    fetchProject();
  }, [id]);

  if (loading) return <div className="py-24 text-center">Loading...</div>;
  if (!project) return <div className="py-24 text-center">Project not found.</div>;

  return (
    <div className="container mx-auto px-0 md:px-6 pt-24 pb-16">
      {/* Top Section */}
      <div className="relative w-full">
        {/* Architectural Background */}
        <div className="absolute inset-0 hidden md:block">
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
        <div className="relative container mx-auto px-0 md:px-12 pt-10 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
            {/* Main Photo */}
            <div className="md:col-span-3 relative">
              <div className="bg-white border-0 md:bordershadow-none md:shadow-lg overflow-hidden">
                <img
                  src={project.mainPhoto?.url}
                  alt={project.projectName}
                  className="w-full h-auto md:h-full object-cover"
                />
              </div>
            </div>

            {/* Project Info */}
            <div className="md:col-span-2 flex flex-col items-start mt-6 md:mt-3 px-6 md:px-0">
              <h1 className="text-2xl md:text-3xl font-bold text-black mb-4 md:mb-6">
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
      {/* Gallery Section */}
      <div className="container mx-auto px-0 md:px-6">
        {project.descriptionPhotos?.length > 0 && (
          // ✅ FIX 1: Changed px-6 to px-0 on mobile so the grid columns touch the screen edges.
          // The title "Gallery" keeps a px-6 indentation so it stays aligned with your text content.
          <div className="px-0 md:px-12 mt-12">
            <h2 className="text-xl font-semibold text-black mb-6 px-6 md:px-0">Gallery</h2>
            
            {/* ✅ FIX 2: Changed gap-4 to gap-0 on mobile to remove gaps between stacked mobile photos */}
            <div className="columns-1 sm:columns-2 md:columns-3 gap-0 sm:gap-4 space-y-0 sm:space-y-4">
              {project.descriptionPhotos.map((photo, idx) => (
                <div
                  key={photo.public_id || idx}
                  // ✅ FIX 3: Removed mb-6, shadows, and rounded borders on mobile so they stack perfectly flush
                  className="break-inside-avoid mb-0 sm:mb-6 group relative overflow-hidden bg-gray-50 border-b sm:border border-gray-200/50 sm:border-gray-200 shadow-none md:shadow-sm rounded-none md:rounded-sm"
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

                  {/* ✅ FIX 4: Kept the captions neatly padded internally so text doesn't hit the screen borders */}
                  {photo.caption && (
                    <p className="p-4 sm:p-3 text-xs text-gray-600 font-medium italic text-justify bg-white">
                      {photo.caption}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailPage;