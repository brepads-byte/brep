// Location: frontend/src/types.ts

// --- PROJECT TYPES ---
export type Category = 'residential' | 'commercial' | 'hospitality' | 'interiors';

export interface ProjectPhoto {
  url: string;
  public_id: string; // ✅ REQUIRED for Cloudinary deletion
  caption: string;
  _id?: string;
}

export interface Project {
  _id: string;
  projectName: string;
  category: 'home' | 'commercial' | 'hospitality' | 'interiors';
  sqft?: string;
  location: string;
  description: string;
  // ✅ Must be an object for the payload to be valid
  mainPhoto: {
    url: string;
    public_id: string;
  };
  descriptionPhotos: {
    url: string;
    public_id: string;
    caption: string;
    _id?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

// --- TEAM TYPES ---
export interface TeamMember {
  _id: string;
  name: string;
  role: string;
  photo: {
    url: string;
    public_id: string;
  };
}

// --- UPLOAD HELPER TYPES ---
export interface UploadableFile {
  file: File;
  preview: string;
  caption: string;
  id: string; // Local unique ID for DnD-Kit reordering
}