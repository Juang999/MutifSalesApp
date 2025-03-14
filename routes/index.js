var express = require('express');
var router = express.Router();
var {config} = require('../config/environment');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect(config.parsed.REDIRECT_URL);
});

module.exports = router;
