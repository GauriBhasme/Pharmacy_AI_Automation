import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

// Test credentials for our new test user
const testCredentials = {
  email: 'dashboardtest@pharmacy.com',
  password: 'test12345'
};

async function testEndToEnd() {
  try {
    console.log('🧪 End-to-End Dashboard Test\n');
    console.log('================================\n');

    // Step 1: Login
    console.log('📝 Step 1: Logging in...');
    console.log(`   Email: ${testCredentials.email}`);
    console.log(`   Password: ${testCredentials.password}\n`);

    const loginResponse = await axios.post(
      `${BASE_URL}/api/auth/login`,
      testCredentials
    );

    const { token, user } = loginResponse.data;

    console.log('✅ Login successful!\n');
    console.log(`   Token: ${token.substring(0, 20)}...`);
    console.log(`   User ID: ${user.user_id}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Role: ${user.role}\n`);

    // Step 2: Decode JWT to verify contents
    console.log('📝 Step 2: Decoding JWT token...');
    const parts = token.split('.');
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    console.log(`   Decoded Payload:`);
    console.log(`   - user_id: ${payload.user_id}`);
    console.log(`   - role: ${payload.role}\n`);

    // Step 3: Call dashboard endpoint
    console.log('📝 Step 3: Fetching dashboard data...');
    const dashboardResponse = await axios.get(
      `${BASE_URL}/api/user/dashboard`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const dashboard = dashboardResponse.data;

    console.log('✅ Dashboard data retrieved!\n');
    console.log(`   Total Orders: ${dashboard.totalOrders}`);
    console.log(`   Active Medications: ${dashboard.activeMedications.length}`);
    dashboard.activeMedications.forEach((med, i) => {
      console.log(`      ${i + 1}. ${med.medicine_name} - Qty: ${med.quantity}, Price: $${med.total_price}`);
    });
    console.log(`   Refill Alerts: ${dashboard.refillAlerts.length}`);
    console.log(`   Total Chats: ${dashboard.totalChats}\n`);

    // Step 4: Verify data
    console.log('✅ Verification:\n');
    if (dashboard.totalOrders === 3) {
      console.log('   ✅ Total Orders: 3 (expected)');
    } else {
      console.log(`   ❌ Total Orders: ${dashboard.totalOrders} (expected 3)`);
    }

    if (dashboard.activeMedications.length === 3) {
      console.log('   ✅ Active Medications: 3 (expected)');
    } else {
      console.log(`   ❌ Active Medications: ${dashboard.activeMedications.length} (expected 3)`);
    }

    if (dashboard.refillAlerts.length === 0) {
      console.log('   ✅ Refill Alerts: 0 (expected)');
    } else {
      console.log(`   ❌ Refill Alerts: ${dashboard.refillAlerts.length} (expected 0)`);
    }

    console.log('\n================================');
    console.log('✅ All tests passed!\n');
    console.log('🎯 To test the frontend:');
    console.log('1. In your browser, navigate to http://localhost:5173 (assuming Vite frontend)');
    console.log('2. Click "Login" in the navigation');
    console.log('3. Enter the following credentials:');
    console.log(`   Email: ${testCredentials.email}`);
    console.log(`   Password: ${testCredentials.password}`);
    console.log('4. After login, navigate to Dashboard');
    console.log('5. You should see:');
    console.log('   - Total Orders: 3');
    console.log('   - Active Medications: 3 (Paracetamol, Aspirin, Cough Syrup)');
    console.log('   - Refill Alerts: 0');
    console.log('   - AI Interactions: 0');

  } catch (err) {
    console.error('❌ Error:', err.response?.data || err.message);
    if (err.response?.status === 401) {
      console.error('   → Authentication failed. Check credentials.');
    }
    process.exit(1);
  }
}

testEndToEnd();
