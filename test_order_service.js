const { createClient } = require('@supabase/supabase-js');
const { OrderService } = require('./backend/dist/services/orderService');

// Test configuration - replace with your actual values
const SUPABASE_URL = process.env.SUPABASE_URL || 'your_supabase_url';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'your_supabase_key';
const TEST_USER_ID = 'a9ed8c62-3262-49ed-a211-676394f55872'; // From your SQL data
const TEST_PROJECT_ID = 'e9beac16-7b2c-46a4-b022-23d48c15f73e'; // From your SQL data

async function testOrderService() {
  console.log('🧪 Starting OrderService Test...\n');
  
  try {
    // Create Supabase client for authentication
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    
    // Test with dummy access token (in real scenario, get this from authentication)
    const TEST_ACCESS_TOKEN = 'test_token_123';
    
    const orderService = new OrderService();
    
    console.log('1️⃣ Testing getUserOrders...');
    try {
      const result = await orderService.getUserOrders(TEST_USER_ID, TEST_ACCESS_TOKEN);
      console.log('✅ getUserOrders successful');
      console.log(`   Found ${result.orders?.length || 0} orders`);
      if (result.orders?.length > 0) {
        console.log(`   First order: ${result.orders[0].order_number} (${result.orders[0].order_status})`);
      }
    } catch (error) {
      console.log('❌ getUserOrders failed:', error.message);
    }
    
    console.log('\n2️⃣ Testing isProjectAlreadyOrdered...');
    try {
      const isOrdered = await orderService.isProjectAlreadyOrdered(TEST_PROJECT_ID, TEST_ACCESS_TOKEN);
      console.log('✅ isProjectAlreadyOrdered successful');
      console.log(`   Project ${TEST_PROJECT_ID} is ${isOrdered ? 'already ordered' : 'not ordered yet'}`);
    } catch (error) {
      console.log('❌ isProjectAlreadyOrdered failed:', error.message);
    }
    
    console.log('\n3️⃣ Testing getOrderById...');
    try {
      // Use first order ID from your SQL data
      const testOrderId = '2368c772-ce54-4022-b68a-145dce0bb342';
      const order = await orderService.getOrderById(testOrderId, TEST_ACCESS_TOKEN);
      console.log('✅ getOrderById successful');
      if (order) {
        console.log(`   Order: ${order.order_number} - ${order.order_status}`);
        console.log(`   Items: ${order.items?.length || 0}`);
      } else {
        console.log('   Order not found');
      }
    } catch (error) {
      console.log('❌ getOrderById failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Test setup failed:', error.message);
  }
  
  console.log('\n🏁 Test completed!');
}

// Run the test
testOrderService().catch(console.error);