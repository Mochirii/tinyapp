const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 8080; 


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "hf876d": "http://wikipedia.com"
};

function generateRandomString() {
  let randomString = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < 6; i++){
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomString;
}

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

app.get('/urls/new', (req, res) => {

  if (!req.session.user_id) {
    res.redirect('/login');
  } else {
    res.render('urls_new');
  }
});


// app.get("/hello", (req, res) => {
//   res.end("<html><body>Hello <b>World</b></body></html>\n");
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});