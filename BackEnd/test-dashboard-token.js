import axios from 'axios';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'http://localhost:5000/api';

async function testDashboardWithDirectToken() {
  console.log('🧪 Testing Dashboard with Direct JWT Token\n');

  try {
    // Step 1: Create a token manually for testing
    console.log('📝 Step 1: Creating Manual JWT Token');
    console.log('====================================\n');
    
    // Use user_id = 1 (John Doe) from the database
    const userId = 1;
    const payload = {
      user_id: userId,
      role: 'user'
    };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
    console.log(`✅ Manual token created for user_id: ${userId}`);
    console.log(`   Token: ${token.substring(0, 50)}...\n`);

    // Step 2: Test dashboard endpoint with the token
    console.log('📊 Step 2: Testing Dashboard Endpoint');
    console.log('====================================\n');
    
    try {
      const dashboardRes = await axios.get(`${BASE_URL}/user/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Dashboard endpoint successful!\n');
      console.log('Response data:\n');
      console.log(JSON.stringify(dashboardRes.data, null, 2));
      console.log('\n✅ The dashboard endpoint is working correctly!');
      console.log('   The issue is likely with authentication/token handling in the frontend.');
      
    } catch (dashboardErr) {
      console.error('❌ Dashboard endpoint failed');
      console.error(`   Status: ${dashboardErr.response?.status}`);
      console.error(`   Error: ${dashboardErr.response?.data?.error || dashboardErr.response?.data?.message}`);
      console.error(`   Details:`, dashboardErr.response?.data);
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

testDashboardWithDirectToken();
