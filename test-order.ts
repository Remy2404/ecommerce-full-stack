import { createOrder } from './src/services/order.service';
import { CreateOrderRequest } from './src/types/order';

async function testOrderCreation() {
  const request: CreateOrderRequest = {
    items: [
      {
        productId: '00000000-0000-0000-0000-000000000001', // Use a real ID if possible
        quantity: 1
      }
    ],
    shippingAddress: {
      fullName: 'Test User',
      street: '123 Test St',
      city: 'Phnom Penh',
      state: 'Phnom Penh',
      zipCode: '12000',
      phone: '012345678',
      country: 'Cambodia'
    },
    paymentMethod: 'COD'
  };

  console.log('Testing individual service call...');
  const result = await createOrder(request);
  console.log('Result:', JSON.stringify(result, null, 2));
}

// Note: This won't run directly due to imports/environment, 
// but serves as a template for the fix verification logic.
