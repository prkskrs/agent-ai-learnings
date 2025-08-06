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

export { searchBooks };
