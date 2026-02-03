import api from './api';
import { User, UserApiResponse, mapUser } from '@/types';

/**
 * Get current user profile
 */
export async function getProfile(): Promise<User | null> {
  try {
    const response = await api.get<UserApiResponse>('/users/profile');
    return mapUser(response.data);
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateProfile(data: Partial<User>): Promise<User> {
  const response = await api.put<UserApiResponse>('/users/profile', data);
  return mapUser(response.data);
}

/**
 * Get user dashboard statistics
 */
export async function getUserStats(): Promise<any> {
  try {
    const response = await api.get('/users/stats');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user stats:', error);
    return null;
  }
}
