import apiClient from './apiClient';
import { Project } from '../types';

/**
 * FETCH ALL PROJECTS
 * Used by AdminDashboardPage.tsx
 */
export const listProjects = async (): Promise<Project[]> => {
  return await apiClient.get('/projects');
};

/**
 * FETCH SINGLE PROJECT
 * Used by AdminProjectFormPage.tsx (Fixes the 'getProject' error)
 */
export const getProject = async (id: string): Promise<Project> => {
  return await apiClient.get(`/projects/${id}`);
};

/**
 * CREATE PROJECT (JSON)
 * Sends the direct-upload URLs and Public IDs to your Vercel backend
 */
export const createProject = async (projectData: Partial<Project>): Promise<Project> => {
  return await apiClient.post('/projects', projectData);
};

/**
 * UPDATE PROJECT (JSON)
 * Replaces the existing project data in MongoDB
 */
export const updateProject = async (id: string, projectData: Partial<Project>): Promise<Project> => {
  return await apiClient.put(`/projects/${id}`, projectData);
};

/**
 * DELETE PROJECT
 * Triggers the Cloudinary deletion logic on the backend
 */
export const deleteProject = async (id: string): Promise<void> => {
  return await apiClient.delete(`/projects/${id}`);
};