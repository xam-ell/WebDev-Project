const express = require("express");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser"); // We will use csv-parser to read CSV easily

const app = express();
const PORT = 3000;

app.use(express.json()); // Parse JSON bodies

// File paths
const DATA_FILE = path.join(__dirname, "data.csv");
const RATINGS_FILE = path.join(__dirname, "ratings.json");

// In-memory storage of docs
let docs = [];
let ratings = {};

// Load ratings.json
function loadRatings() {
  try {
    if (fs.existsSync(RATINGS_FILE)) {
      const rawData = fs.readFileSync(RATINGS_FILE);
      ratings = JSON.parse(rawData);
    } else {
      ratings = {};
    }
  } catch (err) {
    console.error("Error reading ratings.json:", err);
    ratings = {};
  }
}

// Save ratings.json
function saveRatings() {
  fs.writeFileSync(RATINGS_FILE, JSON.stringify(ratings, null, 2));
}

// Load CSV data
function loadCSVData() {
  docs = []; // reset
  fs.createReadStream(DATA_FILE)
    .pipe(csv())
    .on("data", (row) => {
      const name = row.name;
      docs.push({
        name: name,
        category: row.category,
        description: row.description,
        link: row.link,
        totalVotes: ratings[name]?.totalVotes || 0,
        helpfulVotes: ratings[name]?.helpfulVotes || 0,
        helpfulPercent:
          ratings[name]?.totalVotes > 0
            ? ratings[name].helpfulVotes / ratings[name].totalVotes
            : 0,
      });
    })
    .on("end", () => {
      console.log("CSV data loaded successfully.");
    });
}

// Initialize
loadRatings();
loadCSVData();

// GET /docs
app.get("/docs", (req, res) => {
  let results = [...docs];

  // Filter by category
  if (req.query.category) {
    const category = req.query.category.toLowerCase();
    results = results.filter(
      (doc) => doc.category.toLowerCase() === category
    );
  }

  // Filter by search (name or description)
  if (req.query.search) {
    const search = req.query.search.toLowerCase();
    results = results.filter(
      (doc) =>
        doc.name.toLowerCase().includes(search) ||
        doc.description.toLowerCase().includes(search)
    );
  }

  // Sort by helpfulPercent descending
  results.sort((a, b) => b.helpfulPercent - a.helpfulPercent);

  res.json(results);
});


// POST /rate/:name
app.post("/rate/:name", (req, res) => {
  const docName = req.params.name;
  const helpful = req.body.helpful;

  // Find the doc
  const doc = docs.find((d) => d.name === docName);
  if (!doc) {
    return res.status(404).json({ error: "Documentation not found" });
  }

  // Initialize ratings if not exist
  if (!ratings[docName]) {
    ratings[docName] = { totalVotes: 0, helpfulVotes: 0 };
  }

  ratings[docName].totalVotes++;
  if (helpful) ratings[docName].helpfulVotes++;

  // Update in-memory doc
  doc.totalVotes = ratings[docName].totalVotes;
  doc.helpfulVotes = ratings[docName].helpfulVotes;
  doc.helpfulPercent = doc.totalVotes
    ? doc.helpfulVotes / doc.totalVotes
    : 0;

  // Save to JSON
  saveRatings();

  res.json({ message: "Rating submitted", doc });
});


// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});