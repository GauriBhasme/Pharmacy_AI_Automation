import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

async function test() {
  try {
    console.log('Testing API...\n');

    // Test 1: Health
    console.log('1. Testing health endpoint...');
    try {
      const res = await axios.get(`${BASE_URL}/health`);
      console.log('✅ Health:', res.data);
    } catch (err) {
      console.log('❌ Health failed:', err.message);
    }

    // Test 2: Chat with simple message
    console.log('\n2. Testing chat endpoint with "price of paracetamol"...');
    try {
      const res = await axios.post(
        `${BASE_URL}/api/agent/chat`,
        { message: 'price of paracetamol' },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000
        }
      );
      console.log('✅ Chat response:', JSON.stringify(res.data, null, 2));
    } catch (err) {
      console.log('❌ Chat failed:', err.response?.data || err.message);
      console.log('Error status:', err.response?.status);
    }

  } catch (err) {
    console.error('Test error:', err.message);
  }
}

test();
