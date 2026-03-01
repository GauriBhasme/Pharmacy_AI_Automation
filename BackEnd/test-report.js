#!/usr/bin/env node

/**
 * MEDICAL PHARMACY CHATBOT - COMPREHENSIVE TEST REPORT
 * 
 * This report validates:
 * 1. Medical field restriction (rejects non-medical queries)
 * 2. Intent recognition (price, dosage, side effects, symptoms, orders)
 * 3. Database integration (medicine lookups)
 * 4. Error handling (graceful failures)
 * 5. Response formatting (proper medicine information display)
 */

import axios from 'axios';
import chalk from 'chalk';

const API_URL = 'http://localhost:5000/api/agent/chat';
const API_CHAT = 'http://localhost:5000/api/chat/chat';

// Test suite
const tests = [
  // ===== MEDICAL FIELD VALIDATION =====
  {
    category: 'Medical Field Validation',
    name: 'Reject non-medical query (geography)',
    message: 'What is the capital of France?',
    validation: (reply) => reply.includes('Medical') || reply.includes('medical'),
    shouldPass: true
  },
  {
    category: 'Medical Field Validation',
    name: 'Reject non-medical query (sports)',
    message: 'Who won the FIFA World Cup?',
    validation: (reply) => reply.includes('Medical') || reply.includes('medical'),
    shouldPass: true
  },
  {
    category: 'Medical Field Validation',
    name: 'Accept medicine price query',
    message: 'What is the price of paracetamol?',
    validation: (reply) => reply.includes('Paracetamol') || reply.includes('not found'),
    shouldPass: true
  },

  // ===== INTENT: PRICE QUERY =====
  {
    category: 'Price & Stock Intent',
    name: 'Get price of paracetamol',
    message: 'price of paracetamol',
    validation: (reply) => reply.includes('₹') || reply.includes('Price'),
    shouldPass: true
  },
  {
    category: 'Price & Stock Intent',
    name: 'Get price of aspirin',
    message: 'How much is aspirin?',
    validation: (reply) => reply.includes('Aspirin') || reply.includes('not found'),
    shouldPass: true
  },
  {
    category: 'Price & Stock Intent',
    name: 'Medicine not found in price query',
    message: 'price of zzzzmedicinenamenotexists',
    validation: (reply) => reply.includes('not found') || reply.includes('not found'),
    shouldPass: true
  },

  // ===== INTENT: DOSAGE QUERY =====
  {
    category: 'Dosage Information Intent',
    name: 'Get dosage for ibuprofen',
    message: 'What is the dosage for ibuprofen?',
    validation: (reply) => reply.includes('Dosage') || reply.includes('ibuprofen') || reply.includes('not found'),
    shouldPass: true
  },
  {
    category: 'Dosage Information Intent',
    name: 'How to take paracetamol',
    message: 'How should I take paracetamol tablets?',
    validation: (reply) => reply.includes('Paracetamol') || reply.includes('dosage') || reply.includes('not found'),
    shouldPass: true
  },

  // ===== INTENT: SIDE EFFECTS QUERY =====
  {
    category: 'Safety & Side Effects Intent',
    name: 'Side effects of aspirin',
    message: 'What are the side effects of aspirin?',
    validation: (reply) => reply.includes('Side') || reply.includes('Aspirin') || reply.includes('not found'),
    shouldPass: true
  },
  {
    category: 'Safety & Side Effects Intent',
    name: 'Contraindications for ibuprofen',
    message: 'Are there contraindications for ibuprofen?',
    validation: (reply) => reply.includes('Contraindication') || reply.includes('ibuprofen') || reply.includes('not found'),
    shouldPass: true
  },

  // ===== INTENT: SYMPTOM RECOMMENDATION =====
  {
    category: 'Symptom-Based Recommendations',
    name: 'Medicine for fever',
    message: 'I have a fever, what medicine should I take?',
    validation: (reply) => reply.includes('Paracetamol') || reply.includes('fever'),
    shouldPass: true
  },
  {
    category: 'Symptom-Based Recommendations',
    name: 'Medicine for cough',
    message: 'I have a bad cough',
    validation: (reply) => reply.includes('Cough') || reply.includes('cough'),
    shouldPass: true
  },
  {
    category: 'Symptom-Based Recommendations',
    name: 'Medicine for headache',
    message: 'Which medicine is good for headache?',
    validation: (reply) => reply.includes('Aspirin') || reply.includes('Paracetamol') || reply.includes('headache'),
    shouldPass: true
  },
  {
    category: 'Symptom-Based Recommendations',
    name: 'Medicine for allergy',
    message: 'I have allergies, what should I use?',
    validation: (reply) => reply.includes('Antihistamine') || reply.includes('allergy'),
    shouldPass: true
  },

  // ===== INTENT: ORDER QUERY =====
  {
    category: 'Order Processing Intent',
    name: 'Place order for medicine',
    message: 'I want to order 2 paracetamol tablets',
    validation: (reply) => reply.includes('available') || reply.includes('Order') || reply.includes('Paracetamol'),
    shouldPass: true
  },

  // ===== ERROR HANDLING =====
  {
    category: 'Error Handling',
    name: 'Empty message handling',
    message: '',
    validation: (reply) => reply.includes('empty') || reply.includes('Message'),
    shouldPass: true
  },
  {
    category: 'Error Handling',
    name: 'Whitespace-only message',
    message: '   ',
    validation: (reply) => reply.includes('empty') || reply.includes('Message'),
    shouldPass: true
  },

  // ===== GENERAL QUERIES =====
  {
    category: 'General Medical Queries',
    name: 'General help request',
    message: 'How can you help me?',
    validation: (reply) => reply.includes('Help') || reply.includes('Medical'),
    shouldPass: true
  }
];

