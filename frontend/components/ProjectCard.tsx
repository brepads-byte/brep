
import React from 'react';
import type { Project } from '../src/types';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  return (
    <div
      className="relative group overflow-hidden rounded-xl shadow-lg cursor-pointer mb-6 break-inside-avoid"
      onClick={onClick}
    >
      <img
        src={project.mainPhoto}
        alt={project.projectName}
        className="w-full h-auto object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
        loading="lazy"
        decoding="async"
      />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-500 ease-in-out"></div>
      <div className="absolute inset-0 p-6 flex flex-col justify-end text-brand-white opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out">
        <h3 className="text-xl font-bold">{project.projectName}</h3>
        <p className="text-sm">{project.location}</p>
      </div>
    </div>
  );
};

export default ProjectCard;
