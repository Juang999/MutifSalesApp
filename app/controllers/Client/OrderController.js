const {SqMstr, Sequelize, sequelize} = require('../../../models');
const moment = require('moment');
const {Op} = require('sequelize');
const Auth = require('../../../helper/Auth');

class OrderController {
    invoiceNumber = (req, res) => {
        let startDay = moment().format('YYYY-MM-DD 00:00:00');
        let endDay = moment().format('YYYY-MM-DD 23:59:59');

        SqMstr.findAll({
            attributes: [
                [Sequelize.literal(`COUNT(DISTINCT(sq_midtrans_inv_number)) + 1`), 'invoice_number']
            ],
            where: {
                sq_add_date: {
                    [Op.between]: [startDay, endDay]
                }
            },
        })
        .then(result => {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'ok',
                    data: result,
                    error: null
                }) 
        })
        .catch(err => {
            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: err.message
                })
        })
    }

    getDetailInvoiceNumber = async (req, res) => {
        let {userid, usernama, ptnrg_id, user_ptnr_id} = Auth.user();

        
    }

    getDetailUser = async (ptnrId) => {
        
    }
}

module.exports = new OrderController();