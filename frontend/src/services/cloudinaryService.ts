import axios from 'axios';
import apiClient from './apiClient';

// 1. Define the shape of the signature response
interface SignatureResponse {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
}

export const uploadToCloudinary = async (file: File) => {
  const MAX_SIZE = 8 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new Error(`File "${file.name}" exceeds 8MB.`);
  }

  try {
    // 2. Tell TypeScript to expect the SignatureResponse shape
    const signData = await apiClient.get<SignatureResponse>('/cloudinary/signature');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', signData.apiKey);
    // 3. Fix: Convert the number to a string to satisfy FormData
    formData.append('timestamp', signData.timestamp.toString()); 
    formData.append('signature', signData.signature);
    formData.append('folder', 'architecture_portfolio');
    formData.append('transformation', 'w_2000,c_limit,q_auto,f_auto');

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`,
      formData
    );

    return {
      url: response.data.secure_url,
      public_id: response.data.public_id
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Upload failed');
  }
};