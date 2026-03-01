import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/agent';

async function testOrderModal() {
  console.log('🧪 Testing Order Modal Flow...\n');
  let passed = 0;
  let failed = 0;

  // Test cases with order queries
  const testCases = [
    {
      name: 'Order with modal display',
      message: 'I want to order paracetamol medicine',
      shouldShowModal: true,
      expectedMedicine: 'paracetamol'
    },
    {
      name: 'Order with quantity',
      message: 'Order 2 aspirin',
      shouldShowModal: true,
      expectedMedicine: 'aspirin',
      expectedQty: 2
    }
  ];

  for (const test of testCases) {
    try {
      // Step 1: Send order request
      const response = await axios.post(`${BASE_URL}/chat`, {
        message: test.message
      });

      console.log(`✅ "${test.message}"`);
      
      // Verify showOrderModal flag
      if (response.data.showOrderModal !== test.shouldShowModal) {
        console.log(`   ❌ showOrderModal: expected ${test.shouldShowModal}, got ${response.data.showOrderModal}`);
        failed++;
        continue;
      }

      if (test.shouldShowModal && response.data.order) {
        const order = response.data.order;
        console.log(`   📋 Order Details:`);
        console.log(`      - Medicine: ${order.medicine_name}`);
        console.log(`      - Quantity: ${order.quantity}`);
        console.log(`      - Price/Unit: ₹${order.price_per_unit}`);
        console.log(`      - Total: ₹${order.total_price}`);
        console.log(`      - Stock Available: ${order.stock_available}`);

        if (order.medicine_name.toLowerCase() !== test.expectedMedicine.toLowerCase()) {
          console.log(`   ❌ Medicine mismatch: expected ${test.expectedMedicine}, got ${order.medicine_name}`);
          failed++;
          continue;
        }

        if (test.expectedQty && order.quantity !== test.expectedQty) {
          console.log(`   ❌ Quantity mismatch: expected ${test.expectedQty}, got ${order.quantity}`);
          failed++;
          continue;
        }

        // Step 2: Simulate confirm order endpoint
        try {
          const confirmResponse = await axios.post(`${BASE_URL}/confirm-order`, {
            medicine_id: order.medicine_id,
            quantity: order.quantity
          });

          if (confirmResponse.data.success) {
            console.log(`   ✅ Order Confirmed! Stock remaining: ${confirmResponse.data.order.stock_remaining}`);
            passed++;
          }
        } catch (confirmErr) {
          console.log(`   ❌ Order confirmation failed: ${confirmErr.response?.data?.error}`);
          failed++;
        }
      }
    } catch (err) {
      console.log(`❌ "${test.message}"`);
      if (err.response?.data?.error) {
        console.log(`   Error: ${err.response.data.error}`);
      } else {
        console.log(`   Error: ${err.message}`);
      }
      failed++;
    }
    console.log();
  }

  console.log(`\n📊 Results: ${passed}/${passed + failed} passed`);
  console.log(`Success Rate: ${((passed / (passed + failed)) * 100).toFixed(0)}%\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

// Run test
testOrderModal().catch(err => {
  console.error('Test failed:', err.message);
  process.exit(1);
});
