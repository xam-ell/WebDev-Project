const express = require('express')
const fs = require('fs')
const csv = require('csv-parser')

const app = express()
const port = process.env.PORT || 8011

app.use(express.json())
app.use(express.static('static'))

let docs = []
let ratings = {}

// ---------- Load ratings ----------
function loadRatings() {
  try {
    if (fs.existsSync('ratings.json')) {
      const data = fs.readFileSync('ratings.json', 'utf8')
      ratings = data ? JSON.parse(data) : {}
    }
  } catch (err) {
    console.error('Error reading ratings.json:', err)
    ratings = {}
  }
}

// ---------- Save ratings ----------
function saveRatings() {
  fs.writeFileSync('ratings.json', JSON.stringify(ratings, null, 2))
}

// ---------- Load CSV ----------
// Changed path to 'backend/data.csv' since the file is inside the backend folder
fs.createReadStream('backend/data.csv')
  .pipe(csv())
  .on('data', row => {
    docs.push(row)
  })
  .on('end', () => {
    console.log('CSV data loaded')
  })

loadRatings()

// ---------- Routes ----------
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/html/index.html')
})

app.get('/docs', (req, res) => {
  // 1. Start with all docs
  let result = docs

  // 2. Apply Category Filter
  if (req.query.category) {
    const categories = [].concat(req.query.category).map(c => c.toLowerCase())
    result = result.filter(doc => categories.includes(doc.category.toLowerCase()))
  }

  // 3. Apply Search Filter
  if (req.query.search) {
    const search = req.query.search.toLowerCase()
    result = result.filter(doc => 
      doc.name.toLowerCase().includes(search) || 
      doc.description.toLowerCase().includes(search)
    )
  }

  // 4. Map to add ratings (Calculate Percentage)
  result = result.map(doc => {
    const r = ratings[doc.name] || { helpful: 0, total: 0 }
    const percent = r.total ? Math.round((r.helpful / r.total) * 100) : 0

    return {
      ...doc,
      helpfulVotes: r.helpful,
      totalVotes: r.total,
      helpfulPercent: percent
    }
  })

  // 5. Sort Results
  const sortMode = req.query.sort || 'most-helpful'
  if (sortMode === 'most-helpful') {
    result.sort((a, b) => b.helpfulPercent - a.helpfulPercent)
  } else if (sortMode === 'least-helpful') {
    result.sort((a, b) => a.helpfulPercent - b.helpfulPercent)
  } else if (sortMode === 'newest') {
    result.reverse() 
  }

  res.json(result)
})

app.post('/rate', (req, res) => {
  const { name, helpful } = req.body
  if (!ratings[name]) ratings[name] = { helpful: 0, total: 0 }

  ratings[name].total++
  if (helpful) ratings[name].helpful++

  saveRatings()
  res.json({ success: true })
})

app.listen(port, () => {
  console.log(`== Server running on http://localhost:${port}`)
})