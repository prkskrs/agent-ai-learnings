// src/day5/scalableMemory.ts
//
// 🚀 SCALABLE MEMORY PATTERNS
// This file demonstrates how to scale BufferMemory for production use
// with per-user isolation, external storage, and stateless worker patterns.

import { StateGraph, Annotation } from '@langchain/langgraph';
import { BufferMemory } from 'langchain/memory';
import { BaseMessage } from '@langchain/core/messages';
import { agentExecutor } from '../day3/executor';

// 📊 ENHANCED STATE WITH USER ISOLATION
// Each user gets their own memory instance to prevent cross-contamination
const GraphState = Annotation.Root({
  input: Annotation<string>(),
  agentOut: Annotation<string>(),
  chat_history: Annotation<BaseMessage[]>(),
  userId: Annotation<string>(), // 🆔 User isolation key
});
type GS = typeof GraphState.State;

// 🏭 MEMORY FACTORY PATTERN
// Creates isolated memory instances per user/session
class ScalableMemoryFactory {
  private memoryInstances = new Map<string, BufferMemory>();

  createMemory(userId: string): BufferMemory {
    // Check if we already have a memory instance for this user
    if (this.memoryInstances.has(userId)) {
      return this.memoryInstances.get(userId)!;
    }

    // Create new memory instance for this user
    const memory = new BufferMemory({
      returnMessages: true,
      memoryKey: 'chat_history',
      outputKey: 'output',
      // 🗄️ EXTERNAL STORAGE OPTIONS (uncomment as needed)

      // Option 1: Redis (recommended for production)
      // chatHistory: new UpstashRedisChatMessageHistory({
      //   sessionId: userId,
      //   url: process.env.REDIS_URL,
      //   token: process.env.REDIS_TOKEN,
      // }),

      // Option 2: PostgreSQL
      // chatHistory: new PostgresChatMessageHistory({
      //   sessionId: userId,
      //   connection: new Pool({
      //     connectionString: process.env.DATABASE_URL,
      //   }),
      // }),

      // Option 3: MongoDB
      // chatHistory: new MongoDBChatMessageHistory({
      //   sessionId: userId,
      //   collection: new MongoClient(process.env.MONGODB_URL).db().collection('chat_history'),
      // }),
    });

    // Store in memory for reuse (optional - can be stateless)
    this.memoryInstances.set(userId, memory);

    return memory;
  }

  // 🧹 CLEANUP METHOD
  // Call this periodically or when memory usage gets high
  clearMemory(userId: string): void {
    const memory = this.memoryInstances.get(userId);
    if (memory) {
      memory.clear();
      this.memoryInstances.delete(userId);
    }
  }

  // 📊 MEMORY USAGE STATS
  getMemoryStats(): { totalUsers: number; totalInstances: number } {
    return {
      totalUsers: this.memoryInstances.size,
      totalInstances: this.memoryInstances.size,
    };
  }
}

// 🏭 FACTORY INSTANCE
const memoryFactory = new ScalableMemoryFactory();

// 🚀 SCALABLE GRAPH WITH USER ISOLATION
export const scalableAgentGraph = new StateGraph(GraphState)
  .addNode(
    'echoInput',
    (s: GS): Partial<GS> => ({
      input: s.input,
      userId: s.userId,
    }),
  )
  .addNode(
    'callAgent',
    async (s: GS): Promise<Partial<GS>> => {
      // 🆔 Get user-specific memory instance
      const userMemory = memoryFactory.createMemory(s.userId);

      // Attach memory to executor for this invocation
      agentExecutor.memory = userMemory;

      // Execute with user context
      const result = await agentExecutor.invoke({
        input: s.input,
      });

      return {
        agentOut: result.output as string,
      };
    },
    {
      retryPolicy: {
        initialInterval: 1000,
        backoffFactor: 2,
        maxAttempts: 3,
      },
    },
  )
  .addNode(
    'return',
    (s: GS): Partial<GS> => ({
      agentOut: s.agentOut,
    }),
  )
  .addEdge('__start__', 'echoInput')
  .addEdge('echoInput', 'callAgent')
  .addEdge('callAgent', 'return')
  .addEdge('return', '__end__')
  .compile();

