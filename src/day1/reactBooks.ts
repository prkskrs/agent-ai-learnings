// Concept: ReAct = Reason → Act loop inside the model prompt; we'll stub the model with plain code first.
import fetch from 'node-fetch';
import readline from 'readline/promises';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function searchBooks(query: string) {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
    query,
  )}&maxResults=5&key=${process.env.GOOGLE_API_KEY}`;
  console.log(process.env.GOOGLE_API_KEY);
  console.log(url);
  const res = await fetch(url);
  const data = (await res.json()) as {
    items: {
      volumeInfo: { title: string; authors: string[]; infoLink: string };
    }[];
  };
  return (data.items ?? []).map((b: any) => ({
    title: b.volumeInfo.title,
    authors: b.volumeInfo.authors,
    link: b.volumeInfo.infoLink,
  }));
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const q = await rl.question('📖 Ask about a book: ');
console.log('🤔 Reasoning: I should call Google Books…');
const hits = await searchBooks(q);
console.log('🏃 Acting result:\n', hits);
rl.close();
