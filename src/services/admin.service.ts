import api from './api';
import { Order, OrderApiResponse, mapOrder, PaginatedResponse } from '@/types';

/**
 * Get admin dashboard statistics
 */
export async function getAdminDashboardStats(): Promise<any> {
  const response = await api.get('/admin/dashboard');
  return response.data;
}

/**
 * Get all orders (Admin duplicate of OrderService for direct admin endpoint)
 */
export async function getAdminOrders(page: number = 0, size: number = 20) {
  const response = await api.get<PaginatedResponse<OrderApiResponse>>(`/admin/orders?page=${page}&size=${size}`);
  
  return {
    orders: response.data.content.map(mapOrder),
    pagination: {
      page: response.data.number,
      limit: response.data.size,
      total: response.data.totalElements,
      totalPages: response.data.totalPages,
    }
  };
}

/**
 * Revoke user access (Admin)
 */
export async function revokeUser(userId: string): Promise<void> {
  await api.post(`/admin/users/${userId}/revoke`);
}
