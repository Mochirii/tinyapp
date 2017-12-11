const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 8080;
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");

app.use(cookieSession({
  name: 'cookiesession',
  keys: ['session']
}));


app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");


const urlDatabase = {
  b2xVn2: {
    id: "userID1",
    longURL: "http://www.lighthouselabs.ca"
  },

  "9sm5xK": {
    id: "userID2",
    longURL: "http://www.google.com"
  }
};

const users = {
  userID1: {
    id: "userID1",
    email: "mel@example.com",
    password: "lhlabs"
  },
  userID2: {
    id: "userID1",
    email: "jess@example.com",
    password: "dogsrgreat"
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
  let equalsEmail = "";
  for (let randomised in users) {
    if (users[randomised].email === email) {
      equalsEmail += users[randomised].hashedPassword.toString();
    }
  }
  return equalsEmail;
}

app.use((req, res, next) => {                        
  const user = users[req.session.user_id];
  res.locals.user = user;

  return next();
}); 

/* GETS */


app.get("/", (req, res) => {
  const data = { urls: urlDatabase };
  const user_id = req.session.user_id;

  if (users[user_id]) {
    res.render("urls_index", data);
  } else {
    res.redirect("register");
  }
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
  const shortURLS = req.params.id;
  const longURL = urlDatabase[shortURLS];
  if (longURL) {
    let data = {
      "shortURLS": shortURLS, 
      "longURL": longURL, 
      "PORT": PORT
    };
    if (users[user_id]) {
      return res.render("urls_show", data);
    } else {
      return res
        .status(401)
        .send("You do not have permission to access this resource");
    }
  }
  return res.status(404).send("This page does not exist");
});

app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;
  
    if (users[user_id]) {
      res.render("urls_new");
    } else { 
      res.redirect("/login");
    };
  });

app.get("/u/:shortURL", (req, res) => {
  let shortURLS = req.params.shortURL;
  if (urlDatabase[shortURLS]) {
    let matchedLongURL = urlDatabase[shortURLS].longURL;
    res.redirect(matchedLongURL);
  } else {
      return res.status(404).send("This page does not exist")
    } 
});

/* POSTS */


app.post("/login", (req, res) => {
  const userId = idCheck(email);
  const hash = giveHashed(email);
  const verifyloginCredentials = bcrypt.compareSync(password, hash);

  if (userId && verifyloginCredentials) {
    req.session.user_id = userId;
    return res.redirect("urls");
  } 

});

app.post("/register", (req, res) => {
  const email = req.body.email.trim();
  const password = req.body.password.trim();
  let hashedPassword = bcrypt.hashSync(password, 10);
  const randomised = generateRandomString();
  const user_id = req.session.user_id;

});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const user_id = req.session.user_id;

  urlDatabase[shortURL] = { userId: user_id, longURL: longURL };
  res.redirect("urls/" + shortURL);
});


app.post("/urls/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  const user_id = req.session.user_id;
  const shortURLS = req.params.id;

  if (user_id === urlDatabase[shortURLS].userId) {
    delete urlDatabase[shortURLS];
    res.redirect("/urls");
  } else {
    return res
      .status(401)
      .send("You do not have permission to access this resource");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
