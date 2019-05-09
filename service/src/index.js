// parameters
const dbUrl = 'mongodb://prf-hotel-mongo:27017';

// imports
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const cors = require('cors');
require('./usermodel');
require('./hotelmodel');
require('./ratingsmodel');

const UserModel = mongoose.model('user');

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
  if (!user) return done({ message: 'serializalasi hiba', type: 'danger' }, user);
  return done(null, user);
});

passport.deserializeUser((user, done) => {
  if (!user) return done({ message: 'serializalasi hiba', type: 'danger' }, user);
  return done(null, user);
});

passport.use('local',
  new LocalStrategy(((username, password, done) => {
    UserModel.findOne({ username }, (findError, user) => {
      if (!user || findError) return done({ message: 'No such user!', type: 'danger' }, false);
      user.comparePasswords(password, (compareError, isMatch) => {
        if (compareError || !isMatch) return done({ message: 'Incorrect password!', type: 'danger' }, false);
        return done(null, user);
      });
    });
  })));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// app.use(cors({
//   credentials: true,
//   origin: true,
// }));

app.use(expressSession({
  secret: '12354456462almajjimnhgiknb,',
  cookie: { httpOnly: false, secure: false },
  saveUninitialized: true,
  resave: true,
}));
app.use(passport.initialize());
app.use(passport.session());


app.use('/', require('./hotelroutes'));
app.use('/', require('./authroutes'));

app.listen(3000, () => {
  console.log('Server is running.');
});
