import axios from 'axios';
import { normalizeResponse } from '../utils/normalizer';

const apiClient = axios.create({
  // FIX: Cast `import.meta` to `any` to access `env` without TypeScript errors,
  // as the standard `ImportMeta` type does not include Vite-specific properties.
  //baseURL: 'https://brep-nu.vercel.app/api',
  baseURL: 'http://localhost:5000/api/'
});

apiClient.interceptors.response.use(
  (response) => normalizeResponse(response),
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        console.error("Authentication error. You might be logged out.");
        // Optionally, you can trigger a logout here.
        // For example: window.dispatchEvent(new Event('logout'));
    }
    const errorMessage = error.response?.data?.message || error.message;
    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;
