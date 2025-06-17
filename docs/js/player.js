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

function setupSnapshot() {
  const snapBtn = document.getElementById("snapBtn");
  const video = document.getElementById("camera");
  const photoStrip = document.getElementById("photoStrip");
  const counter = document.getElementById("snapCounter");

  let snapshots = JSON.parse(sessionStorage.getItem("snapshots") || "[]");

  snapBtn.addEventListener("click", () => {
    if (snapshots.length >= 4) {
      alert("You’ve already taken 4 photos.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.translate(canvas.width, 0); // Mirror
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imgData = canvas.toDataURL("image/png");
    snapshots.push(imgData);
    sessionStorage.setItem("snapshots", JSON.stringify(snapshots));

    const img = document.createElement("img");
    img.src = imgData;
    img.alt = "Snapshot";
    img.className = "photo-preview";
    photoStrip.appendChild(img);

    counter.textContent = `Photos taken: ${snapshots.length} / 3`;
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
  setupSnapshot(); // no need to pass videoId anymore
  setupPhotostripViewButton();
} else {
  alert("No song selected!");
}
