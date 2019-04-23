// parameters
const dbUrl = 'mongodb://localhost:27017';

// imports
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const cors = require('cors');
const UserModel = require('./usermodel');
require('./hotelmodel');

const app = express();

// setup DB
mongoose.connect(dbUrl);
mongoose.connection.on('connected', () => {
  console.log('db connected');
});
mongoose.connection.on('error', () => {
  console.log('db connection error');
});

passport.serializeUser((user, done) => {
  if (!user) return done('serializalasi hiba', user);
  return done(null, user);
});

passport.deserializeUser((user, done) => {
  if (!user) return done('serializalasi hiba', user);
  return done(null, user);
});

passport.use('local',
  new LocalStrategy(((username, password, done) => {
    UserModel.findOne({ username }, (err, user) => {
      if (!user || err) return done('cannot get user', false);
      user.comparePasswords(password, (err, isMatch) => {
        if (err || !isMatch) return done('password incorrect', false);
        return done(null, user);
      });
    });
  })));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(cors());

app.use(expressSession({ secret: '12354456462almajjimnhgiknb,' }));
app.use(passport.initialize());
app.use(passport.session());


app.use('/', require('./hotelroutes'));
app.use('/', require('./authroutes'));

app.listen(3000, () => {
  console.log('Server is running.');
});
