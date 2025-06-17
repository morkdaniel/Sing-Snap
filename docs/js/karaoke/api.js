const API_KEY = "AIzaSyBM0n0yn-dzvgwTqcpCIorkNossWUFZXlQ";

const queryCache = new Map();

const saveToCache = (query, data) => {
  localStorage.setItem(`ytcache:${query}`, JSON.stringify(data));
};

const loadFromCache = (query) => {
  const raw = localStorage.getItem(`ytcache:${query}`);
  return raw ? JSON.parse(raw) : null;
};

export const fetchSongsFromYouTube = async (queries) => {
  let allSongs = [];

  for (const query of queries) {
    const cacheKey = query.toLowerCase().trim();

    // 1. Check in-memory cache
    if (queryCache.has(cacheKey)) {
      allSongs.push(...queryCache.get(cacheKey));
      continue;
    }

    // 2. Check localStorage
    const cached = loadFromCache(cacheKey);
    if (cached) {
      queryCache.set(cacheKey, cached);
      allSongs.push(...cached);
      continue;
    }

    // 3. Fetch from YouTube
    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query + ' karaoke')}&type=video&videoEmbeddable=true&maxResults=8&key=${API_KEY}`;
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`Failed fetch for "${query}"`, await response.text());
        continue;
      }

      const data = await response.json();
      const items = data.items || [];
      queryCache.set(cacheKey, items);
      saveToCache(cacheKey, items);
      allSongs.push(...items);
    } catch (err) {
      console.error(`Query failed for "${query}":`, err);
    }
  }

  return allSongs;
};

export const processSongs = (rawItems) => {
  const seenTitles = new Set();

  return rawItems
    .map(item => {
      const rawTitle = item.snippet.title;

      // Remove karaoke/lyrics/offical/etc
      let cleanTitle = rawTitle.replace(/\s*(\(|\[)?(karaoke|lyrics|official|HD|video).*$/gi, '').trim();

      let artist = "Various Artists";
      if (cleanTitle.includes(' - ')) {
        const parts = cleanTitle.split(' - ');
        artist = parts[0].trim();
        cleanTitle = parts.slice(1).join(' - ').trim();
      }

      const normalizedTitle = cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, '');

      return {
        title: cleanTitle,
        artist,
        videoId: item.id.videoId,
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url,
        originalTitle: rawTitle,
        normalizedTitle
      };
    })
    // Only keep songs with "karaoke" in original title
    .filter(song => /karaoke/i.test(song.originalTitle))

    // Deduplicate by normalized title
    .filter(song => {
      if (seenTitles.has(song.normalizedTitle)) return false;
      seenTitles.add(song.normalizedTitle);
      return true;
    });
};
