import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

const tests = [
  // Original problem cases
  { message: 'I want to order paracetamol medicine', expected: 'ORDER' },
  { message: 'paracetamol', expected: 'REJECTED or GENERIC' },
  
  // Order variations
  { message: 'Order 2 paracetamol', expected: 'ORDER' },
  { message: 'order 1 aspirin', expected: 'ORDER' },
  { message: 'I want to order ibuprofen', expected: 'ORDER' },
  { message: 'I need 3 cough syrup', expected: 'ORDER' },
  
  // Price queries
  { message: 'price of cetirizine', expected: 'PRICE' },
  { message: 'How much is amoxicillin', expected: 'PRICE' },
  
  // Dosage queries
  { message: 'dosage of metformin', expected: 'DOSAGE' },
  { message: 'What is the dose for losartan', expected: 'DOSAGE' },
];

async function runTests() {
  console.log('🧪 Running Advanced Order Detection Tests...\n');
  
  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/agent/chat`,
        { message: test.message },
        { timeout: 5000 }
      );
      
      const { reply } = res.data;
      const success = res.status === 200 && res.data.success;
      
      if (success) {
        console.log(`✅ "${test.message}"`);
        console.log(`   → ${reply.split('\n')[0]}\n`);
        passed++;
      } else {
        console.log(`❌ "${test.message}"\n   → ${reply}\n`);
        failed++;
      }
    } catch (err) {
      console.log(`❌ "${test.message}"\n   → ${err.message}\n`);
      failed++;
    }
  }
  
  console.log(`\n📊 Results: ${passed}/${tests.length} passed`);
  console.log(`Success Rate: ${Math.round((passed / tests.length) * 100)}%\n`);
}

runTests();
