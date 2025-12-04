// lines 9 through 16, as well as app.listen grabbed from in lecture notes and example code
var express = require('express')
// 
var port = process.env.PORT || 8011
var app = express()

app.set("view engine", "ejs")

app.use(express.static('static'))

// will be replaced using ejs?
app.get('/', function(req, res, next) {
    res.status(200).sendFile(__dirname + '/html/index.html')
})
//


app.get('/*splat', function(req, res, next) {
    res.status(404).sendFile(__dirname + '/html/404.html')
})

app.listen(port, function (err) {
  if (err) {
    throw err
  }
  console.log("== Server listening on port:", port)
})