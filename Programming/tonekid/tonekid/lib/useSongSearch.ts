import { useEffect, useRef, useState } from 'react';

import { searchSongs, type ITunesTrack } from './musicSearch';

interface State {
  loading: boolean;
  error?: string;
  results: ITunesTrack[];
}

export function useSongSearch(query: string, delayMs = 350): State {
  const [state, setState] = useState<State>({ loading: false, results: [] });
  const lastQuery = useRef('');

  useEffect(() => {
    const trimmed = query.trim();
    lastQuery.current = trimmed;

    if (trimmed.length < 2) {
      setState({ loading: false, results: [] });
      return;
    }

    const controller = new AbortController();
    const handle = setTimeout(async () => {
      setState((s) => ({ ...s, loading: true, error: undefined }));
      try {
        const results = await searchSongs(trimmed, { signal: controller.signal });
        if (lastQuery.current !== trimmed) return; // stale
        setState({ loading: false, results });
      } catch (e) {
        if (controller.signal.aborted) return;
        setState({
          loading: false,
          results: [],
          error: e instanceof Error ? e.message : 'Search failed',
        });
      }
    }, delayMs);

    return () => {
      controller.abort();
      clearTimeout(handle);
    };
  }, [query, delayMs]);

  return state;
}
