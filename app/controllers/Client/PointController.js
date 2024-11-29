const {
    DbrdDet, Sequelize, sequelize
} = require('../../../models');
const {Op} = require('sequelize');
const Auth = require('../../../helper/Auth');;

class PointController {
    getPoint = (req, res) => {
        DbrdDet.findOne({
            attributes: [
                [Sequelize.literal(`CAST(SUM(dbrd_point) AS INTEGER)`), 'sum_point'],
                [Sequelize.literal(`CAST(SUM(dbrd_tot_point) AS INTEGER)`), 'sum_total_point'],
            ],
            where: {
                dbrd_dbr_oid: {
                    [Op.eq]: Sequelize.literal(`(SELECT dbr_oid FROM public.dbr_mstr WHERE dbr_dbg_oid = (SELECT dbgd_dbg_oid FROM public.dbgd_det WHERE dbgd_ptnr_id = ${Auth.user().user_ptnr_id}))`)
                }
            },
            logging: false
        })
        .then(result => {
            res.status(200)
                .json({
                    status:'success',
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
}

module.exports = new PointController();