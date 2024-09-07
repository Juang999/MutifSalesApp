var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('https://sales.itmutif.my.id/client/home');
});

module.exports = router;
