// src/day5/testScalableMemory.ts
//
// 🧪 SCALABLE MEMORY TEST
// This file tests the scalable memory patterns with multiple users
// to demonstrate per-user isolation and memory management.

import {
  testScalableMemory,
  clearUserMemory,
  getMemoryStats,
} from './scalableMemory.js';

async function runScalableMemoryTest() {
  console.log('🚀 Testing Scalable Memory Patterns\n');

  try {
    // Test multiple users with isolated memory
    await testScalableMemory();

    console.log('\n📊 Final Memory Statistics:');
    const stats = getMemoryStats();
    console.log(`- Total Users: ${stats.totalUsers}`);
    console.log(`- Total Instances: ${stats.totalInstances}`);

    // Demonstrate memory cleanup
    console.log('\n🧹 Testing Memory Cleanup:');
    clearUserMemory('user-123');

    const statsAfterCleanup = getMemoryStats();
    console.log(`- Users after cleanup: ${statsAfterCleanup.totalUsers}`);
    console.log(
      `- Instances after cleanup: ${statsAfterCleanup.totalInstances}`,
    );

    console.log('\n✅ Scalable memory test completed!');
    console.log(
      "Each user has isolated memory that doesn't interfere with others.",
    );
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
runScalableMemoryTest().catch(console.error);
