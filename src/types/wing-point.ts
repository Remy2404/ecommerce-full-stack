/**
 * Wing Points and Rewards type definitions
 */

// --- Backend API Responses (DTOs) ---

export interface WingPointsApiResponse {
  id: string;
  userId: string;
  balance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  updatedAt: string;
}

export interface WingPointTransactionApiResponse {
  id: string;
  userId: string;
  type: 'EARN' | 'SPEND' | 'EXPIRE' | 'ADJUST';
  amount: number;
  description?: string;
  orderId?: string;
  createdAt: string;
}

// --- Frontend Domain Models ---

export interface WingPoints {
  id: string;
  userId: string;
  balance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  updatedAt: string;
}

export interface WingPointTransaction {
  id: string;
  userId: string;
  type: 'EARN' | 'SPEND' | 'EXPIRE' | 'ADJUST';
  amount: number;
  description?: string;
  orderId?: string;
  createdAt: string;
}

// --- Transformation Logic ---

export function mapWingPoints(raw: WingPointsApiResponse): WingPoints {
  return {
    ...raw,
    balance: Number(raw.balance),
    lifetimeEarned: Number(raw.lifetimeEarned),
    lifetimeSpent: Number(raw.lifetimeSpent),
  };
}

export function mapWingPointTransaction(raw: WingPointTransactionApiResponse): WingPointTransaction {
  return {
    ...raw,
    amount: Number(raw.amount),
  };
}
