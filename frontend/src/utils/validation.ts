import { UploadableFile } from '../types';

export const validateProjectForm = (formData: any, mainPhoto: UploadableFile | null, gallery: UploadableFile[]) => {
  // 1. Sqft: Positive whole numbers only (no alphabets)
  const sqftRegex = /^[1-9]\d*$/;
  if (formData.sqft && !sqftRegex.test(formData.sqft)) {
    return "Square footage must be a positive whole number (e.g., 1200).";
  }

  // 2. Project Name Length
  if (formData.projectName.trim().length < 3) {
    return "Project Name must be at least 3 characters.";
  }

  // 3. File Size: 8MB limit
  const MAX_SIZE = 8 * 1024 * 1024;
  const allFiles = [...(mainPhoto ? [mainPhoto.file] : []), ...gallery.map(p => p.file)];
  
  for (const file of allFiles) {
    if (file.size > MAX_SIZE) {
      return `File "${file.name}" is too large. Max limit is 8MB.`;
    }
  }

  return null;
};