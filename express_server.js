var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; 


app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "hf876d": "http://wikipedia.com"
};

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls", (req, res) => {
  let data = { urlDatabase: urlDatabase };
  res.render('urls_index', data);
});

app.get("/urls/:id", (req, res) => {
  let data = { shortURL: req.params.id, longURL: urlDatabase[req.params.id], };
  res.render("urls_show", data);
});


// app.get("/hello", (req, res) => {
//   res.end("<html><body>Hello <b>World</b></body></html>\n");
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});