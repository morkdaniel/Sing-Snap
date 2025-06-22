// 📌 DOM references
const stripCountSelect = document.getElementById("stripCount");
const setupPreview = document.getElementById("setupPreview");
const startBoothButton = document.getElementById("startBooth");

// 🖼️ Load SVG template into preview
async function updateVisualPreview() {
  const selectedOption = stripCountSelect.selectedOptions[0];
  const svgPath = selectedOption.value;
  const count = parseInt(selectedOption.dataset.count, 10);

  try {
    setupPreview.classList.add("fade-out");

    const res = await fetch(svgPath);
    const svgText = await res.text();

    setTimeout(() => {
      setupPreview.innerHTML = svgText;
      setupPreview.classList.remove("fade-out");
    }, 300);
  } catch (e) {
    setupPreview.innerHTML = '<p style="color:red;">Failed to load SVG preview</p>';
    console.error("SVG Load Error:", e);
  }
}

// 👂 Update preview when dropdown changes
stripCountSelect.addEventListener("change", updateVisualPreview);

// 🚀 Save selection + go to photobooth capture page
startBoothButton.addEventListener("click", () => {
  const selectedOption = stripCountSelect.selectedOptions[0];

  const svgPath = selectedOption.value;
  const count = parseInt(selectedOption.dataset.count, 10);

  // Save to sessionStorage so capture page can load it
  sessionStorage.setItem("stripLayout", JSON.stringify({ svgPath, count }));

  // Redirect to capture page
  window.location.href = "photobooth-capture.html";
});

// 🔄 Initial preview on page load
updateVisualPreview();
