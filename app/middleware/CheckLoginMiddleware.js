const {set} = require('express-http-context')

const CheckLoginMiddleware = (req, res, next) => {
    let authorization = req.headers['authorization'];
    let token = (authorization) ? authorization.split(' ')[1] : null;

    set('token', token);

    next();
}

module.exports = CheckLoginMiddleware;