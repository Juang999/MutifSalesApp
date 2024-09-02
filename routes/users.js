var express = require('express');
var router = express.Router();

/**
 * controller for Virtual Private Server
*/
const {loginClient, loginAdmin} = require('root/Project/MutifSalesApp/app/controllers/AuthController')

/**
 * Controller for local Windows
*/
// const {loginClient, loginAdmin} = require('C:/Users/user/Project/MutifSalesApp/app/controllers/AuthController')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/login', loginClient);
router.post('/admin/login', loginAdmin);

module.exports = router;
