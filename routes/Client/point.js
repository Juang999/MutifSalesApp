const {Router} = require('express');
const router = Router();
const {
    getPoint
} = require('../../app/controllers/Client/PointController');
const {Middleware, Requests} = require('../../app/Kernel');

router.get('/', [Middleware.AuthMiddleware], getPoint);

module.exports = router;