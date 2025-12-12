let docs = [];

// Fetch docs from backend and display on page
async function loadDocs() {
  const container = document.getElementById("docs-container");
  container.innerHTML = "<p>Loading documentation...</p>";

  try {
    const res = await fetch("/docs");
    docs = await res.json();
    renderDocs();
  } catch (error) {
    console.error("Error loading documentation:", error);
    container.innerHTML = "<p>Error loading documentation.</p>";
  }
}