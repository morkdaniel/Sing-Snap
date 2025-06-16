document.addEventListener("DOMContentLoaded", () => {
  const photoStrip = document.getElementById("photostripPreview");
  const stripColorInput = document.getElementById("stripColor");
  const savedPhotos = JSON.parse(localStorage.getItem("snapshots") || "[]");

  if (savedPhotos.length === 0) {
    photoStrip.innerHTML = "<p>No photos yet. Go snap some!</p>";
    return;
  }

  // Limit to 3 photos max
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

  // Change strip background color
  stripColorInput.addEventListener("input", (e) => {
    photoStrip.style.backgroundColor = e.target.value;
  });

  // Add stickers on click
  document.querySelectorAll(".sticker").forEach((sticker) => {
    sticker.addEventListener("click", () => {
      const selected = sticker.cloneNode(true);
      selected.classList.add("sticker--applied");
      // Add to the last photo by default
      const containers = document.querySelectorAll(".photo__container");
      if (containers.length > 0) {
        containers[containers.length - 1].appendChild(selected);
      }
    });
  });

  function downloadAll() {
  const savedPhotos = JSON.parse(localStorage.getItem("snapshots") || "[]");

  savedPhotos.slice(0, 3).forEach((dataUrl, index) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `photo_${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}

function clearPhotos() {
  if (confirm("Are you sure you want to delete all photos?")) {
    localStorage.removeItem("snapshots");
    location.reload();
  }
}

});
