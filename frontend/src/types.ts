// frontend/src/types.ts

// --- AUTH & ADMIN TYPES ---
export interface Admin {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  location?: string;
  role: 'admin' | 'super_admin';
  avatar?: string;
  isActive: boolean;
  createdAt: string;
}

// --- PROJECT TYPES ---
export type Category = 'home' | 'commercial' | 'hospitality' | 'interiors';

export interface ProjectPhoto {
  url: string;
  public_id: string; // ✅ Required for Cloudinary Cleanup
  caption: string;
  _id?: string;
}

export interface Project {
  _id: string;
  projectName: string;
  category: Category;
  sqft?: string;
  location: string;
  description: string;
  // ✅ Must be an object to match your new backend schema
  mainPhoto: {
    url: string;
    public_id: string;
  };
  descriptionPhotos: ProjectPhoto[];
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
  id: string; // Used for dnd-kit reordering
}

// --- CLOUDINARY HELPER ---
export interface SignatureResponse {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
}