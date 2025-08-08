// src/day5/graphWithMemory.ts
//
// 🧠 DAY 5: MEMORY + RETRY
// This file demonstrates how to add conversation memory and retry policies
// to make our agent more context-aware and resilient to transient failures.
//
// CONCEPT: We enhance the Day 4 graph with:
// 1. BufferMemory - Stores conversation history so the agent remembers previous interactions
// 2. RetryPolicy - Automatically retries failed operations with exponential backoff
// 3. Enhanced state management - Tracks both current input and conversation history

import { StateGraph, Annotation } from '@langchain/langgraph';
import { BufferMemory } from 'langchain/memory';
import { agentExecutor } from '../day3/executor';

// 📊 ENHANCED STATE DEFINITION
// Now includes conversation history for context-aware responses
import { BaseMessage } from '@langchain/core/messages';

const GraphState = Annotation.Root({
  input: Annotation<string>(), // Current user input
  agentOut: Annotation<string>(), // Agent's response
  chat_history: Annotation<BaseMessage[]>(), // Conversation history (managed by BufferMemory)
});
type GS = typeof GraphState.State;

// 🧠 MEMORY CONFIGURATION
// BufferMemory stores conversation history and makes it available to the agent
// This allows the agent to remember previous interactions and provide more contextual responses
const memory = new BufferMemory({
  returnMessages: true, // Return as message objects for better LLM processing
  memoryKey: 'chat_history', // Key used to access memory in the agent (matches prompt template)
  outputKey: 'output', // Specify which key contains the agent's output
});

// 🚀 BUILD THE ENHANCED EXECUTION GRAPH
// This creates a workflow that processes user input with memory and retry capabilities
export const agentGraphWithMemory = new StateGraph(GraphState)

  // 📥 NODE 1: Echo Input Node (unchanged from Day 4)
  // Purpose: Preserves the original user input for later use
  .addNode(
    'echoInput',
    (s: GS): Partial<GS> => ({
      input: s.input,
    }),
  )

  // 🤖 NODE 2: Enhanced Agent Execution Node
  // Purpose: Calls the Day-3 agent with memory and retry capabilities
  // Key enhancements:
  // 1. Attaches BufferMemory to the executor for conversation history
  // 2. Wraps execution in RetryPolicy for resilience against transient failures
  // 3. Manages conversation state throughout the interaction
  .addNode(
    'callAgent',
    async (s: GS): Promise<Partial<GS>> => {
      // Attach memory to the executor for this invocation
      agentExecutor.memory = memory;

      // Execute the agent with current input and memory context
      const result = await agentExecutor.invoke({
        input: s.input,
      });

      return {
        agentOut: result.output as string,
      };
    },
    // 🔄 RETRY POLICY CONFIGURATION
    // Exponential backoff retry with 3 attempts, starting at 1 second
    // This helps handle transient failures like rate limits, network issues, etc.
    {
      retryPolicy: {
        initialInterval: 1000, // Start with 1 second delay
        backoffFactor: 2, // Double the delay each retry
        maxAttempts: 3, // Try up to 3 times
      },
    },
  )

  // 📤 NODE 3: Return Node (unchanged from Day 4)
  // Purpose: Prepares the final output for the user
  .addNode(
    'return',
    (s: GS): Partial<GS> => ({
      agentOut: s.agentOut,
    }),
  )

  // 🔗 WIRE THE FLOW - Same linear pipeline as Day 4
  .addEdge('__start__', 'echoInput')
  .addEdge('echoInput', 'callAgent')
  .addEdge('callAgent', 'return')
  .addEdge('return', '__end__')

  // ⚙️ COMPILE INTO EXECUTABLE
  .compile();

// 💡 USAGE EXAMPLE:
//
// // First interaction - agent has no memory yet
// const result1 = await agentGraphWithMemory.invoke({
//   input: "Search for Harry Potter books"
// });
// // Agent searches for books and responds
//
// // Second interaction - agent remembers the previous conversation
// const result2 = await agentGraphWithMemory.invoke({
//   input: "What about the ones you found earlier?"
// });
// // Agent can reference the previous search results and provide more contextual response
//
// // Third interaction - agent has full conversation context
// const result3 = await agentGraphWithMemory.invoke({
//   input: "Refund payment pi_3RCL7YEWqBMHeCvg1cxqxmDw and suggest similar books"
// });
// // Agent can combine knowledge from all previous interactions
//
// EXECUTION FLOW WITH MEMORY:
// 1. echoInput node: Preserves current user input
// 2. callAgent node:
//    - Agent has access to conversation history via BufferMemory
//    - Can reference previous searches, refunds, and responses
//    - If execution fails, RetryPolicy automatically retries with exponential backoff
//    - Memory is updated with this interaction for future use
// 3. return node: Prepares final response
// 4. Graph returns: Context-aware response that references previous interactions
//
// 🎯 BENEFITS OF MEMORY + RETRY:
// - Context Awareness: Agent remembers previous interactions and can provide more relevant responses
// - Resilience: Automatic retry handles transient failures (rate limits, network issues)
// - Continuity: Users can refer to previous results without repeating themselves
// - Reduced Hallucination: Memory provides grounding in actual conversation history
// - Better UX: More natural, conversational interactions
//
// ⚠️ CONSIDERATIONS:
// - Memory Size: BufferMemory grows with each interaction (consider eviction policies)
// - Retry Masking: Too many retries can mask real bugs - monitor failure patterns
// - State Management: Memory state needs to be managed across multiple graph invocations
