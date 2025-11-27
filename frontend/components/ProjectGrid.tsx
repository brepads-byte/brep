
import React from 'react';
import type { Project } from '../src/types';
import ProjectCard from './ProjectCard';
import { useNavigate } from 'react-router-dom';

interface ProjectGridProps {
  projects: Project[];
}

const ProjectGrid: React.FC<ProjectGridProps> = ({ projects }) => {
  const navigate = useNavigate();
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6">
      {projects.map((project) => (
        <ProjectCard
          key={project._id}
          project={project}
          onClick={() => navigate(`/projects/${project._id}`)}
        />
      ))}
    </div>
  );
};

export default ProjectGrid;
