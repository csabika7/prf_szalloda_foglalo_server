
const express = require('express');

const router = express.Router();


router.get('/hotels', (req, res) => res.send('{}'));

module.exports = router;
