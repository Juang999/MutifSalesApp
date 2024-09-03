/**
 * package for Virtual Private Server
*/
const {info, error: errorLog} = require('/root/Project/MutifSalesAppDev/helper/Logging')
const {parsed: config} = require('dotenv').config({path: '/root/Project/MutifSalesAppDev/.env'});
const Auth = require('/root/Project/MutifSalesApp/helper/Auth');

/**
 * package for local Windows
*/
// const {info, error: errorLog} = require('C:/Users/user/Project/MutifSalesApp/helper/Logging')
// const {parsed: config} = require('dotenv').config({path: 'C:/Users/user/Project/MutifSalesApp/.env'});
// const Auth = require('C:/Users/user/Project/MutifSalesApp/helper/Auth');

const {TConfUser, TokenStorage, PtnrMstr, PtnrgGrp, Sequelize} = require('../../models');
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
                    'user_ptnr_id',
                    [Sequelize.literal(`"detail_partner"."ptnr_ptnrg_id"`), 'ptnrg_id']
                ],
                include: [
                    {
                        model: PtnrMstr,
                        as: 'detail_partner',
                        attributes: []
                    }
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
                    'user_ptnr_id',
                    [Sequelize.literal(`"detail_partner"."ptnr_ptnrg_id"`), 'ptnrg_id']
                ],
                include: [
                    {
                        model: PtnrMstr,
                        as: 'detail_partner',
                        attributes: []
                    }
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

            info({feature: "LOGIN ADMIN", message: `${admin.dataValues.usernama} LOGGED IN!`})

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

    getProfile = async (req, res) => {
        try {
            let user = await Auth.user();

            let userProfile = await PtnrMstr.findOne({
                attributes: [
                    'ptnr_name',
                    [Sequelize.literal('"user"."usernama"'), 'username'],
                    ['ptnr_ptnrg_id', 'group_id'],
                    [Sequelize.col("group_partner.ptnrg_code"), 'group_code'],
                    [Sequelize.col("group_partner.ptnrg_name"), 'group_name'],
                    [Sequelize.literal(`CASE WHEN ptnr_ptnrg_id = 9911 THEN '0.40' WHEN ptnr_ptnrg_id = 998 THEN '0.30' WHEN ptnr_ptnrg_id = 357 THEN '0.30' ELSE '0' END`), 'discount']
                ],
                include: [
                    {
                        model: TConfUser,
                        as: 'user',
                        attributes: []
                    },
                    {
                        model: PtnrgGrp,
                        as: 'group_partner',
                        attributes: []
                    }
                ],
                where: {
                    ptnr_id: user.user_ptnr_id
                }
            })

            res.status(200)
                .json({
                    status: 'success',
                    message: 'got profile!',
                    data: userProfile,
                    error: null
                })
        } catch (error) {
            errorLog({feature: "PROFILE USER", message: error.message})

            res.status(400)
                .json({
                    status: 'failed',
                    message: 'failed to get profile!',
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