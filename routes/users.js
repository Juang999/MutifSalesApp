var express = require('express');
var router = express.Router();

/**
 * controller for Virtual Private Server
*/
const {loginClient, loginAdmin, getProfile} = require('root/Project/MutifSalesApp/app/controllers/AuthController')
const AuthMiddleware = require('/root/Project/MutifSalesApp/app/middleware/AuthMiddleware');

/**
 * Controller for local Windows
*/
// const {loginClient, loginAdmin, getProfile} = require('C:/Users/user/Project/MutifSalesApp/app/controllers/AuthController')
// const AuthMiddleware = require('C:/Users/user/Project/MutifSalesApp/app/middleware/AuthMiddleware');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/login', loginClient);
router.post('/admin/login', loginAdmin);
router.get('/profile', AuthMiddleware, getProfile);

module.exports = router;
