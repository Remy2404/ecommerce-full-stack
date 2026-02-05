import api from './api/client';
import { User, UpdateProfileRequest } from '@/types/user';

export async function getUserProfile(): Promise<User> {
  const response = await api.get<User>('/user/profile');
  return response.data;
}

export async function updateProfile(data: UpdateProfileRequest): Promise<User> {
  const response = await api.put<User>('/user/profile', data);
  return response.data;
}

export async function getUserStats() {
  const response = await api.get('/user/stats');
  return response.data;
}
