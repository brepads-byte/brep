import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { getProjects } from '../services/projectService';
import type { Project, Category } from '../src/types';
import ProjectGrid from '../components/ProjectGrid';
import ProjectFilters from '../components/ProjectFilters';

const categories: (Category | 'all')[] = ['all', 'home', 'commercial', 'hospitality', 'interiors'];

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const initialCategory = (queryParams.get('category') as Category | 'all') || 'all';

  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>(initialCategory);

  useEffect(() => {
    const fetchProjects = async () => {
      const data = await getProjects();
      setProjects(data);
    };
    fetchProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    const categoryToFilter = selectedCategory ;
    if (categoryToFilter === 'all') {
      return projects;
    }
    return projects.filter((p) => p.category === categoryToFilter);
  }, [projects, selectedCategory]);

  return (
    <div className="container mx-auto px-6 pt-24 pb-20">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-brand-black">
          Our Work
        </h1>
        <p className="mt-3 text-sm md:text-base text-neutral-500">
          Explore our curated selection of residential, commercial and interior projects.
        </p>
      </div>

      <ProjectFilters
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <div className="mt-8">
        <ProjectGrid projects={filteredProjects} />
      </div>
    </div>
  );
};

export default ProjectsPage;
