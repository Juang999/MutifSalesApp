const {PtnrMstr, PtnrgGrp, Sequelize} = require("../../../models");
const {Op} = require('sequelize');

class PartnerController {
    getPartnerName = (req, res) => {
        let search = (req.query.search) ? req.query.search : '';

        PtnrMstr.findAll({
            attributes: [
                ['ptnr_id', 'partner_id'],
                ['ptnr_name', 'partner_name'],
                [Sequelize.col('group_partner.ptnrg_desc'), 'partner_group']
            ],
            include: [
                {
                    model: PtnrgGrp,
                    as: 'group_partner',
                    attributes: []
                }
            ],
            where: [
                Sequelize.where(Sequelize.col("ptnr_name"), {
                    [Op.iLike]: `%${search}%`
                })
            ]
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

module.exports = new PartnerController();