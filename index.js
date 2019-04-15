
const express = require("express")
const bodyParser = require('body-parser');

var app = express()

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());