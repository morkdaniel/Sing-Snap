const API_KEY = "AIzaSyAlQNx7FFzdOUS8Eker6YDaY6IuS43iZ0g";

export const fetchSongsFromYouTube = async (queries) => {
  let allSongs = [];

  for (const query of queries) {
    try {
      const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=20&type=video&key=${API_KEY}`);
      if (!response.ok) continue;
      const data = await response.json();
      allSongs.push(...data.items);
    } catch (err) {
      console.error(`Query failed for "${query}":`, err);
    }
  }

  return allSongs;
};

export const processSongs = (rawItems) => {
  return rawItems
    .map(item => {
      let title = item.snippet.title.replace(/\s*(\(|\[)?(karaoke|lyrics|official).*$/gi, '').trim();
      let artist = "Various Artists";
      if (title.includes(' - ')) {
        const parts = title.split(' - ');
        artist = parts[0].trim();
        title = parts.slice(1).join(' - ').trim();
      }
      return {
        title,
        artist,
        videoId: item.id.videoId,
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url,
        originalTitle: item.snippet.title
      };
    })
    .filter((song, index, self) =>
      index === self.findIndex(s =>
        s.title.toLowerCase().replace(/[^a-z0-9]/g, '') ===
        song.title.toLowerCase().replace(/[^a-z0-9]/g, '')
      )
    )
    .slice(0, 8);
};
