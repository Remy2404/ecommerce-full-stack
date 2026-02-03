import { verifyPayment } from '../src/services/payment.service';

/**
 * Frontend Verification Script
 * This script simulates the payment verification flow and logs the status.
 * Run with: npx tsx scripts/verify-payment-flow.ts
 */
async function verifyPaymentFlow() {
  const testMd5 = '1f0b1752d569d321dfd3764a5dbd3e31'; // Hash from user's successful payment
  
  console.log('--- Payment Verification Flow Trace ---');
  console.log(`Target MD5: ${testMd5}`);
  console.log('Fetching status from backend...');

  try {
    // We mock the environment variable here if needed, or assume localhost during local testing
    if (!process.env.NEXT_PUBLIC_API_URL) {
      process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8080/api';
    }

    const result = await verifyPayment(testMd5);
    console.log('Raw result from service:', JSON.stringify(result, null, 2));

    if (result) {
      console.log('\n✅ Verification Result:');
      console.log(`- Paid: ${result.paid}`);
      console.log(`- Amount: ${result.paidAmount} ${result.currency}`);
      console.log(`- Message: ${result.message}`);
      
      if (result.paid) {
        console.log('\nSUCCESS: Frontend would now transition to success screen.');
      } else {
        console.log('\nPENDING: Frontend would continue polling.');
      }
    } else {
      console.error('\n❌ Error: Received null response from payment service.');
    }
  } catch (error) {
    console.error('\n❌ Flow Execution Failed:');
    console.error(error);
  }
}

verifyPaymentFlow();
