import { categories, products, productVariants, reviews, wishlists } from '../lib/db/schema';

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

export type ProductVariant = typeof productVariants.$inferSelect;
export type InsertProductVariant = typeof productVariants.$inferInsert;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

export type WishlistItem = typeof wishlists.$inferSelect;
export type InsertWishlistItem = typeof wishlists.$inferInsert;
