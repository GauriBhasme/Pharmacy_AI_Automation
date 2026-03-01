#!/usr/bin/env node

/**
 * Medical Pharmacy Chatbot - Startup Script
 * Starts the backend server with proper logging and health checks
 */

import { spawn } from 'child_process';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const PORT = process.env.PORT || 5000;
const HEALTH_URL = `http://localhost:${PORT}/health`;
const MAX_RETRIES = 15;
const RETRY_DELAY = 500; // ms

console.log('\n╔════════════════════════════════════════╗');
console.log('║ Medical Pharmacy Chatbot - Startup    ║');
console.log('╚════════════════════════════════════════╝\n');

// Check if .env exists
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ Error: .env file not found');
  console.error(`   Expected at: ${envPath}`);
  process.exit(1);
}

console.log('✅ .env file found');

// Start the server
console.log('🚀 Starting server...\n');

const server = spawn('node', ['src/server.js'], {
  stdio: 'inherit',
  env: { ...process.env }
});

server.on('error', (err) => {
  console.error('❌ Failed to start server:', err.message);
  process.exit(1);
});

server.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Server exited with code ${code}`);
    process.exit(code);
  }
});

// Wait for server to be ready
let retries = 0;
const checkHealth = setInterval(async () => {
  retries++;
  
  try {
    const response = await axios.get(HEALTH_URL, { timeout: 1000 });
    if (response.data.status === 'ok') {
      clearInterval(checkHealth);
      console.log('\n✅ Server is running and healthy!');
      console.log(`\n📊 Server Information:`);
      console.log(`   URL: http://localhost:${PORT}`);
      console.log(`   Health: ${HEALTH_URL}`);
      console.log(`   PID: ${response.data.pid}`);
      console.log(`\n🔗 API Endpoints:`);
      console.log(`   Chat: POST http://localhost:${PORT}/api/agent/chat`);
      console.log(`   Chat Alt: POST http://localhost:${PORT}/api/chat/chat`);
      console.log(`\n✨ Medical Pharmacy Chatbot Ready!`);
      console.log(`   - Only responds to medical/pharmacy queries`);
      console.log(`   - Supports: pricing, dosage, side effects, orders`);
      console.log(`   - Connected to: FrontEnd on http://localhost:5173/5175\n`);
    }
  } catch (err) {
    if (retries < MAX_RETRIES) {
      process.stdout.write('.');
    } else {
      clearInterval(checkHealth);
      console.error('\n\n❌ Server health check failed after', MAX_RETRIES, 'retries');
      console.error('   Make sure database is running and .env is configured');
      process.exit(1);
    }
  }
}, RETRY_DELAY);

// Exit gracefully on SIGTERM/SIGINT
process.on('SIGTERM', () => {
  console.log('\n\n⛔ Stopping server...');
  server.kill();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n\n⛔ Stopping server...');
  server.kill();
  process.exit(0);
});
