document.addEventListener("DOMContentLoaded", () => {
  const photoStrip = document.getElementById("photostripPreview");
  const stripColorInput = document.getElementById("stripColor");
  const countSelect = document.getElementById("photoCountSelect");
  const savedPhotos = JSON.parse(sessionStorage.getItem("snapshots") || "[]");

  function resetStyles() {
    photoStrip.style.display = "";
    photoStrip.style.flexDirection = "";
    photoStrip.style.justifyContent = "";
    photoStrip.style.alignItems = "";
    photoStrip.style.marginBottom = "";
    photoStrip.style.height = "";
    photoStrip.style.width = "";
  }

  function applyTemplate() {
    resetStyles();
    photoStrip.innerHTML = "";

    if (savedPhotos.length === 0) {
      photoStrip.innerHTML = "<p>No photos yet. Go snap some!</p>";
      return;
    }

    const selectedCount = Math.min(savedPhotos.length, parseInt(countSelect?.value || 4));
    const photosToRender = savedPhotos.slice(0, selectedCount);

    photoStrip.style.display = "flex";
    photoStrip.style.flexDirection = "column";
    photoStrip.style.alignItems = "center";
    photoStrip.style.justifyContent = "space-evenly";
    photoStrip.style.height = "600px";
    photoStrip.style.width = "200px";
    photoStrip.style.marginBottom = "2rem";

    photosToRender.forEach((dataUrl, index) => {
      const container = document.createElement("div");
      container.className = "photo__container";

      const img = document.createElement("img");
      img.src = dataUrl;
      img.alt = `Snapshot ${index + 1}`;
      img.className = "photostrip__photo";
      img.style.width = "100%";
      img.style.height = `${500 / selectedCount}px`;
      img.style.objectFit = "cover";

      container.appendChild(img);
      photoStrip.appendChild(container);
    });

    addSingAndSnapLabel();
  }

function addSingAndSnapLabel() {
  const existing = photoStrip.querySelector(".photostrip__label");
  if (existing) existing.remove();

  const label = document.createElement("div");
  label.className = "photostrip__label";
  label.textContent = "Sing&Snap";

  label.style.position = "absolute";               // Anchor to bottom
  label.style.bottom = "0";
  label.style.left = "0";
  label.style.width = "100%";
  label.style.textAlign = "center";
  label.style.padding = "10px 0";
  label.style.fontWeight = "700";                  // Bold
  label.style.fontSize = "1.2rem";
  label.style.fontFamily = '"Poppins", sans-serif';
  label.style.color = "#fff";
  label.style.borderTop = "2px solid #fff";
  label.style.borderRadius = "0 0 10px 10px";
  label.style.letterSpacing = "0.5px";
  label.style.zIndex = "10";

  photoStrip.style.position = "relative"; // Make sure parent is positioned

  photoStrip.appendChild(label);
}


  // Export Functions
  window.exportAsImage = async function () {
    addSingAndSnapLabel();
    const canvas = await html2canvas(photoStrip);
    const dataUrl = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "sing-and-snap-strip.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  window.exportAsPDF = async function () {
    addSingAndSnapLabel();
    const canvas = await html2canvas(photoStrip);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new window.jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [canvas.width, canvas.height]
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save("sing-and-snap-strip.pdf");
  };

  window.shareStrip = async function () {
    addSingAndSnapLabel();
    const canvas = await html2canvas(photoStrip);
    canvas.toBlob(async (blob) => {
      const url = URL.createObjectURL(blob);
      await navigator.clipboard.writeText(url);
      alert("Shareable link copied to clipboard!");
    }, "image/png");
  };

  // Color picker
  stripColorInput?.addEventListener("input", (e) => {
    photoStrip.style.backgroundColor = e.target.value;
  });

  document.querySelectorAll(".color__circle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const selectedColor = btn.getAttribute("data-color");
      photoStrip.style.backgroundColor = selectedColor;
    });
  });

  // Download all photos
  window.downloadAll = function () {
    savedPhotos.forEach((dataUrl, index) => {
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `photo_${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  // Clear photos
  window.clearPhotos = function () {
    if (confirm("Are you sure you want to delete all photos?")) {
      sessionStorage.removeItem("snapshots");
      location.reload();
    }
  };

  // Update preview on count select change
  countSelect?.addEventListener("change", () => {
    applyTemplate();
  });

  // Initial render
  applyTemplate();
});
