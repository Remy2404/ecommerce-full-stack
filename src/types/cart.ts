export type Cart = {
  id: number;
  userId: number | null;
  items: CartItem[];
};

export type CartItem = {
  id: number;
  productId: number;
  quantity: number;
};
