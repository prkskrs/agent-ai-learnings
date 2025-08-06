// Concept: Agent = ReAct + Functions; we’ll add a function call to the model prompt.
import OpenAI from 'openai';
import 'dotenv/config';
import { searchBooks } from '../lib/googleBooks';
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const functions = [
  {
    name: 'searchBooks',
    description: 'Search Google Books',
    parameters: {
      type: 'object',
      properties: { query: { type: 'string' } },
      required: ['query'],
    },
  },
];

const user = 'I need some book for my kids alphabet learning';
const chat = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [{ role: 'user', content: user }],
  functions,
});

if (chat.choices[0].message.function_call) {
  const { query } = JSON.parse(chat.choices[0].message.function_call.arguments);
  const books = await searchBooks(query);
  console.log('books: ', books);
}

// CHAT RESPONSE EXAMPLE:
// console.log('chat: ', JSON.stringify(chat, null, 2));
// chat:  {
//     "id": "chatcmpl-C1fp05vQUl6LydQtG5TKXq0hBrnHc",
//     "object": "chat.completion",
//     "created": 1754515126,
//     "model": "gpt-4o-mini-2024-07-18",
//     "choices": [
//       {
//         "index": 0,
//         "message": {
//           "role": "assistant",
//           "content": null,
//           "function_call": {
//             "name": "searchBooks",
//             "arguments": "{\"query\":\"alphabet learning for kids\"}"
//           },
//           "refusal": null,
//           "annotations": []
//         },
//         "logprobs": null,
//         "finish_reason": "function_call"
//       }
//     ],
//     "usage": {
//       "prompt_tokens": 50,
//       "completion_tokens": 17,
//       "total_tokens": 67,
//       "prompt_tokens_details": {
//         "cached_tokens": 0,
//         "audio_tokens": 0
//       },
//       "completion_tokens_details": {
//         "reasoning_tokens": 0,
//         "audio_tokens": 0,
//         "accepted_prediction_tokens": 0,
//         "rejected_prediction_tokens": 0
//       }
//     },
//     "service_tier": "default",
//     "system_fingerprint": "fp_34a54ae93c"
//   }
