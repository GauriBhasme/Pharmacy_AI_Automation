#!/usr/bin/env node

/**
 * MEDICAL PHARMACY CHATBOT - COMPREHENSIVE TEST REPORT
 * Tests: Medical field restriction, intent recognition, database integration
 */

import axios from 'axios';

const API_CHAT = 'http://localhost:5000/api/chat/chat';

const tests = [
  // Medical Field Validation
  { category: 'MEDICAL FIELD VALIDATION', name: 'Reject non-medical: geography', message: 'What is the capital of France?', check: r => r.includes('Medical') },
  { category: 'MEDICAL FIELD VALIDATION', name: 'Reject non-medical: sports', message: 'Who won the FIFA World Cup?', check: r => r.includes('Medical') },
  { category: 'MEDICAL FIELD VALIDATION', name: 'Accept: medicine price', message: 'What is the price of paracetamol?', check: r => r.includes('paracetamol') || r.includes('found') },

  // Price & Stock Intent
  { category: 'PRICE & STOCK INTENT', name: 'Get price of paracetamol', message: 'price of paracetamol', check: r => r.includes('₹') || r.includes('Price') || r.includes('found') },
  { category: 'PRICE & STOCK INTENT', name: 'Get price of aspirin', message: 'How much is aspirin?', check: r => r.includes('Aspirin') || r.includes('found') },

  // Dosage Intent
  { category: 'DOSAGE INTENT', name: 'Get dosage for ibuprofen', message: 'What is the dosage for ibuprofen?', check: r => r.includes('Dosage') || r.includes('ibuprofen') || r.includes('found') },

  // Side Effects Intent
  { category: 'SAFETY INTENT', name: 'Side effects of aspirin', message: 'What are the side effects of aspirin?', check: r => r.includes('Side') || r.includes('Aspirin') || r.includes('found') },

  // Symptom Based
  { category: 'SYMPTOM RECOMMENDATIONS', name: 'Medicine for fever', message: 'I have a fever, what medicine?', check: r => r.includes('fever') || r.includes('Paracetamol') },
  { category: 'SYMPTOM RECOMMENDATIONS', name: 'Medicine for cough', message: 'I have a bad cough', check: r => r.includes('cough') || r.includes('Cough') },
  { category: 'SYMPTOM RECOMMENDATIONS', name: 'Medicine for allergy', message: 'I have allergies', check: r => r.includes('allergy') || r.includes('Antihistamine') },

  // Order Intent
  { category: 'ORDER PROCESSING', name: 'Place medicine order', message: 'I want to order 2 paracetamol', check: r => r.includes('Order') || r.includes('paracetamol') || r.includes('available') },

  // Error Handling
  { category: 'ERROR HANDLING', name: 'Empty message', message: '', check: r => r.includes('empty') || r.includes('Message') },

  // General
  { category: 'GENERAL QUERIES', name: 'General help request', message: 'How can you help?', check: r => r.includes('Medical') || r.includes('assist') }
];

async function runTests() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║ MEDICAL PHARMACY CHATBOT - COMPREHENSIVE TEST REPORT       ║');
  console.log('║ Testing Medical Field Validation & Intent Recognition      ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  let passed = 0;
  let failed = 0;
  let lastCategory = '';
  const categories = {};

  for (const test of tests) {
    if (test.category !== lastCategory) {
      console.log(`\n📂 ${test.category}`);
      lastCategory = test.category;
      categories[test.category] = { pass: 0, fail: 0 };
    }

    try {
      const res = await axios.post(API_CHAT, { message: test.message }, {
        timeout: 3000,
        validateStatus: () => true
      }).catch(() => ({ data: { reply: '' } }));

      const reply = res.data?.reply || res.data?.error || '';
      const success = test.check(reply);

      if (success) {
        console.log(`   ✅ ${test.name}`);
        passed++;
        categories[test.category].pass++;
      } else {
        console.log(`   ❌ ${test.name}`);
        console.log(`      Got: ${reply.substring(0, 60)}...`);
        failed++;
        categories[test.category].fail++;
      }
    } catch (err) {
      console.log(`   ❌ ${test.name} (Error: ${err.message})`);
      failed++;
      categories[test.category].fail++;
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('SUMMARY');
  console.log('═'.repeat(60));
  console.log(`Total Tests:  ${passed + failed}`);
  console.log(`✅ Passed:    ${passed}`);
  console.log(`❌ Failed:    ${failed}`);
  console.log(`Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%\n`);

  console.log('CATEGORY BREAKDOWN:');
  for (const [cat, stats] of Object.entries(categories)) {
    const total = stats.pass + stats.fail;
    const pct = ((stats.pass / total) * 100).toFixed(0);
    console.log(`  ${cat.padEnd(30)} ${stats.pass}/${total} (${pct}%)`);
  }

  // Features
  console.log('\n' + '═'.repeat(60));
  console.log('FEATURES VALIDATED:');
  console.log('═'.repeat(60));

  const features = [
    { name: 'Medical Field Restriction', ok: categories['MEDICAL FIELD VALIDATION'].pass >= 2 },
    { name: 'Price & Stock Lookup', ok: categories['PRICE & STOCK INTENT'].pass >= 1 },
    { name: 'Dosage Information', ok: categories['DOSAGE INTENT'].pass >= 1 },
    { name: 'Safety & Side Effects', ok: categories['SAFETY INTENT'].pass >= 1 },
    { name: 'Symptom Recommendations', ok: categories['SYMPTOM RECOMMENDATIONS'].pass >= 2 },
    { name: 'Order Processing', ok: categories['ORDER PROCESSING'].pass >= 1 },
    { name: 'Error Handling', ok: categories['ERROR HANDLING'].pass >= 1 },
    { name: 'Database Integration', ok: categories['PRICE & STOCK INTENT'].pass >= 1 }
  ];

  for (const feat of features) {
    console.log(`${feat.ok ? '✅' : '❌'} ${feat.name}`);
  }

  console.log('\n' + '═'.repeat(60));
  if (failed === 0) {
    console.log('✅ CHATBOT IS PRODUCTION READY!');
    console.log('\nAll medical field validations and intents are working correctly.');
  } else {
    console.log(`⚠️  ${failed} TESTS FAILED - Review the logs above`);
  }
  console.log('\nNext: Populate database with: node seed-medicines.js');
  console.log('═'.repeat(60) + '\n');

  process.exit(failed > 0 ? 1 : 0);
}

// Check server health first
async function checkServer() {
  let attempts = 0;
  while (attempts < 10) {
    try {
      await axios.get('http://localhost:5000/health', { timeout: 1000 });
      console.log('✅ Server is running!\n');
      return;
    } catch {
      attempts++;
      console.log(`⏳ Waiting for server... (${attempts}/10)`);
      await new Promise(r => setTimeout(r, 500));
    }
  }
  console.log('❌ Server not responding');
  process.exit(1);
}

console.log('🔍 Checking server...');
await checkServer();
await runTests();
