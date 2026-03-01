import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function testDashboardEverything() {
  console.log('🧪 Complete User Dashboard Diagnostic Test\n');

  try {
    // Step 1: Check if auth works
    console.log('📝 Step 1: Testing Authentication Flow');
    console.log('=========================================\n');
    
    let token, userId;
    
    // Try multiple test user credentials
    const testUsers = [
      { email: 'test@test.com', password: 'test123' },
      { email: 'john@example.com', password: 'password123' }
    ];

    let authenticated = false;
    for (const testUser of testUsers) {
      try {
        console.log(`  Trying: ${testUser.email}`);
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, testUser);
        token = loginRes.data.token;
        userId = loginRes.data.user?.user_id;
        
        console.log('  ✅ Login successful');
        console.log(`     Token: ${token.substring(0, 40)}...`);
        console.log(`     User ID: ${userId}`);
        console.log(`     User: ${loginRes.data.user?.username} (${loginRes.data.user?.role})\n`);
        authenticated = true;
        break;
      } catch (err) {
        console.log(`  ❌ Failed: ${err.response?.data?.message || err.message}\n`);
      }
    }

    if (!authenticated) {
      console.error('❌ Could not authenticate with any test user');
      process.exit(1);
    }

    // Step 2: Decode token manually to verify
    console.log('🔍 Step 2: Verifying Token Contents');
    console.log('====================================\n');
    
    const parts = token.split('.');
    if (parts.length === 3) {
      try {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        console.log('  ✅ Token payload:');
        console.log(`     user_id: ${payload.user_id}`);
        console.log(`     role: ${payload.role}`);
        console.log(`     exp: ${new Date(payload.exp * 1000).toLocaleString()}\n`);
      } catch (err) {
        console.log(`  ⚠️ Could not decode token: ${err.message}\n`);
      }
    }

    // Step 3: Test dashboard endpoint
    console.log('📊 Step 3: Testing Dashboard Endpoint');
    console.log('=====================================\n');
    
    try {
      const dashboardRes = await axios.get(`${BASE_URL}/user/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('  ✅ Dashboard endpoint successful\n');
      console.log('  Response data:');
      console.log('  ' + JSON.stringify(dashboardRes.data, null, 2).split('\n').join('\n  '));
      
      console.log('\n\n✅ ALL TESTS PASSED!');
      console.log('Dashboard data should load correctly in the frontend.');
      
    } catch (dashboardErr) {
      console.error('  ❌ Dashboard endpoint failed');
      console.error(`     Status: ${dashboardErr.response?.status}`);
      console.error(`     Message: ${dashboardErr.response?.data?.message || dashboardErr.response?.data?.error || dashboardErr.message}`);
      console.error(`     Full response:`, dashboardErr.response?.data);
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    process.exit(1);
  }
}

testDashboardEverything();
