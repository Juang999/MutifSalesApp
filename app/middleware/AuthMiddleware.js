const {config} = require('../../config/environment');
const {TConfUser} = require('../../models');
const jwt = require('jsonwebtoken');
const {set} = require('express-http-context')

let findUser = async (userid) => {
    let findUser = await TConfUser.findOne({
        where: {
            userid: userid
        },
        logging: false
    })

    return (findUser) ? true : false;
}

let Authorization = (req, res, next) => {
    let authorization = req.headers['authorization'];
    let token = authorization && authorization.split(' ')[1]

    if (!token) {
        res.status(300)
            .json({
                status: 'failed',
                message: 'Unautorized!',
                data: null,
                error: 'Unautorized!'
            })

        return
    }

    set('token', token);

    jwt.verify(token, config.parsed.ACCESS_TOKEN_SECRET, async (err, user) => {
        if (err) {
            res.status(300)
                .json({
                    status: 'failed',
                    message: 'Token Invalid',
                    data: null,
                    error: 'Token Invalid'
                })

            return;
        }

        if (await findUser(user.userid) == false) {
            res.status(300)
                .json({
                    status: 'failed',
                    message: 'Token Invalid',
                    data: null,
                    error: 'Token Invalid'
                })

            return;
        }

        next();
    })
}

module.exports = Authorization;