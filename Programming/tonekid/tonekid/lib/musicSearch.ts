export interface ITunesTrack {
  id: string;
  song: string;
  artist: string;
  album: string;
  year?: string;
  artworkUrl: string;
}

interface ITunesRawTrack {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName?: string;
  releaseDate?: string;
  artworkUrl100?: string;
}

interface ITunesResponse {
  resultCount: number;
  results: ITunesRawTrack[];
}

const upgradeArtwork = (url: string | undefined, size = 400): string => {
  if (!url) return '';
  return url.replace('100x100bb', `${size}x${size}bb`);
};

const cache = new Map<string, ITunesTrack[]>();

export async function searchSongs(
  query: string,
  options: { limit?: number; signal?: AbortSignal } = {}
): Promise<ITunesTrack[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const limit = options.limit ?? 25;
  const cacheKey = `${trimmed.toLowerCase()}::${limit}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey)!;

  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(trimmed)}&entity=song&limit=${limit}&media=music`;
  const res = await fetch(url, { signal: options.signal });
  if (!res.ok) throw new Error(`iTunes search failed (${res.status})`);
  const data = (await res.json()) as ITunesResponse;

  const tracks: ITunesTrack[] = data.results.map((r) => ({
    id: String(r.trackId),
    song: r.trackName,
    artist: r.artistName,
    album: r.collectionName ?? '',
    year: r.releaseDate ? r.releaseDate.slice(0, 4) : undefined,
    artworkUrl: upgradeArtwork(r.artworkUrl100, 400),
  }));

  cache.set(cacheKey, tracks);
  return tracks;
}
