import { setPlayer } from './preview.js';

let player = null;

export const onYouTubeIframeAPIReady = () => {
  player = new YT.Player('player', {
    height: '0',
    width: '0',
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      modestbranding: 1,
      rel: 0
    },
    events: {
  onReady: () => {
    console.log("Player ready");
    player.setVolume(0);
    setPlayer(player);
  },
  onStateChange: (event) => {
    if (event.data === YT.PlayerState.ENDED) {
      stopPreview();
    }
  },
  onError: (error) => {
    console.error("YouTube Embed Error:", error);
    alert("This video cannot be played. Please try another one.");
    window.location.href = "karaoke.html";
  }
}

  });
};

export const loadYouTubeAPI = () => {
  const script = document.createElement('script');
  script.src = 'https://www.youtube.com/iframe_api';
  script.async = true;
  document.body.appendChild(script);
};
