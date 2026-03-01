import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function testUserDashboardFull() {
  console.log('🧪 Testing User Dashboard Full Integration...\n');

  try {
    // Step 1: Try to login
    console.log('📝 Step 1: Logging in as test user...');
    let token;
    
    try {
      const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'test@test.com',
        password: 'test123'
      });
      token = loginRes.data.token;
      console.log('✅ Login successful');
      console.log(`   Token: ${token.substring(0, 30)}...`);
    } catch (loginErr) {
      console.log('⚠️ Test user not found, trying different email...');
      const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'john@example.com',
        password: 'password123'
      });
      token = loginRes.data.token;
      console.log('✅ Login successful with john@example.com');
      console.log(`   Token: ${token.substring(0, 30)}...`);
    }

    // Step 2: Fetch dashboard with token
    console.log('\n📊 Step 2: Fetching user dashboard with token...');
    const dashboardRes = await axios.get(`${BASE_URL}/user/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Dashboard data received\n');
    console.log('📊 Full Response:');
    console.log(JSON.stringify(dashboardRes.data, null, 2));

    console.log('\n📈 Summary:');
    console.log(`✅ Total Orders: ${dashboardRes.data.totalOrders}`);
    console.log(`✅ Active Medications: ${dashboardRes.data.activeMedications?.length || 0}`);
    console.log(`✅ Refill Alerts: ${dashboardRes.data.refillAlerts?.length || 0}`);
    console.log(`✅ Total Chats: ${dashboardRes.data.totalChats}`);

    if (dashboardRes.data.activeMedications?.length > 0) {
      console.log('\n💊 Active Medications:');
      dashboardRes.data.activeMedications.forEach((med, idx) => {
        console.log(`   ${idx + 1}. ${med.medicine_name} (Qty: ${med.quantity})`);
      });
    }

  } catch (err) {
    console.error('❌ Error:', err.response?.data || err.message);
    if (err.response?.data?.error) {
      console.error('Error Details:', err.response.data.error);
    }
    process.exit(1);
  }
}

testUserDashboardFull();
