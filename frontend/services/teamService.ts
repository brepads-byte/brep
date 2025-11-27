// src/services/teamService.ts
import axios from 'axios';
import apiClient from './apiClient';
import { TeamMember } from '../src/types';


export const getTeamMembers = async (): Promise<TeamMember[]> => {
  const response = await apiClient.get('/team');
  return response.data;
};

export const createTeamMember = async (formData: FormData) => {
  const response = await axios.post(API_URL, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateTeamMember = async (id: string, formData: FormData) => {
  const response = await axios.put(`${API_URL}/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteTeamMember = async (id: string) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};
