// src/day5/testMemory.ts
//
// 🧪 MEMORY TEST
// This file demonstrates how the Day 5 graph with memory works
// by running multiple interactions and showing how the agent remembers previous conversations.

import { agentGraphWithMemory } from './graphWithMemory.js';

async function testMemory() {
  console.log('🧠 qiwjeqioejqoiwe');
  console.log('🧠 Testing Day 5: Memory + Retry\n');

  // First interaction - agent has no memory yet
  console.log('📝 Interaction 1: Initial search');
  const result1 = await agentGraphWithMemory.invoke({
    input: 'Search for Harry Potter books',
  });
  console.log('Response:', result1.agentOut);
  console.log('---\n');

  // Second interaction - agent should remember the previous conversation
  console.log('📝 Interaction 2: Follow-up question');
  const result2 = await agentGraphWithMemory.invoke({
    input: 'What about the ones you found earlier?',
  });
  console.log('Response:', result2.agentOut);
  console.log('---\n');

  // Third interaction - agent has full conversation context
  console.log('📝 Interaction 3: Complex request with memory');
  const result3 = await agentGraphWithMemory.invoke({
    input:
      'Refund payment pi_3RCL7YEWqBMHeCvg1cxqxmDw and suggest similar books to what we discussed',
  });
  console.log('Response:', result3.agentOut);
  console.log('---\n');

  console.log('✅ Memory test completed!');
  console.log(
    'The agent should have remembered previous interactions and provided more contextual responses.',
  );
}

// Run the test
testMemory().catch(console.error);
