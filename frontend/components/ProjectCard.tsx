import React from 'react';
import type { Project } from '../src/types';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  return (
    <div
      className="
        relative group
        overflow-hidden
        border border-neutral-200
        bg-white
        shadow-sm
        hover:shadow-md
        cursor-pointer
        mb-6
        break-inside-avoid
        transition-transform transition-shadow
        duration-300 ease-out
        hover:-translate-y-1
      "
      onClick={onClick}
    >
      <img
        src={project.mainPhoto?.url}
        alt={project.projectName}
        className="
          w-full
          h-auto
          object-cover
          transition-transform
          duration-500
          ease-out
          group-hover:scale-105
        "
        loading="lazy"
        decoding="async"
      />

      {/* Overlay */}
      <div
        className="
          absolute inset-0
          bg-gradient-to-t from-black/65 via-black/10 to-transparent
          opacity-0 group-hover:opacity-100
          transition-opacity
          duration-300
          ease-out
        "
      />

      {/* Text */}
      <div
        className="
          absolute inset-x-0 bottom-0
          p-4
          flex flex-col justify-end
          text-brand-white
          opacity-0 group-hover:opacity-100
          translate-y-2 group-hover:translate-y-0
          transition-all
          duration-300
          ease-out
        "
      >
        <h3 className="text-lg font-semibold leading-tight">
          {project.projectName}
        </h3>
        <p className="text-xs mt-1 text-neutral-200">
          {project.location}
        </p>
      </div>
    </div>
  );
};

export default ProjectCard;
