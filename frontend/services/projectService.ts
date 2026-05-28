import apiClient from '../src/services/apiClient';
import { Project } from '../src/types';

/*
export const getProjects = async (): Promise<Project[]> => {
  try {
    const data = await apiClient.get('/projects');
    // FIX: Cast to unknown first to resolve the type mismatch caused by the axios interceptor.
    // The interceptor returns the data object directly, but TypeScript expects an AxiosResponse.
    return data as unknown as Project[];
  } catch (error) {
    console.error("Could not fetch projects:", error);
    return []; // Return empty array on error to prevent app crash
  }
};*/

export const getProjects = async (): Promise<Project[]> => {
  try {
    const data = await apiClient.get('/projects');
    return data as unknown as Project[];
  } catch (error) {
    console.error("Could not fetch projects list:", error);
    return [];
  }
};

export const getProjectById = async (id: string): Promise<Project | null> => {
  try {
    const data = await apiClient.get(`/projects/${id}`);
    return data as unknown as Project;
  } catch (error) {
    console.error(`Could not fetch project details for ID ${id}:`, error);
    return null;
  }
};