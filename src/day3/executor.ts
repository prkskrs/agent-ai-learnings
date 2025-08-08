// Concept: Executor = Agent + Tools; we'll add a tool to the model prompt.
// This file demonstrates how to create an AI agent that can use multiple tools
// to perform real-world tasks like searching books and processing refunds.

import { ChatOpenAI } from '@langchain/openai';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { createToolCallingAgent, AgentExecutor } from 'langchain/agents';
import Stripe from 'stripe';
import { searchBooks } from '../lib/googleBooks.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize the LLM (Language Model) - this is the "brain" of our agent
// We use GPT-4o-mini for cost efficiency and set temperature to 0 for consistent outputs
const llm = new ChatOpenAI({
  modelName: 'gpt-4o-mini',
  temperature: 0,
});

// 🛠️ TOOL 1: Google Books Search Tool
// This tool allows the agent to search for books using the Google Books API
// Tools are functions that the agent can call to perform specific tasks
const booksTool = tool(
  // The actual function that gets executed when the tool is called
  async (input: unknown) => {
    const { query } = input as { query: string };
    const hits = await searchBooks(query);
    // ✅ Return *string*, not array/object - LLMs work better with string inputs
    return JSON.stringify(hits, null, 2);
  },
  {
    name: 'searchBooks',
    description: 'Google Books search',
    // Schema defines what parameters the tool expects
    schema: z.object({
      query: z.string(),
    }),
  },
);

// 🛠️ TOOL 2: Stripe Refund Tool
// This tool allows the agent to process refunds through Stripe
// Demonstrates how agents can interact with external APIs and services
const refundTool = tool(
  // The actual function that gets executed when the tool is called
  async (input: unknown) => {
    const { paymentIntentId } = input as { paymentIntentId: string };
    console.log('input: ', { paymentIntentId });

    // Initialize Stripe with API key from environment variables
    const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
      apiVersion: '2025-07-30.basil',
    });

    console.log('paymentIntentId: ', paymentIntentId);

    // Process the refund through Stripe API
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
    });

    // ✅ Return stringified result for the LLM to process
    return JSON.stringify(refund, null, 2);
  },
  {
    name: 'refundPayment',
    description: 'Refund a Stripe payment intent',
    // Schema defines what parameters the tool expects
    schema: z.object({
      paymentIntentId: z.string(),
    }),
  },
);

// 📦 Combine all tools into an array
// The agent will have access to all these tools and can choose which ones to use
const tools = [booksTool, refundTool];

// 🧠 PROMPT TEMPLATE
// This defines how the agent "thinks" and responds
// The prompt includes placeholders for conversation history and agent reasoning
const prompt = ChatPromptTemplate.fromMessages([
  ['system', 'You are a helpful assistant'],
  ['placeholder', '{chat_history}'], // Previous conversation context
  ['human', '{input}'], // Current user input
  ['placeholder', '{agent_scratchpad}'], // Agent's internal reasoning
]);

// 1️⃣ Build the "brain" - create the agent
// This combines the LLM, tools, and prompt into a single agent
// The agent can now:
// - Understand user requests
// - Decide which tools to use
// - Execute tools with appropriate parameters
// - Provide responses based on tool results
const agent = await createToolCallingAgent({
  llm,
  tools,
  prompt,
});

// 2️⃣ Wrap it in the classic loop (optional)
// AgentExecutor adds additional functionality like:
// - Error handling
// - Retry logic
// - Detailed logging (verbose: true)
// - Intermediate step tracking (returnIntermediateSteps: true)
const agentExecutor = AgentExecutor.fromAgentAndTools({
  agent,
  tools,
  verbose: true, // Shows detailed execution steps
  returnIntermediateSteps: true, // Returns all steps taken
});

// 🚀 EXECUTION EXAMPLE
// Let's see how this works with a complex request that requires multiple tools
const res = await agentExecutor.invoke({
  input: 'Cancel order pi_3RCL7YEWqBMHeCvg1cxqxmDw and suggest similar novels',
});

// 📋 HOW THE FLOW WORKS:
// 1. User sends request: "Cancel order pi_3RCL7YEWqBMHeCvg1cxqxmDw and suggest similar novels"
// 2. Agent analyzes the request and identifies two tasks:
//    - Cancel/refund the payment (requires refundTool)
//    - Suggest similar novels (requires booksTool)
// 3. Agent decides to process the refund first
// 4. Agent calls refundTool with paymentIntentId: "pi_3RCL7YEWqBMHeCvg1cxqxmDw"
// 5. refundTool executes and returns refund result
// 6. Agent processes refund result and decides to suggest novels
// 7. Agent calls booksTool with query: "similar novels" or "recommended books"
// 8. booksTool executes and returns book search results
// 9. Agent combines both results into a comprehensive response
// 10. Final response includes refund confirmation and book suggestions

// 💡 EXAMPLE OUTPUT:
// "I've successfully processed the refund for payment pi_3RCL7YEWqBMHeCvg1cxqxmDw.
// The refund has been initiated and you should see the credit in 5-10 business days.
//
// Here are some similar novels you might enjoy:
// - "The Great Gatsby" by F. Scott Fitzgerald
// - "To Kill a Mockingbird" by Harper Lee
// - "1984" by George Orwell
// ..."

console.log('Agent Response:', res);

export { agentExecutor };
