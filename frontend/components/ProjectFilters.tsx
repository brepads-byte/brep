
import React from 'react';
import type { Category } from '../src/types';

interface ProjectFiltersProps {
  categories: (Category | 'all')[];
  selectedCategory: Category | 'all';
  onSelectCategory: (category: Category | 'all') => void;
}

const ProjectFilters: React.FC<ProjectFiltersProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="flex justify-center items-center space-x-2 md:space-x-4 my-12">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 capitalize
            ${
              selectedCategory === category
                ? 'bg-brand-black text-brand-white'
                : 'bg-gray-100 text-brand-black hover:bg-gray-200'
            }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default ProjectFilters;
