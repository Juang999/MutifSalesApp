const {
    SlsProgram,
    DbrMstr, DbrdDet, 
    Sequelize, sequelize
} = require('../../../models');
const {Op} = require('sequelize');
const Auth = require('../../../helper/Auth');

class PointController {
    getPoint = (req, res) => {
        let {user_ptnr_id} = Auth.user();

        Promise.all([this.getTotalPoint(user_ptnr_id), this.getDetailPoint(user_ptnr_id)])
        .then(([master, detail]) => {
            res.status(200)
                .json({
                    status:'success',
                    message: 'ok',
                    data: {
                        start_point: master.earn_point,
                        earn_point: master.earn_point,
                        earn_total_point: master.earn_total_point,
                        target_point: master.target_point,
                        detail
                    },
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

    getTotalPoint = async (ptnrId) => {
        let data = await DbrdDet.findOne({
            attributes: [
                [Sequelize.literal('CAST(0 AS INTEGER)'), 'start_point'],
                [Sequelize.literal(`CAST(SUM(dbrd_point) AS INTEGER)`), 'earn_point'],
                [Sequelize.literal(`CAST(SUM(dbrd_tot_point) AS INTEGER)`), 'earn_total_point'],
                [Sequelize.literal('CAST(0 AS INTEGER)'), 'target_point'],
            ],
            where: {
                dbrd_dbr_oid: {
                    [Op.eq]: Sequelize.literal(`(SELECT dbr_oid FROM public.dbr_mstr WHERE dbr_dbg_oid = (SELECT dbgd_dbg_oid FROM public.dbgd_det WHERE dbgd_ptnr_id = ${Auth.user().user_ptnr_id}))`)
                }
            },
            group: ['dbrd_dbr_oid'],
            logging: false
        })

        return {
            start_point: (data) ? data.dataValues.start_point : null, 
            earn_point: (data) ? data.dataValues.earn_point : null,
            earn_total_point: (data)? data.dataValues.earn_total_point : null,
            target_point: (data) ? data.dataValues.target_point : null, 
        }
    } 

    getDetailPoint = async (ptnrId) => {
        let data = await DbrdDet.findAll({
            attributes: [
                [Sequelize.col(`"master_point->sales_program"."sls_name"`), 'sales_program'],
                [Sequelize.literal('CAST(0 AS INTEGER)'), 'start_point'],
                [Sequelize.literal(`CAST(SUM(dbrd_point) AS INTEGER)`), 'earn_point'],
                [Sequelize.literal(`CAST(SUM(dbrd_tot_point) AS INTEGER)`), 'earn_total_point'],
                [Sequelize.literal('CAST(0 AS INTEGER)'), 'target_point'],
            ],
            include: [
                {
                    model: DbrMstr,
                    as: 'master_point',
                    attributes: [],
                    include: [
                        {
                            model: SlsProgram,
                            as: 'sales_program',
                            attributes: []
                        }
                    ]
                }
            ],
            where: {
                [Op.and]: [
                    Sequelize.where(Sequelize.col(`"master_point"."dbr_dbg_oid"`), {
                        [Op.eq]: Sequelize.literal(`(SELECT dbgd_dbg_oid FROM public.dbgd_det WHERE dbgd_ptnr_id = ${ptnrId})`)
                    })
                ],
            },
            group: [`"master_point->sales_program"."sls_name"`, `"master_point"."dbr_dbg_oid"`],
            logging: false
        })

        return data;
    }
}

module.exports = new PointController();