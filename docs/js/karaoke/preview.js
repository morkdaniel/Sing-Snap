let player = null;
let isPreviewing = false;
let currentCard = null;

export const setPlayer = (p) => {
  player = p;
};

export const playSong = async (videoId, card) => {
  if (isPreviewing || !player) return;
  isPreviewing = true;
  currentCard = card;
  card.classList.add("karaoke__card--loading");

  try {
    player.loadVideoById({ videoId, startSeconds: 30, endSeconds: 45 });
    player.playVideo();
    card.classList.remove("karaoke__card--loading");
    card.classList.add("karaoke__card--playing");

    await new Promise(r => setTimeout(r, 8000));
    stopPreview();
  } catch (err) {
    console.error("Preview error", err);
    card.classList.remove("karaoke__card--loading");
    isPreviewing = false;
    currentCard = null;
  }
};

export const stopPreview = () => {
  if (!isPreviewing || !player) return;
  player.stopVideo();
  if (currentCard) currentCard.classList.remove("karaoke__card--playing");
  isPreviewing = false;
  currentCard = null;
};
