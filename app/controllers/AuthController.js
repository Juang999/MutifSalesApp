/**
 * package for Virtual Private Server
*/
const {info, error: errorLog} = require('/root/Project/MutifSalesAppDev/helper/Logging')
const {parsed: config} = require('dotenv').config({path: '/root/Project/MutifSalesAppDev/.env'});

/**
 * package for local Windows
*/
// const {info, error: errorLog} = require('C:/Users/user/Project/MutifSalesApp/helper/Logging')
// const {parsed: config} = require('dotenv').config({path: 'C:/Users/user/Project/MutifSalesApp/.env'});

const {TConfUser, TokenStorage, Sequelize} = require('../../models');
const jwt = require('jsonwebtoken');
const {Op} = require('sequelize');

class AuthController {
    loginClient = async (req, res) => {
        try {
            let user = await TConfUser.findOne({
                attributes: [
                    'userid',
                    'usernama',
                    'password',
                    'groupid',
                ],
                where: {
                    usernama: req.body.username,
                    password: req.body.password,
                    user_ptnr_id: {
                        [Op.in]: Sequelize.literal("(SELECT ptnr_id FROM public.ptnr_mstr WHERE ptnr_is_emp = 'Y')")
                    }
                },
                logging: () => {}
            })

            if (user == null) {
                res.status(300)
                    .json({
                        status: 'fales',
                        message: 'Unauthorized',
                        data: null,
                        error: null
                    })

                return;
            }

            let token = await this.createToken(user.dataValues);

            info({feature: "LOGIN CLIENT", message: `${user.dataValues.usernama} LOGGED IN!`})
            res.status(200)
                .json({
                    status: 'success',
                    message: 'logged in!',
                    data: token,
                    error: null
                })
        } catch (error) {
            errorLog({feature: "LOGIN CLIENT", message: error.message})

            res.status(400)
                .json({
                    status: 'failed',
                    message:'error',
                    data: null,
                    error: 'Internal Server Error'
                })
        }
    }

    loginAdmin = async (req, res) => {
        try {
            let admin = await TConfUser.findOne({
                attributes: [
                    'userid',
                    'usernama',
                    'password',
                    'groupid',
                ],
                where: {
                    usernama: req.body.username,
                    password: req.body.password,
                    groupid: 1
                },
                logging: () => {}
            })

            if (admin == null) {
                res.status(300)
                    .json({
                        status: 'fales',
                        message: 'Unauthorized',
                        data: null,
                        error: null
                    })

                return;
            }

            let token = this.createToken(admin.dataValues)

            info({feature: "LOGIN ADMIN", message: `${user.dataValues.usernama} LOGGED IN!`})

            res.status(200)
                .json({
                    status: 'success',
                    message: 'admin logged in!',
                    data: token,
                    error: null
                })
        } catch (error) {
            errorLog({feature: "LOGIN ADMIN", message: error.message})

            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: error.message

                })
        }
    }

    createToken = (dataUser) => {
        return jwt.sign(dataUser, config.ACCESS_TOKEN_SECRET, {expiresIn: '24h'})
    }

    inputToken = async (userid, token) => {
        await TokenStorage.create({
            token_user_id: userid,
            token_token: token,
            token_desc: 'mutif-sales-app'
        }, {
            logging: () => {}
        })
    }
}

module.exports = new AuthController();