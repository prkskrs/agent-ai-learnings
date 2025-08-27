async function searchBooks(query: string) {
  const apiKey = process.env.GOOGLE_API_KEY;
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
    query,
  )}&maxResults=5${apiKey ? `&key=${apiKey}` : ''}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Google Books HTTP ${res.status}`);
    }
    const data = (await res.json()) as {
      items?: {
        volumeInfo?: { title?: string; authors?: string[]; infoLink?: string };
      }[];
    };

    const items = Array.isArray(data.items) ? data.items : [];
    return items
      .filter((b: any) => b && b.volumeInfo)
      .map((b: any) => ({
        title: b.volumeInfo?.title ?? 'Unknown title',
        authors: b.volumeInfo?.authors ?? [],
        link: b.volumeInfo?.infoLink ?? '',
      }));
  } catch (err) {
    console.error('Failed to fetch books:', (err as Error).message);
    return [];
  }
}

export { searchBooks };
