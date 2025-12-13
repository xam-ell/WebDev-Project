let docs = []

async function loadDocs() {
  const container = document.getElementById("docs-container")
  container.innerHTML = "<p>Loading documentation...</p>"

  try {
    const res = await fetch("/docs")
    docs = await res.json()
    renderDocs()
  } catch (err) {
    container.innerHTML = "<p>Error loading documentation.</p>"
  }
}

function renderDocs() {
  const container = document.getElementById("docs-container")
  container.innerHTML = ""

  docs.forEach(doc => {
    const div = document.createElement("div")
    div.className = "doc-card"

    div.innerHTML = `
      <h3>${doc.name}</h3>
      <p><strong>Category:</strong> ${doc.category}</p>
      <p>${doc.description}</p>
      <a href="${doc.link}" target="_blank">View Docs</a>
      <p>Helpful: ${doc.helpfulPercent}% (${doc.helpfulVotes}/${doc.totalVotes})</p>
      <button onclick="rate('${doc.name}', true)">Helpful</button>
      <button onclick="rate('${doc.name}', false)">Not Helpful</button>
    `

    container.appendChild(div)
  })
}

async function rate(name, helpful) {
  await fetch("/rate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, helpful })
  })

  loadDocs()
}

loadDocs()
