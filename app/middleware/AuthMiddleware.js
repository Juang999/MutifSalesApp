/**
 * config for VPS
*/
const {parsed: config} = require('dotenv').config({path: '/root/Project/MutifSalesApp/.env'});

/**
 * config for local Windows
*/ 
// const {parsed: config} = require('dotenv').config({path: 'C:/Users/user/Project/MutifSalesApp/.env'});
const {TConfUser} = require('../../models');
const jwt = require('jsonwebtoken');
const {set} = require('express-http-context')

let findUser = async (userid) => {
    let findUser = await TConfUser.findOne({
        where: {
            userid: userid
        }
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

    jwt.verify(token, config.ACCESS_TOKEN_SECRET, async (err, user) => {
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