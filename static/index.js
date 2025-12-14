let docs = []

//listener for page load
document.addEventListener('DOMContentLoaded', () => {
    // call this once to start
    loadDocs()

    //hooking up all the filter checkboxes
    const inputs = document.querySelectorAll('.filter-bar input')
    inputs.forEach(input => {
        input.addEventListener('change', loadDocs)
    })

    //search button click
    const searchBtn = document.querySelector('.search-section button')
    searchBtn.addEventListener('click', loadDocs)

    //use enter key for search
    const searchInput = document.getElementById('search-input')
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') loadDocs()
    })
})

async function loadDocs() {
  const container = document.getElementById("docs-container")
  container.innerHTML = "<p>Loading documentation.</p>"

  //grabbing all the values from the html inputs
  const search = document.getElementById('search-input').value
  //getting the checked boxes for categories
  const checkedCats = Array.from(document.querySelectorAll('input[name="category"]:checked'))
        .map(cb => cb.value)
  //getting the sort radio button
  const sort = document.querySelector('input[name="sort"]:checked')?.value || 'most-helpful'

  //building the url query string
  const params = new URLSearchParams()
  if (search) params.append('search', search)
  if (sort) params.append('sort', sort)
  checkedCats.forEach(cat => params.append('category', cat))

  try {
    //(modified previous code) added the params to the fetch url
    const res = await fetch(`/docs?${params.toString()}`)
    docs = await res.json()
    renderDocs()
  } catch (err) {
    container.innerHTML = "<p>Error loading documentation.</p>"
  }
}

function renderDocs() {
  const container = document.getElementById("docs-container")
  container.innerHTML = ""
  
  // check if empty
  if (docs.length === 0) {
      container.innerHTML = "<p>No results found :( try clearing filters</p>"
      return
  }

  docs.forEach(doc => {
    const div = document.createElement("div")
    div.className = "doc-card"

    //added the css classes from Alex's file so it looks nice
    div.innerHTML = `
      <h3>${doc.name}</h3>
      <p><strong>Category:</strong> ${doc.category}</p>
      <p class="doc-description">${doc.description}</p>
      <a href="${doc.link}" target="_blank" class="doc-link">View Docs</a>
      
      <div class="helpfulness">
        Helpful: ${doc.helpfulPercent}% (${doc.helpfulVotes}/${doc.totalVotes})
      </div>
      
      <div class="rating">
        <button class="rate-yes" onclick="rate('${doc.name}', true)">Yes</button>
        <button class="rate-no" onclick="rate('${doc.name}', false)">No</button>
      </div>
    `

    container.appendChild(div)
  })
}

async function rate(name, helpful) {
  // keeping this exactly the same as before
  await fetch("/rate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, helpful })
  })

  loadDocs()
}