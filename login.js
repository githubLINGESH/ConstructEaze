const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const router = express.Router();
const path = require('path');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

// Define your login routes and middleware here
const myMiddleware = (req, res, next) => {
  // Your middleware logic here
  next();
};
router.use(myMiddleware);

router.get('/', (req, res) => {
  // Construct the correct path to the login.html file using __dirname
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Define the login data schema
const loginSchema = new mongoose.Schema({
  email: String,
  password: String,
  auth: String
});

// Create a model based on the schema
const LoginModel = mongoose.model('Login', loginSchema);

// Validate email, password, and authentication code against the data in MongoDB
const validateLogin = async (email, password, auth) => {
  let query = { email, password };

  if (auth) {
    query.auth = auth;
  }

  return await LoginModel.exists(query);
};

// Handle the form submission for /login
router.post('/', (req, res) => {
  const { email, password, auth } = req.body;

  // Validate email, password, and authentication code
  validateLogin(email, password, auth)
    .then((isValid) => {
      if (isValid) {
        console.log('Login successful');
        res.sendFile(path.join(__dirname, 'home.html')); // Send the user to home.html if login is successful
      } else {
        console.log('Invalid email, password, or authentication code');
        res.status(401).send('<script>document.getElementById("message").innerText = "Invalid email, password, or authentication code";</script>'); // Send an error response message
      }
    })
    .catch((error) => {
      console.error('Error validating login', error);
      res.status(500).send('<script>document.getElementById("message").innerText = "Error validating login";</script>'); // Send an error response message
    });
});

module.exports = router;
