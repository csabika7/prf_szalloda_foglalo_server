const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');

const UserModel = mongoose.model('user');
const router = express.Router();

router.post('/register', (req, res) => {
  if (!req.body.username || !req.body.password) {
    return res.status(404).send('username or password missing');
  }
  const user = new UserModel({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
  });
  user.save((error) => {
    if (error) return res.status(500).send(error);
    return res.status(200).send('registration success');
  });
});

router.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    return res.status(200).send('Hello World');
  }
  return res.status(403).send('You are not welcome here');
});

router.get('/users', (req, res) => {
  UserModel.find({}, (err, users) => res.send(users));
});

router.post('/logout', (req, res) => {
  if (req.isAuthenticated()) {
    req.logout();
    res.status(200).send('You have been logged out');
  } else {
    res.status(403).send('You have to log in first');
  }
});

router.post('/login', (req, res) => {
  if (req.body.username && req.body.password) {
    passport.authenticate('local', (error, username) => {
      if (error) {
        return res.status(403).send(error);
      }
      req.logIn(username, (error) => {
        if (error) return res.status(500).send(error);
        return res.status(200).send('login successful');
      });
    })(req, res);
  } else {
    return res.status(403).send('username and password required');
  }
});

module.exports = router;
