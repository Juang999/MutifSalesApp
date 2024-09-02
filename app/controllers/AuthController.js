const {TConfUser, TokenStorage, Sequelize} = require('../../models');
const {parsed: config} = require('dotenv').config({path: 'C:/Users/user/Project/MutifSalesApp/.env'});
const jwt = require('jsonwebtoken');
const {Op} = require('sequelize');
const {v4: uuidv4} = require('uuid');

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

            res.status(200)
                .json({
                    status: 'success',
                    message: 'logged in!',
                    data: token,
                    error: null
                })
        } catch (error) {
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

            res.status(200)
                .json({
                    status: 'success',
                    message: 'admin logged in!',
                    data: token,
                    error: null
                })
        } catch (error) {
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