// src/services/adminService.ts
import apiClient from './apiClient'; 
import { Admin } from '../admin/types'; // Adjust path if needed

// ✅ List all admins
export const listAdmins = async (): Promise<Admin[]> => {
  const response = await apiClient.get('/admins');
  return response as unknown as Admin[]; // apiClient already returns data, don't use .data again
};

// ✅ Create a new admin (POST)
export const createAdmin = async (adminData: any) => {
  const response = await apiClient.post('/admins', adminData);
  return response;
};

// ✅ Update an admin (PUT)
export const updateAdmin = async (id: string, updates: any) => {
  const response = await apiClient.put(`/admins/${id}`, updates);
  return response;
};

// ✅ Delete an admin (DELETE)
export const deleteAdmin = async (id: string) => {
  const response = await apiClient.delete(`/admins/${id}`);
  return response;
};