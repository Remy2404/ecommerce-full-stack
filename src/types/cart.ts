import { carts, cartItems } from '../lib/db/schema';

export type Cart = typeof carts.$inferSelect;
export type InsertCart = typeof carts.$inferInsert;

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;
