document.addEventListener("DOMContentLoaded", () => {
  const photoStrip = document.getElementById("photostripPreview");
  const stripColorInput = document.getElementById("stripColor");

  // Get the videoId from the URL
  const params = new URLSearchParams(window.location.search);
  const videoId = params.get("videoId");
  const storageKey = `snapshots_${videoId}`;
  const savedPhotos = JSON.parse(localStorage.getItem(storageKey) || "[]");

  if (savedPhotos.length === 0) {
    photoStrip.innerHTML = "<p>No photos yet. Go snap some!</p>";
    return;
  }

  // Limit to 3 photos max and display
  savedPhotos.slice(0, 3).forEach((dataUrl, index) => {
    const container = document.createElement("div");
    container.className = "photo__container";

    const img = document.createElement("img");
    img.src = dataUrl;
    img.alt = `Snapshot ${index + 1}`;
    img.className = "photostrip__photo";

    container.appendChild(img);
    photoStrip.appendChild(container);
  });

  // Color strip background
  stripColorInput.addEventListener("input", (e) => {
    photoStrip.style.backgroundColor = e.target.value;
  });

  // Apply stickers
  document.querySelectorAll(".sticker").forEach((sticker) => {
    sticker.addEventListener("click", () => {
      const selected = sticker.cloneNode(true);
      selected.classList.add("sticker--applied");
      const containers = document.querySelectorAll(".photo__container");
      if (containers.length > 0) {
        containers[containers.length - 1].appendChild(selected);
      }
    });
  });

  // Download button
  window.downloadAll = function () {
    savedPhotos.slice(0, 3).forEach((dataUrl, index) => {
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `photo_${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  // Clear button
  window.clearPhotos = function () {
    if (confirm("Are you sure you want to delete all photos for this song?")) {
      localStorage.removeItem(storageKey);
      location.reload();
    }
  };
});
