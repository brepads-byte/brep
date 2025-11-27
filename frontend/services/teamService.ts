// src/services/teamService.ts
import axios from 'axios';
import { TeamMember } from '../src/types';

// Check your .env for the correct port (usually 5000)
const API_URL = 'http://localhost:5000/api/team'; 

export const getTeamMembers = async (): Promise<TeamMember[]> => {
  const response = await axios.get(API_URL);
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