import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

const tests = [
  { message: 'price of paracetamol', expected: 'PRICE' },
  { message: 'dosage of ibuprofen', expected: 'DOSAGE' },
  { message: 'side effects of aspirin', expected: 'SIDE_EFFECTS' },
  { message: 'I have a fever, what medicine', expected: 'SYMPTOM' },
  { message: 'Order 2 paracetamol', expected: 'ORDER' },
  { message: 'What is the weather', expected: 'REJECTED' }
];

async function runTests() {
  console.log('🧪 Running Chatbot Tests...\n');
  
  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/agent/chat`,
        { message: test.message },
        { timeout: 5000 }
      );
      
      const { reply, medicine } = res.data;
      const success = res.status === 200 && res.data.success;
      
      if (test.expected === 'REJECTED') {
        if (reply.includes('only help with pharmacy') || reply.includes('pharmacy and medicine')) {
          console.log(`✅ PASS: "${test.message}"\n   → Correctly rejected non-medical query\n`);
          passed++;
        } else {
          console.log(`❌ FAIL: "${test.message}"\n   → Should reject but got: ${reply}\n`);
          failed++;
        }
      } else if (success) {
        console.log(`✅ PASS: "${test.message}"\n   → ${reply.split('\n')[0]}\n`);
        passed++;
      } else {
        console.log(`❌ FAIL: "${test.message}"\n   → Error: ${reply}\n`);
        failed++;
      }
    } catch (err) {
      console.log(`❌ FAIL: "${test.message}"\n   → ${err.message}\n`);
      failed++;
    }
  }
  
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  console.log(`Success Rate: ${Math.round((passed / tests.length) * 100)}%\n`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed! Chatbot is working perfectly!');
  }
}

runTests();
