import api from './api';
import { mapWingPoints, type WingPoints } from '@/types';

type WingPointsBalanceApiResponse = {
  balance: number;
  userId: string;
};

export async function getWingPointsBalance(): Promise<WingPoints | null> {
  try {
    const response = await api.get<WingPointsBalanceApiResponse>('/wing-points/balance');
    const now = new Date().toISOString();
    return mapWingPoints({
      id: response.data.userId,
      userId: response.data.userId,
      balance: response.data.balance,
      lifetimeEarned: response.data.balance,
      lifetimeSpent: 0,
      updatedAt: now,
    });
  } catch {
    return null;
  }
}

export async function getWingPointTransactions(): Promise<{
  transactions: [];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}> {
  return {
    transactions: [],
    pagination: { page: 0, limit: 0, total: 0, totalPages: 0 },
  };
}
