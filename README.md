# Agentic AI

Make smart AI agents, one small step each day. This repo is your simple guide from a single API call to scalable, memory-powered agent workflows.

## What you will learn
- Day 1: ReAct basics — think, act, observe
- Day 2: Function calling — let the model choose your tools
- Day 3: Multi‑tool agents — real tasks with LangChain tools
- Day 4: Graphs — orchestrate workflows with state
- Day 5: Memory & scale — conversations that remember, with user isolation

## Quick start
```bash
# 1) Install
npm i
# or: yarn

# 2) Set your env vars (see .env.example)
cp .env.example .env
# Fill in at least OPENAI_API_KEY (and optionally GOOGLE_API_KEY, STRIPE_API_KEY)

# 3) Run day demos
npm run day1
npm run day2
npm run day3
npm run day4
npm run day5
npm run day5:test
npm run day5:scalable
```

## Day by day

### Day 1 — ReAct pattern (manual loop)
File: `src/day1/reactBooks.ts`
- You type a query
- Code “reasons” (prints plan) and “acts” (calls Google Books)
- You see raw results

Why it matters:
- Clear mental model of Reason → Act → Observe
- Great for learning; limited for real apps

Run: `npm run day1`

### Day 2 — Function calling (AI chooses the function)
File: `src/day2/agent.ts`
- Uses OpenAI function calling
- The model picks `searchBooks` and passes clean parameters

Why it matters:
- The AI chooses when/how to use a tool
- Cleaner, less glue code

Run: `npm run day2`

### Day 3 — Multi‑tool agent (real‑world tasks)
File: `src/day3/executor.ts`
- LangChain tools: `searchBooks`, `refundPayment`
- The agent plans, calls tools, and combines results

Why it matters:
- Production-feel agent loop
- Error handling, intermediate steps, and extensibility

Run: `npm run day3`

### Day 4 — Graphs (orchestrate with state)
File: `src/day4/graph.ts`
- Build a `StateGraph` with nodes and edges
- Route data across steps; type‑safe state

Why it matters:
- Modular, testable workflows
- Easy to add logging, validation, formatting nodes

Run: `npm run day4`

### Day 5 — Memory + scalability (context that lasts)
Files: `src/day5/graphWithMemory.ts`, `src/day5/scalableMemory.ts`
- BufferMemory: remembers prior messages
- Per‑user isolation: memory per `userId`
- Optional retries; external stores (Redis/Postgres) ready

Why it matters:
- Conversational UX that remembers
- Ready for many users and horizontal scale

Run: `npm run day5`, `npm run day5:test`, `npm run day5:scalable`

## Environment variables
Create `.env` from `.env.example`:
- `OPENAI_API_KEY` — required (Day 2+)
- `GOOGLE_API_KEY` — optional; improves Google Books quota/results (Day 1/3)
- `STRIPE_API_KEY` — optional; enables refund demo (Day 3)
- `REDIS_URL`, `REDIS_TOKEN` — optional; external memory (Day 5)
- `DATABASE_URL` — optional; Postgres message history (Day 5)

## How this helps you build
- Start small, ship fast: move from a single tool to many tools
- Add structure: graphs make flows observable and testable
- Keep context: memory turns chats into conversations
- Scale safely: per‑user isolation and external stores

## Tips
- No keys in logs: never print secrets
- Prefer returning strings from tools for LLM friendliness
- Keep nodes small: one responsibility per node
- Add retries for flaky APIs; monitor failures

## Repo map
- `src/lib/googleBooks.ts` — Google Books fetcher
- `src/day1` — ReAct basics
- `src/day2` — Function calling with OpenAI
- `src/day3` — Multi‑tool agent with LangChain
- `src/day4` — Graph‑based orchestration
- `src/day5` — Memory + scalability patterns and tests

## License
MIT


