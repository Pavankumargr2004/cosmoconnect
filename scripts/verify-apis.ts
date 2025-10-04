#!/usr/bin/env ts-node

/**
 * Script to verify that all required APIs are accessible
 * Run with: npx ts-node scripts/verify-apis.ts
 */

import { getAPOD, getRecentCMEs } from '../services/spaceWeatherService';
import { getAuroraStory } from '../services/geminiService';

async function verifyNASAAPIS() {
  console.log('🔍 Verifying NASA APIs...');
  
  try {
    console.log('  🌌 Checking APOD API...');
    const apod = await getAPOD();
    console.log('  ✅ APOD API is working');
    console.log(`     Title: ${apod.title}`);
    console.log(`     Date: ${apod.date}`);
  } catch (error) {
    console.error('  ❌ APOD API failed:', error);
  }
  
  try {
    console.log('  ☀️ Checking CME API...');
    const cmes = await getRecentCMEs();
    console.log('  ✅ CME API is working');
    console.log(`     Found ${cmes.length} CMEs in the last 7 days`);
  } catch (error) {
    console.error('  ❌ CME API failed:', error);
  }
}

async function verifyGeminiAPI() {
  console.log('🔍 Verifying Gemini API...');
  
  try {
    console.log('  🤖 Checking Gemini API...');
    const story = await getAuroraStory();
    console.log('  ✅ Gemini API is working');
    console.log(`     Sample story: ${story.substring(0, 50)}...`);
  } catch (error) {
    console.error('  ❌ Gemini API failed:', error);
  }
}

async function main() {
  console.log('🚀 CosmoConnect API Verification Script\n');
  
  await verifyNASAAPIS();
  console.log('');
  await verifyGeminiAPI();
  
  console.log('\n✅ Verification complete!');
}

main().catch(console.error);