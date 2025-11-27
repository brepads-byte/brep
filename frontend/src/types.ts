// Location: frontend/src/types.ts

// --- PROJECT TYPES (Moved from outside) ---
export type Category = 'residential' | 'commercial' | 'hospitality' | 'interiors';

export interface ProjectPhoto {
  url: string;
  caption: string;
  _id?: string;
}

export interface Project {
  _id: string;
  projectName: string;
  category: Category;
  sqft?: string;
  mainPhoto: string;
  location: string;
  description: string;
  descriptionPhotos: ProjectPhoto[];
  createdAt: string;
  updatedAt: string;
}

// --- TEAM TYPES (New) ---
export interface TeamMember {
  _id: string;
  name: string;
  role: string;
  photo: {
    url: string;
    public_id: string;
  };
}