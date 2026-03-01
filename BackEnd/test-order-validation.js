import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/agent';

async function testOrderValidation() {
  console.log('🧪 Testing Order Validation (Availability & Stock Check)...\n');
  let passed = 0;
  let failed = 0;

  const testCases = [
    {
      name: 'Valid order - medicine exists, stock available',
      message: 'Order 1 paracetamol',
      expectModal: true,
      expectSuccess: true
    },
    {
      name: 'Valid order - multiple units',
      message: 'I want to order 3 ibuprofen',
      expectModal: true,
      expectSuccess: true
    },
    {
      name: 'Invalid order - medicine does NOT exist',
      message: 'Order 5 xyz123medicine',
      expectModal: false,
      expectSuccess: true,
      expectError: 'We don\'t have'
    },
    {
      name: 'Invalid order - insufficient stock',
      message: 'Order 1000 cetirizine',
      expectModal: false,
      expectSuccess: true,
      expectError: 'Insufficient Stock'
    }
  ];

  for (const test of testCases) {
    try {
      const response = await axios.post(`${BASE_URL}/chat`, {
        message: test.message
      });

      const hasModal = response.data.showOrderModal === true;
      const reply = response.data.reply;

      if (test.expectModal) {
        if (hasModal) {
          console.log(`✅ ${test.name}`);
          console.log(`   📋 Modal shown: YES`);
          console.log(`   💬 Reply: ${reply.substring(0, 50)}...`);
          passed++;
        } else {
          console.log(`❌ ${test.name}`);
          console.log(`   Expected modal but got: ${reply.substring(0, 50)}...`);
          failed++;
        }
      } else {
        if (!hasModal) {
          if (test.expectError && reply.includes(test.expectError)) {
            console.log(`✅ ${test.name}`);
            console.log(`   📋 Modal shown: NO (correct)`);
            console.log(`   💬 Error message present: ${test.expectError}`);
            passed++;
          } else if (test.expectError && !reply.includes(test.expectError)) {
            console.log(`❌ ${test.name}`);
            console.log(`   Expected error: "${test.expectError}"`);
            console.log(`   Got: ${reply.substring(0, 50)}...`);
            failed++;
          } else {
            console.log(`✅ ${test.name}`);
            console.log(`   📋 Modal shown: NO (correct)`);
            console.log(`   💬 Reply: ${reply.substring(0, 50)}...`);
            passed++;
          }
        } else {
          console.log(`❌ ${test.name}`);
          console.log(`   Modal should NOT be shown, but it was`);
          failed++;
        }
      }
    } catch (err) {
      console.log(`❌ ${test.name}`);
      console.log(`   Error: ${err.message}`);
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

testOrderValidation().catch(err => {
  console.error('Test failed:', err.message);
  process.exit(1);
});
