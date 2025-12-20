import { z } from 'zod';

export const shippingAddressSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  street: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(4, 'Zip code is required'),
  country: z.string().min(2, 'Country is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
});

export const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.number(),
    quantity: z.number().positive(),
  })),
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.enum(['stripe', 'paypal']),
});
