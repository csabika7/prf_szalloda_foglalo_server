const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');

const UserModel = mongoose.model('user');
const router = express.Router();

router.post('/user/register', (req, res) => {
  if (!req.body.username || !req.body.password || !req.body.email) {
    return res.status(403).send({ message: 'User name, email, password required', type: 'danger' });
  }
  const user = new UserModel({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
  });
  user.save((error) => {
    if (error) return res.status(500).send({ message: error });
    return res.status(200).send({ message: 'Registration success', type: 'success' });
  });
});

router.get('/user/list', (req, res) => {
  UserModel.find({}, (err, users) => res.send(users));
});

router.post('/user/logout', (req, res) => {
  if (req.isAuthenticated()) {
    req.logout();
    res.status(200).send({ message: 'You have been logged out', type: 'success' });
  } else {
    res.status(403).send({ message: 'You have to log in first', type: 'danger' });
  }
});

router.post('/user/login', (req, res) => {
  if (req.body.username && req.body.password) {
    passport.authenticate('local', (error, username) => {
      if (error) {
        return res.status(403).send({ message: error, type: 'danger' });
      }
      req.logIn(username, (error) => {
        if (error) return res.status(500).send({ message: error, type: 'danger' });
        return res.status(200).send({ message: 'login successful', type: 'success' });
      });
    })(req, res);
  } else {
    return res.status(403).send({ message: 'Username, password required', type: 'danger' });
  }
});

module.exports = router;
