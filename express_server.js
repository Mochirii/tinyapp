const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 8080;
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");

app.use(
  cookieSession({
    name: "cookiesession",
    keys: ["session"]
  })
);

// settings

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": {
    id: "userID1",
    longURL: "http://www.lighthouselabs.ca",
    shortURL: "b2xVn2"

  },

  "9sm5xK": {
    id: "userID1",
    longURL: "http://www.google.com",
    shortURL: "9sm5xK"

  }
};

const users = {
  "userID1": {
    id: "userID1",
    email: "test@example.com",
    password: "test"
  }
  
};
function generateRandomString(num) {
  let numberOfChars = num || 7;
  let shortURL = "";
  const allowedChar = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < numberOfChars; i++) {
    shortURL += allowedChar.charAt(Math.floor(Math.random() * allowedChar.length));
  };
  return shortURL;
};

function getURLs(user_id) {
  const url = {};
  for (let uniqueShortURL in urlDatabase) {
    const currentURL = urlDatabase[uniqueShortURL];
    if (currentURL.userId === user_id) {
      url[uniqueShortURL] = currentURL;
    }
  }
  return url;
}

function emailCheck(email) {
  for (let randomised in users) {
    if (users[randomised].email === email) {
      return email;
    } else {
      return false;
    }
  }
}

function idCheck(email) {
  for (let randomised in users) {
    if (users[randomised].email === email) {
      return users[randomised].id;
    }
  }
}

function giveHashed(email) {
  let equalsEmail = '';
  for (let randomised in users) {
    if (users[randomised].email === email) {
      equalsEmail += users[randomised].hashedPassword;
    }
  }
  return equalsEmail;
}

function registerRouteRes(email, password, randomId, res, req) {
  if (email === "" || password === "" ) {
    res.status(400).send("Fields can't be blank."); 
  } else if (emailCheck(email)) {
    res.status(400).send("Email must be unique.");   
  } else {
    let newUser = {
      id: randomId,
      email: email,
      hashedPassword: password
    };
    
    users[randomId] = newUser;
    req.session.user_id = randomId;
    res.redirect("/urls");
  }
};

//middleware

app.use((req, res, next) => {
  const user = users[req.session.user_id];
  res.locals.user = user;

  return next();
});

// routes

app.get("/", (req, res) => {
  const data = { urls: urlDatabase };
  const user_id = req.session.user_id;

  if (users[user_id]) {
    res.render("urls_index", data);
  } else {
    res.redirect("register");
  }
});
app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;

  if (users[user_id]) {
    res.render("urls_new");
  } else {
    res.redirect("/login");
  }
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/register", (req, res) => {
  const user_id = req.session.user_id;

  if (user_id) {
    res.redirect("urls");
  } else {
    res.render("urls_register");
  }
});

app.get("/login", (req, res) => {
  const user_id = req.session.user_id;

  if (users[user_id]) {
    res.redirect("urls");
  } else {
    res.render("urls_login");
  }
});

app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;
  const data = { urls: getURLs(user_id) };

  if (users[user_id]) {
    res.render("urls_index", data);
  } else {
    res.redirect("/login");
  }
});


app.get("/urls/:id", (req, res) => {
  const user_id = req.session.user_id;
  const shortURLKey = req.params.id;
  const longURL = urlDatabase[shortURLKey];
  if (longURL) {
    const data = {
      shortURLKey: shortURLKey,
      longURL: longURL,
      PORT: PORT
    };

    if (users[user_id]) {
      return res.render("urls_show", data);
    } 
  }
  return res.status(404).send("This page does not exist");
});


app.get("/u/:shortURL", (req, res) => {
  let shortURLKey = req.params.shortURL;
  if (urlDatabase[shortURLKey]) {
    let equalsLongURL = urlDatabase[shortURLKey].longURL;
    res.redirect(equalsLongURL);
  } 
});

app.post("/login", (req, res) => {
  
  const email = req.body.email;
  const password = req.body.password;

  if (email === "" || password === "" ) {
    return res.status(400).send("Fields can't be blank."); 
  } else {
    
    const userId = idCheck(email);
    const hash = giveHashed(email);
    const verifyloginCredentials = bcrypt.compareSync(password, hash);

    if (userId && verifyloginCredentials) { 
      req.session.user_id = userId;
      return res.redirect("urls");
    } 
    res.sendStatus(401)
  };
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let hashedPassword = bcrypt.hashSync(password, 10);
  const randomised = generateRandomString();
  const user_id = req.session.user_id;

  registerRouteRes(email, hashedPassword, randomised, res, req);

});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const user_id = req.session.user_id;

  urlDatabase[shortURL] = { userId: user_id, longURL: longURL };
  res.redirect("urls/" + shortURL);
});

app.post("/urls/:id/update", (req, res) => {
  const user_id = req.session.user_id;
  const shortURLKey = req.params.id;
  const longURL = req.body.longURL;


  if (user_id === urlDatabase[shortURLKey].userId) {
    urlDatabase[shortURLKey] = { userId: user_id, longURL: longURL };  
    res.redirect("/urls/" + shortURLKey);
  } 
});


app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  const user_id = req.session.user_id;
  const shortURLKey = req.params.id;

  if (user_id === urlDatabase[shortURLKey].userId) {
    delete urlDatabase[shortURLKey];
    res.redirect("/urls");
  } 
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