// Colors for output
const colors = {
  pass: (txt) => chalk.green(txt),
  fail: (txt) => chalk.red(txt),
  warn: (txt) => chalk.yellow(txt),
  info: (txt) => chalk.blue(txt),
  header: (txt) => chalk.cyan.bold(txt),
  category: (txt) => chalk.magenta(txt)
};

// Test runner
async function runTests() {
  console.log('\n' + colors.header('╔════════════════════════════════════════════════════════════╗'));
  console.log(colors.header('║     MEDICAL PHARMACY CHATBOT - COMPREHENSIVE TEST REPORT     ║'));
  console.log(colors.header('╚════════════════════════════════════════════════════════════╝\n'));

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  const categoryResults = {};

  let lastCategory = '';

  for (const test of tests) {
    totalTests++;

    // Print category header
    if (test.category !== lastCategory) {
      console.log('\n' + colors.category(`📂 ${test.category}`));
      lastCategory = test.category;
      categoryResults[test.category] = { pass: 0, fail: 0 };
    }

    try {
      // Call the API
      const response = await axios.post(API_CHAT, { message: test.message }, {
        timeout: 5000,
        validateStatus: () => true // Don't throw on any status
      }).catch(() => ({
        data: { reply: 'Connection failed' }
      }));

      const reply = response.data?.reply || response.data?.error || '';

      // Validate response
      const isValid = test.validation(reply);
      const passed = isValid === test.shouldPass;

      if (passed) {
        console.log(`  ${colors.pass('✅')} ${test.name}`);
        passedTests++;
        categoryResults[test.category].pass++;
      } else {
        console.log(`  ${colors.fail('❌')} ${test.name}`);
        console.log(`     Input: "${test.message}"`);
        console.log(`     Response: "${reply.substring(0, 100)}..."`);
        failedTests++;
        categoryResults[test.category].fail++;
      }
    } catch (err) {
      console.log(`  ${colors.fail('❌')} ${test.name}`);
      console.log(`     Error: ${err.message}`);
      failedTests++;
      categoryResults[test.category].fail++;
    }
  }

  // Summary Report
  console.log('\n' + colors.header('╔════════════════════════════════════════════════════════════╗'));
  console.log(colors.header('║                    TEST SUMMARY                            ║'));
  console.log(colors.header('╚════════════════════════════════════════════════════════════╝\n'));

  console.log(`Total Tests: ${totalTests}`);
  console.log(`${colors.pass(`✅ Passed: ${passedTests}`)} | ${colors.fail(`❌ Failed: ${failedTests}`)}`);
  console.log(`Success Rate: ${colors.info(`${((passedTests / totalTests) * 100).toFixed(1)}%`)}\n`);

  // Category breakdown
  console.log('Category Results:');
  for (const [category, results] of Object.entries(categoryResults)) {
    const categoryTotal = results.pass + results.fail;
    const categoryRate = ((results.pass / categoryTotal) * 100).toFixed(0);
    console.log(`  ${colors.category(category)}: ${colors.pass(results.pass)}/${categoryTotal} (${categoryRate}%)`);
  }

  // Features checklist
  console.log('\n' + colors.header('═══════════════════════════════════════════════════════════'));
  console.log('FEATURES VALIDATED:\n');

  const features = [
    { name: 'Medical Field Restriction', status: categoryResults['Medical Field Validation'].pass >= 2 },
    { name: 'Price & Stock Lookup', status: categoryResults['Price & Stock Intent'].pass >= 2 },
    { name: 'Dosage Information', status: categoryResults['Dosage Information Intent'].pass >= 1 },
    { name: 'Side Effects & Safety', status: categoryResults['Safety & Side Effects Intent'].pass >= 1 },
    { name: 'Symptom Recommendations', status: categoryResults['Symptom-Based Recommendations'].pass >= 2 },
    { name: 'Order Processing', status: categoryResults['Order Processing Intent'].pass >= 1 },
    { name: 'Error Handling', status: categoryResults['Error Handling'].pass >= 1 },
    { name: 'Database Integration', status: categoryResults['Price & Stock Intent'].pass >= 2 }
  ];

  for (const feature of features) {
    const icon = feature.status ? '✅' : '❌';
    const status = feature.status ? colors.pass('ENABLED') : colors.fail('FAILED');
    console.log(`${icon} ${feature.name.padEnd(30)} ${status}`);
  }

  console.log('\n' + colors.header('═══════════════════════════════════════════════════════════'));

  // Final status
  const allPassed = failedTests === 0;
  console.log('\n' + (allPassed 
    ? colors.pass('✅ CHATBOT IS PRODUCTION READY!')
    : colors.warn('⚠️  SOME TESTS FAILED - Review errors above')));

  console.log('\n' + colors.info('💡 Next Steps:'));
  console.log('   1. Populate database with medicines: node seed-medicines.js');
  console.log('   2. Frontend will connect to: http://localhost:5000/api/chat/chat');
  console.log('   3. All queries are validated for medical field relevance\n');

  process.exit(failedTests > 0 ? 1 : 0);
}

// Wait for server then run tests
async function waitForServer() {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    try {
      await axios.get('http://localhost:5000/health', { timeout: 2000 });
      console.log(colors.pass('✅ Server is ready!\n'));
      return true;
    } catch (err) {
      attempts++;
      console.log(colors.warn(`⏳ Waiting for server... (${attempts}/${maxAttempts})`));
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  console.log(colors.fail('❌ Server did not respond in time'));
  process.exit(1);
}

// Main
console.log(colors.info('🔍 Checking server connectivity...\n'));
await waitForServer();
await runTests();
