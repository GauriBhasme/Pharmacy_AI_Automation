import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function testUserDashboard() {
  console.log('🧪 Testing User Dashboard Endpoint...\n');

  try {
    // First, try to login as a user
    console.log('📝 Logging in as test user...');
    let loginRes;
    
    try {
      loginRes = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'test@test.com',
        password: 'test123'
      });
    } catch (loginErr) {
      console.log('⚠️ Test user not found, attempting to register...');
      
      // Register a test user
      loginRes = await axios.post(`${BASE_URL}/auth/register`, {
        username: 'testuser',
        email: 'testuser@test.com',
        password: 'test123',
        phone: '1234567890'
      });
      
      // Login with the registered user
      loginRes = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'testuser@test.com',
        password: 'test123'
      });
    }

    const token = loginRes.data.token;
    const userId = loginRes.data.user?.user_id || loginRes.data.userId;
    
    console.log(`✅ Logged in successfully (User ID: ${userId})\n`);

    // Fetch user dashboard
    console.log('📊 Fetching user dashboard...');
    const dashboardRes = await axios.get(`${BASE_URL}/user/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Dashboard data retrieved successfully!\n');
    console.log('📊 User Dashboard Metrics:');
    console.log(`   Total Orders: ${dashboardRes.data.totalOrders}`);
    console.log(`   Active Medications: ${dashboardRes.data.activeMedications?.length || 0}`);
    console.log(`   Refill Alerts: ${dashboardRes.data.refillAlerts?.length || 0}`);
    console.log(`   Total Chats: ${dashboardRes.data.totalChats}`);

    if (dashboardRes.data.activeMedications?.length > 0) {
      console.log('\n💊 Active Medications:');
      dashboardRes.data.activeMedications.forEach((med, idx) => {
        console.log(`   ${idx + 1}. ${med.medicine_name} (Qty: ${med.quantity})`);
      });
    }

    if (dashboardRes.data.refillAlerts?.length > 0) {
      console.log('\n🚨 Refill Alerts:');
      dashboardRes.data.refillAlerts.forEach((alert, idx) => {
        console.log(`   ${idx + 1}. ${alert.medicine_name} (${alert.days_since_order} days ago)`);
      });
    }

    console.log('\n✅ All user dashboard metrics loaded from database!');

  } catch (err) {
    console.error('❌ Error:', err.response?.data?.message || err.message);
    process.exit(1);
  }
}

testUserDashboard();
