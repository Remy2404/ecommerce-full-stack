import { users, addresses, merchants, wingPoints, wingPointsTransactions, notifications, userRoleEnum } from '../lib/db/schema';

// Enums
export type UserRole = typeof userRoleEnum.enumValues[number];

// Inferred types from schema
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Address = typeof addresses.$inferSelect;
export type InsertAddress = typeof addresses.$inferInsert;

export type Merchant = typeof merchants.$inferSelect;
export type InsertMerchant = typeof merchants.$inferInsert;

export type WingPoints = typeof wingPoints.$inferSelect;
export type InsertWingPoints = typeof wingPoints.$inferInsert;

export type WingPointsTransaction = typeof wingPointsTransactions.$inferSelect;
export type InsertWingPointsTransaction = typeof wingPointsTransactions.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// Auth-specific types
export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterData = {
  email: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
};

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
};
