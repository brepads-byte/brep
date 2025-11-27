// src/services/teamService.ts
import apiClient from '../src/services/apiClient'; // ✅ Use your configured client
import { TeamMember } from '../src/types';

export const getTeamMembers = async (): Promise<TeamMember[]> => {
  // ✅ CHANGE 1: Use apiClient
  const response = await apiClient.get('/team');
  // ✅ CHANGE 2: Return 'response' directly. DO NOT use .data
  return response as unknown as TeamMember[];
};

export const createTeamMember = async (formData: FormData) => {
  // ✅ CHANGE 3: Use apiClient instead of axios
  const response = await apiClient.post('/team', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response; 
};

export const updateTeamMember = async (id: string, formData: FormData) => {
  const response = await apiClient.put(`/team/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response;
};

export const deleteTeamMember = async (id: string) => {
  const response = await apiClient.delete(`/team/${id}`);
  return response;
};