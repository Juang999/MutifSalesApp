var express = require('express');
var router = express.Router();

const {loginClient, loginAdmin, getProfile, sumAccountReceivable, getDetailAccountReceivable, getAccountReceivable, getLoggedinUser} = require('../app/controllers/AuthController')
const AuthMiddleware = require('../app/middleware/AuthMiddleware');
const AuthRequest = require('../app/requests/AuthRequest');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/login', AuthRequest, loginClient);
router.get('/profile', AuthMiddleware, getProfile);
router.post('/admin/login', AuthRequest, loginAdmin);
router.get('/logged-in-user', AuthMiddleware, getLoggedinUser);
router.get('/account-receivable', AuthMiddleware, sumAccountReceivable);
router.get('/data-account-receivable', AuthMiddleware, getAccountReceivable);
router.get('/:arOid/detail-account-receivable', AuthMiddleware, getDetailAccountReceivable);

module.exports = router;
