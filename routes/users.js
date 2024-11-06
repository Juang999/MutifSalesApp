var express = require('express');
var router = express.Router();

const {loginClient, loginAdmin, getProfile, getDataAccountReceivable, getDetailAccountReceivable} = require('../app/controllers/AuthController')
const AuthMiddleware = require('../app/middleware/AuthMiddleware');
const AuthRequest = require('../app/requests/AuthRequest');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/login', AuthRequest, loginClient);
router.get('/profile', AuthMiddleware, getProfile);
router.post('/admin/login', AuthRequest, loginAdmin);
router.get('/account-receivable', AuthMiddleware, getDataAccountReceivable);
router.get('/:arCode/detail-account-receivable', AuthMiddleware, getDetailAccountReceivable);

module.exports = router;
