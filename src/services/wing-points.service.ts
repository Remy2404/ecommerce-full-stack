import api from './api';
import {
  WingPoints,
  WingPointsApiResponse,
  WingPointTransaction,
  WingPointTransactionApiResponse,
  mapWingPoints,
  mapWingPointTransaction,
  PaginatedResponse,
} from '@/types';

/**
 * Get current user's wing points balance
 */
export async function getWingPointsBalance(): Promise<WingPoints | null> {
  try {
    const response = await api.get<WingPointsApiResponse>('/wing-points/balance');
    return mapWingPoints(response.data);
  } catch (error) {
    console.error('Failed to fetch wing points balance:', error);
    return null;
  }
}

/**
 * Get wing point transactions
 */
export async function getWingPointTransactions(
  page: number = 0,
  size: number = 20
): Promise<{
  transactions: WingPointTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  const response = await api.get<PaginatedResponse<WingPointTransactionApiResponse>>(
    `/wing-points/transactions?page=${page}&size=${size}`
  );
  
  return {
    transactions: response.data.content.map(mapWingPointTransaction),
    pagination: {
      page: response.data.number,
      limit: response.data.size,
      total: response.data.totalElements,
      totalPages: response.data.totalPages,
    }
  };
}
