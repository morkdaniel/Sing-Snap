import { fetchSongsFromYouTube, processSongs } from './api.js';
import { renderSongs } from './dom.js';
import { onYouTubeIframeAPIReady, loadYouTubeAPI } from './player-init.js';

const searchInput = document.getElementById('songSearch');
const searchBtn = document.getElementById('songSearchBtn');
const container = document.getElementById('karaokeSongList');

const defaultQueries = ["karaoke trending", "karaoke 2024", "best karaoke hits"];
let songs = [];

window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

window.addEventListener('load', async () => {
  container.innerHTML = 'Loading songs...';
  loadYouTubeAPI();
  const rawSongs = await fetchSongsFromYouTube(defaultQueries);
  songs = processSongs(rawSongs);
  renderSongs(songs, container);
});

// 🔍 Click Search
searchBtn.addEventListener('click', async () => {
  const query = searchInput.value.trim().toLowerCase();
  if (query.length < 2) {
    renderSongs(songs, container);
    return;
  }

  container.innerHTML = 'Searching...';

  // ✅ Check localStorage cache
  const cacheKey = `karaoke_${query}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    const results = JSON.parse(cached);
    renderSongs(results, container);
    console.log(`Loaded from cache: "${query}"`);
    return;
  }

  // ❌ Not cached — fetch from API
  try {
    const raw = await fetchSongsFromYouTube([query]);
    const results = processSongs(raw);
    renderSongs(results, container);

    // 💾 Cache the results
    localStorage.setItem(cacheKey, JSON.stringify(results));
  } catch (err) {
    container.innerHTML = '❌ Failed to load results.';
    console.error('Search failed:', err);
  }
});

// ⏎ Press Enter to Search
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    searchBtn.click();
  }
});

// 🔙 Back Button Functionality
const backBtn = document.getElementById('goBackBtn');
if (backBtn) {
  backBtn.addEventListener('click', () => {
    window.history.back();
  });
}

