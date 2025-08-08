// src/day4/graph.ts
//
// 🏗️ GRAPH-BASED AGENT EXECUTION
// This file demonstrates how to create a workflow graph that orchestrates
// the execution of an AI agent using LangGraph's StateGraph.
//
// CONCEPT: Instead of calling the agent directly, we create a graph with nodes
// that can process, transform, and route data through different stages.
// This allows for more complex workflows, error handling, and data transformation.

import { StateGraph, Annotation } from '@langchain/langgraph';
import { agentExecutor } from '../day3/executor';

// 📊 SHARED STATE DEFINITION
// This defines the data structure that flows through our graph
// Each node can read from and write to specific parts of this state
const GraphState = Annotation.Root({
  input: Annotation<string>(), // User's original input (e.g., "search for Harry Potter books")
  agentOut: Annotation<string>(), // Agent's processed output (e.g., JSON string of book results)
});
type GS = typeof GraphState.State; // TypeScript type for our state

// 🚀 BUILD THE EXECUTION GRAPH
// This creates a workflow that processes user input through multiple stages
export const agentGraph = new StateGraph(GraphState)

  // 📥 NODE 1: Echo Input Node
  // Purpose: Preserves the original user input for later use
  // Example: If user says "search for Harry Potter", this node ensures
  //          we keep that exact text available throughout the workflow
  .addNode(
    'echoInput',
    (s: GS): Partial<GS> => ({
      input: s.input,
    }),
  )

  // 🤖 NODE 2: Agent Execution Node
  // Purpose: Calls the Day-3 agent with the user input and captures the response
  // This is where the actual AI processing happens using the tools we defined
  // Example:
  //   Input: "search for Harry Potter books and refund payment pi_123"
  //   Agent will:
  //   1. Use booksTool to search for Harry Potter books
  //   2. Use refundTool to process the refund
  //   3. Combine both results into a comprehensive response
  .addNode(
    'callAgent',
    async (s: GS): Promise<Partial<GS>> => ({
      agentOut: (await agentExecutor.invoke({ input: s.input }))
        .output as string,
    }),
  )

  // 📤 NODE 3: Return Node
  // Purpose: Prepares the final output for the user
  // This node could be extended to format, validate, or transform the agent's response
  // Example: Could add formatting, error handling, or response validation here
  .addNode(
    'return',
    (s: GS): Partial<GS> => ({
      agentOut: s.agentOut,
    }),
  )

  // 🔗 WIRE THE FLOW - Define the execution sequence
  // This creates a linear pipeline: start → echoInput → callAgent → return → end
  .addEdge('__start__', 'echoInput') // Graph starts with echoInput node
  .addEdge('echoInput', 'callAgent') // Then flows to agent execution
  .addEdge('callAgent', 'return') // Then to return preparation
  .addEdge('return', '__end__') // Finally ends the graph execution

  // ⚙️ COMPILE INTO EXECUTABLE
  // This converts our graph definition into a runnable workflow
  // The compiled graph can be invoked with input and will execute all nodes in sequence
  .compile();

// 💡 USAGE EXAMPLE:
//
// const result = await agentGraph.invoke({
//   input: "Search for Harry Potter books and refund payment pi_3RCL7YEWqBMHeCvg1cxqxmDw"
// });
//
// EXECUTION FLOW:
// 1. echoInput node: Preserves "Search for Harry Potter books and refund payment pi_3RCL7YEWqBMHeCvg1cxqxmDw"
// 2. callAgent node:
//    - Agent analyzes the request
//    - Calls booksTool with query "Harry Potter"
//    - Calls refundTool with paymentIntentId "pi_3RCL7YEWqBMHeCvg1cxqxmDw"
//    - Combines results into comprehensive response
// 3. return node: Prepares final response for user
// 4. Graph returns: "I found these Harry Potter books: [book list] and successfully processed your refund..."
//
// 🎯 BENEFITS OF THIS GRAPH APPROACH:
// - Modular: Each node has a single responsibility
// - Extensible: Easy to add new nodes for logging, validation, formatting
// - Observable: Can track data flow through each stage
// - Testable: Each node can be tested independently
// - Reusable: Graph can be used with different inputs
