export type Order = {
  id: number;
  userId: number | null;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalPrice: string;
  createdAt: Date;
};
