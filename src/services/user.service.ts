import api from './api/client';
import { User, UpdateProfileRequest, UserApiResponse, mapUser } from '@/types/user';

export async function getUserProfile(): Promise<User> {
  const response = await api.get<UserApiResponse>('/user/profile');
  return mapUser(response.data);
}

export async function updateProfile(data: UpdateProfileRequest): Promise<User> {
  const response = await api.put<UserApiResponse>('/user/profile', data);
  return mapUser(response.data);
}

export async function uploadAvatar(file: File): Promise<User> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.put<UserApiResponse>('/user/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return mapUser(response.data);
}

export async function getUserStats() {
  const response = await api.get('/user/stats');
  return response.data;
}
