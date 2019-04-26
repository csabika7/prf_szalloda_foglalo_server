const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');

const UserModel = mongoose.model('user');
const router = express.Router();

router.post('/user/register', (req, res) => {
  if (!req.body.username || !req.body.password) {
    return res.status(404).send({ message: 'Username or password missing' });
  }
  const user = new UserModel({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
  });
  user.save((error) => {
    if (error) return res.status(500).send({ message: error });
    return res.status(200).send({ message: 'Registration success' });
  });
});

router.get('/user/list', (req, res) => {
  UserModel.find({}, (err, users) => res.send(users));
});

router.post('/user/logout', (req, res) => {
  if (req.isAuthenticated()) {
    req.logout();
    res.status(200).send({ message: 'You have been logged out' });
  } else {
    res.status(403).send({ message: 'You have to log in first' });
  }
});

router.post('/user/login', (req, res) => {
  if (req.body.username && req.body.password) {
    passport.authenticate('local', (error, username) => {
      if (error) {
        return res.status(403).send({ message: error });
      }
      req.logIn(username, (error) => {
        if (error) return res.status(500).send({ message: error });
        return res.status(200).send({ message: 'login successful' });
      });
    })(req, res);
  } else {
    return res.status(403).send({ messgage: 'username, password required' });
  }
});

module.exports = router;
