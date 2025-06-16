function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    videoId: params.get("videoId"),
    title: params.get("title")
  };
}

function loadPlayer(videoId, title) {
  const iframe = document.getElementById("youtubePlayer");
  const songTitle = document.getElementById("songTitle");

  songTitle.textContent = `Now Singing: ${decodeURIComponent(title)}`;
  iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
}

function setupCamera() {
  const video = document.getElementById("camera");

  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      video.srcObject = stream;
    })
    .catch((err) => {
      console.error("Camera error:", err);
      alert("Cannot access camera. Please allow permission.");
    });
}

function setupSnapshot(videoId) {
  const snapBtn = document.getElementById("snapBtn");
  const video = document.getElementById("camera");
  const photoStrip = document.getElementById("photoStrip");

  snapBtn.addEventListener("click", () => {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imgData = canvas.toDataURL("image/png");

    // Save per song ID
    const songKey = `snapshots_${videoId}`;
    let snapshots = JSON.parse(localStorage.getItem(songKey) || "[]");

    if (snapshots.length >= 3) {
      alert("You’ve already taken 3 photos for this song.");
      return;
    }

    snapshots.push(imgData);
    localStorage.setItem(songKey, JSON.stringify(snapshots));

    // Optional live preview
    const img = document.createElement("img");
    img.src = imgData;
    img.alt = "Snapshot";
    img.className = "photo-preview";

    photoStrip.appendChild(img);
  });
}


function setupPhotostripViewButton() {
  const viewBtn = document.getElementById("viewPhotostripBtn");
  if (viewBtn) {
    viewBtn.addEventListener("click", () => {
      window.location.href = "photostrip.html";
    });
  }
}

// Init all
const { videoId, title } = getQueryParams();

if (videoId) {
  loadPlayer(videoId, title);
  setupCamera();
  setupSnapshot(videoId);
  setupPhotostripViewButton();
} else {
  alert("No song selected!");
}
