const {PtnrMstr, PtnrgGrp, Sequelize} = require('../../../models');
const {Op} = require('sequelize')

class PartnerController {
    getDistributor = (req, res) => {
        PtnrMstr.findAll({
            attributes: [
                ['ptnr_id', 'id'],
                ['ptnr_code', 'partner_code'],
                ['ptnr_name', 'distributor_name'],
            ],
            where: {
                ptnr_ptnrg_id: 9911,
                ptnr_en_id: 1
            }
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

    getDistributorPartner = (req, res) => {
        let ptnrId = req.params.ptnr_id;

        this.queryDistributorPartner(ptnrId)
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

    queryDistributorPartner = async (ptnr_id) => {
        let data = await PtnrMstr.findAll({
                attributes: [
                    ['ptnr_id', 'id'],
                    ['ptnr_code', 'partner_code'],
                    ['ptnr_name', 'partner_name'],
                    [Sequelize.col('group_partner.ptnrg_desc'), 'partner_section']
                ],
                include: [
                    {
                        model: PtnrgGrp,
                        as: 'group_partner',
                        attributes: []
                    }
                ],
                where: {
                    ptnr_en_id: 1,
                    ptnr_parent: {
                        [Op.in]: Sequelize.literal(`(SELECT dbgd_ptnr_id FROM public.dbgd_det WHERE dbgd_dbg_oid = (SELECT dbgd_dbg_oid FROM public.dbgd_det WHERE dbgd_ptnr_id = ${ptnr_id}))`)
                    },
                    ptnr_ptnrg_id: {
                        [Op.notIn]: [999, 9911, 9916, 9910, 9913]
                    }
                }
            })

        return data;
    }
}

module.exports = new PartnerController();