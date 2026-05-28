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
    <div className="w-full">
      
      {/* 📱 MOBILE VIEW: Dropdown Selector (visible on screens smaller than md) */}
      <div className="block md:hidden w-full">
        <select
          value={selectedCategory}
          // ✅ CRITICAL MOBILE FIX: Triggers parent state updates instantly on change
          onChange={(e) => onSelectCategory(e.target.value as Category | 'all')}
          className="w-full bg-white border border-neutral-300 px-4 py-3 rounded-md text-sm font-medium text-brand-black focus:outline-none focus:border-brand-black"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {/* Displays clean text (e.g., "home" looks like "Home") while value stays lowercase */}
              {cat === 'all' ? 'All Work' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* 💻 DESKTOP VIEW: Button Tabs (visible on screens md and up) */}
      <div className="hidden md:flex justify-center items-center gap-4">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onSelectCategory(cat)}
            className={`px-5 py-2 text-sm font-medium rounded-full transition-all uppercase tracking-wider ${
              selectedCategory === cat
                ? "bg-brand-black text-brand-white shadow-sm"
                : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
            }`}
          >
            {cat === 'all' ? 'All' : cat}
          </button>
        ))}
      </div>

    </div>
  );
};

export default ProjectFilters;