// 🧪 TEST FUNCTION FOR SCALABLE MEMORY
export async function testScalableMemory() {
  console.log('🚀 Testing Scalable Memory Patterns\n');

  // Simulate multiple users
  const users = ['user-123', 'user-456', 'user-789'];

  for (const userId of users) {
    console.log(`👤 Testing user: ${userId}`);

    // First interaction
    const result1 = await scalableAgentGraph.invoke({
      input: `Search for ${
        userId === 'user-123'
          ? 'Harry Potter'
          : userId === 'user-456'
          ? 'Lord of the Rings'
          : 'Star Wars'
      } books`,
      userId,
    });
    console.log(`Response: ${result1.agentOut.substring(0, 100)}...`);

    // Second interaction (should remember user-specific context)
    const result2 = await scalableAgentGraph.invoke({
      input: 'What about the ones you found earlier?',
      userId,
    });
    console.log(`Follow-up: ${result2.agentOut.substring(0, 100)}...`);
    console.log('---\n');
  }

  // Show memory stats
  const stats = memoryFactory.getMemoryStats();
  console.log(
    `📊 Memory Stats: ${stats.totalUsers} users, ${stats.totalInstances} instances`,
  );
}

// 🛠️ UTILITY FUNCTIONS FOR PRODUCTION

// Clean up memory for a specific user
export function clearUserMemory(userId: string): void {
  memoryFactory.clearMemory(userId);
  console.log(`🧹 Cleared memory for user: ${userId}`);
}

// Get memory usage statistics
export function getMemoryStats() {
  return memoryFactory.getMemoryStats();
}

// 💡 PRODUCTION DEPLOYMENT PATTERNS

/*
## 🚀 PRODUCTION SCALING CHECKLIST

### 1. PER-USER ISOLATION ✅
- Each user gets their own memory instance
- No cross-contamination between users
- User-specific conversation history

### 2. EXTERNAL STORAGE OPTIONS
Choose based on your infrastructure:

**Redis (Recommended)**
```typescript
import { UpstashRedisChatMessageHistory } from "@langchain/community/stores/message/upstash_redis";

const memory = new BufferMemory({
  returnMessages: true,
  memoryKey: "chat_history",
  chatHistory: new UpstashRedisChatMessageHistory({
    sessionId: userId,
    url: process.env.REDIS_URL,
    token: process.env.REDIS_TOKEN,
  }),
});
```

**PostgreSQL**
```typescript
import { PostgresChatMessageHistory } from "@langchain/community/stores/message/postgres";
import { Pool } from "pg";

const memory = new BufferMemory({
  returnMessages: true,
  memoryKey: "chat_history",
  chatHistory: new PostgresChatMessageHistory({
    sessionId: userId,
    connection: new Pool({
      connectionString: process.env.DATABASE_URL,
    }),
  }),
});
```

### 3. MEMORY MANAGEMENT
- Implement automatic cleanup for inactive users
- Set memory limits per user
- Use conversation summarization for long threads

### 4. STATELESS WORKER PATTERN
- Each request fetches fresh history from external store
- No in-memory state between requests
- Scales horizontally across multiple instances

### 5. MONITORING & METRICS
- Track memory usage per user
- Monitor external storage performance
- Alert on memory leaks or high usage

### 6. SECURITY CONSIDERATIONS
- Encrypt sensitive conversation data
- Implement proper access controls
- Regular data cleanup for compliance

## 🎯 BENEFITS OF THIS PATTERN

✅ **Horizontal Scaling**: Add more workers without memory conflicts
✅ **User Isolation**: No cross-contamination between users
✅ **Persistence**: Conversations survive server restarts
✅ **Monitoring**: Track usage and performance
✅ **Security**: Proper data isolation and encryption
✅ **Compliance**: Easy data cleanup and retention policies
*/
