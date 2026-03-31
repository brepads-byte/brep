import axios from 'axios';
import apiClient from './apiClient';
import { SignatureResponse } from '../types';

/**
 * UPLOADS A FILE DIRECTLY TO CLOUDINARY
 * This bypasses the Vercel 4.5MB limit by sending the file from the browser.
 */
export const uploadToCloudinary = async (file: File) => {
  const MAX_SIZE = 8 * 1024 * 1024; // 8MB Limit
  if (file.size > MAX_SIZE) {
    throw new Error(`File "${file.name}" exceeds the 8MB limit.`);
  }

  try {
    // 1. Fetch the signature from your Vercel Backend
    const response = await apiClient.get<SignatureResponse>('/cloudinary/signature');

    // 2. SAFE DATA EXTRACTION
    // If apiClient uses an interceptor to return .data, 'response' is our object.
    // Otherwise, we look inside 'response.data'.
    const signData = (response as any).data || response;

    // 3. Prepare the payload for Cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', signData.apiKey);
    formData.append('timestamp', signData.timestamp.toString());
    formData.append('signature', signData.signature);
    formData.append('folder', 'architecture_portfolio');
    formData.append('transformation', 'w_2000,c_limit,q_auto,f_auto');

    // 4. POST directly to Cloudinary's API
    // We use standard 'axios' here instead of 'apiClient' to avoid 
    // sending your backend's Auth headers to Cloudinary.
    const cloudinaryRes = await axios.post(
      `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`,
      formData
    );

    // 5. Return exactly what MongoDB needs to store
    return {
      url: cloudinaryRes.data.secure_url,
      public_id: cloudinaryRes.data.public_id
    };
  } catch (error: any) {
    // Log the full error to the console so you can see it in DevTools
    console.error("Cloudinary Service Error:", error);

    // Extract the cleanest error message for your Toast notification
    const errorMessage = 
      error.response?.data?.error?.message || 
      error.message || 
      'Upload failed';
      
    throw new Error(errorMessage);
  }
};