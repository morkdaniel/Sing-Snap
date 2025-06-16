import { fetchSongsFromYouTube, processSongs } from './api.js';
import { renderSongs } from './dom.js';
import { onYouTubeIframeAPIReady, loadYouTubeAPI } from './player-init.js';

const searchInput = document.getElementById('songSearch');
const container = document.getElementById('karaokeSongList');

const queries = ["karaoke trending", "karaoke 2024", "best karaoke hits"];

let songs = [];

window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

window.addEventListener('load', async () => {
  container.innerHTML = 'Loading songs...';
  loadYouTubeAPI();
  const rawSongs = await fetchSongsFromYouTube(queries);
  songs = processSongs(rawSongs);
  renderSongs(songs, container);
});

searchInput.addEventListener('input', (e) => {
  const term = e.target.value.toLowerCase();
  const filtered = songs.filter(song =>
    song.title.toLowerCase().includes(term) ||
    song.artist.toLowerCase().includes(term)
  );
  renderSongs(filtered, container);
});
