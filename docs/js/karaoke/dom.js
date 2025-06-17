import { playSong } from "./preview.js";

export const renderSongs = (songList, container) => {
  container.innerHTML = '';

  if (songList.length === 0) {
    container.innerHTML = `<div class="karaoke__no-results">No songs found.</div>`;
    return;
  }

  songList.forEach((song, i) => {
    const card = document.createElement('div');
    card.className = 'karaoke__card';
    card.style.animationDelay = `${i * 0.05}s`;
    card.dataset.videoId = song.videoId;

    card.innerHTML = `
  <img src="${song.thumbnail}" class="karaoke__card-image" />
  <div class="karaoke__card-info">
    <span class="karaoke__card-title">${song.title}</span>
    <span class="karaoke__card-artist">${song.artist}</span>
    <div class="karaoke__card-controls">
      <button class="karaoke__control-btn karaoke__play-btn">▶ Play</button>
    </div>
  </div>
  <div class="karaoke__card-preview-indicator"><div class="preview-loader"></div></div>
`;

    const playBtn = card.querySelector('.karaoke__play-btn');
playBtn.addEventListener('click', () => {
  const url = `player.html?videoId=${song.videoId}&title=${encodeURIComponent(song.title)}`;
  window.location.href = url;
});



    card.addEventListener('mouseenter', () => {
      card.classList.add('karaoke__card--hovering');
    });
    card.addEventListener('mouseleave', () => {
      card.classList.remove('karaoke__card--hovering');
    });

    container.appendChild(card);
  });
};
