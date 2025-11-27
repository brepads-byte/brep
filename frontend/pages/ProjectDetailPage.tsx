import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProjects } from '../services/projectService';
import type { Project } from '../src/types';

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

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
  {/* Full-width architectural background */}
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
        backgroundSize: '40px 40px',
        backgroundColor: '#f7f7f7', // light notion-style gray
      }}
    />
  </div>

  {/* Content grid (on top of background) */}
  <div className="relative container mx-auto px-6 md:px-12 pt-10 pb-16">
    <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
      {/* Main Photo with architectural frame feel */}
      <div className="md:col-span-3 relative">
        <div className="bg-white border border-gray-200 rounded-tr-3xl rounded-br-3xl shadow-lg overflow-hidden">
          <img
            src={project.mainPhoto}
            alt={project.projectName}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Project Info aligned to top */}
      <div className="md:col-span-2 flex flex-col items-start mt-3">
        <h1 className="text-3xl font-bold text-black mb-6">
          {project.projectName}
        </h1>

        <div className="space-y-3 text-sm text-gray-700 w-full">
          <div>
            <span className="font-semibold text-black">Category:</span>{' '}
            {project.category}
          </div>
          {project.sqft && (
            <div>
              <span className="font-semibold text-black">Sqft:</span>{' '}
              {project.sqft}
            </div>
          )}
          <div>
            <span className="font-semibold text-black">Location:</span>{' '}
            {project.location}
          </div>
        </div>

        <p className="mt-8 text-base leading-relaxed text-gray-800">
          {project.description}
        </p>
      </div>
    </div>
  </div>
</div>
      {/* Gallery Section */}
      {project.descriptionPhotos?.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold text-black mb-6">Gallery</h2>
          <div className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4">
            {project.descriptionPhotos.map((photo, idx) => (
              <div key={photo._id || idx} className="break-inside-avoid mb-6">
                
                {/* Image */}
                <img
                  src={photo.url}
                  alt={photo.caption || `Project photo ${idx + 1}`}
                  className="w-full rounded-xl border border-gray-200 shadow-sm hover:opacity-95 transition"
                />

                {/* Caption - Only shows if caption exists */}
                {photo.caption && (
                  <p className="mt-2 text-sm text-gray-600 font-medium italic text-center">
                    {photo.caption}
                  </p>
                )}
                
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailPage;
