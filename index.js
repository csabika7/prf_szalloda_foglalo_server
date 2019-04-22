
// parameters
const dbUrl = 'mongodb://localhost:27017';

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

// setup DB
mongoose.connect(dbUrl);
mongoose.connection.on('connected', () => {
  console.log('db connected');
});
mongoose.connection.on('error', () => {
  console.log('db connection error');
});


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.use('/', require('./routes'));

app.listen(3000, () => {
  console.log('Server is running.');
});
