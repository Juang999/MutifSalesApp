const {
    InvcMstr,
    SoMstr, SodDet,
    PtMstr, LocMstr,
    DbgGroup, DbgdDet,
    PtsfrMstr, PtsfrdDet,
    Sequelize, sequelize,
    PtnrMstr, TransStatus,
    SoShipMstr, SoShipdDet
} = require('../../../models');
const moment = require('moment');
const { Op } = require('sequelize');
const {v4: uuidv4} = require('uuid');
const Auth = require('../../../helper/Auth');
const {insertQuery, insertBulkQuery} = require('../../../helper/InputQueryIntoSqlOut');

class ShipmentController {
    index = (req, res) => {
        let search = (req.query.search) ? req.query.search : '';
        let startDate = (req.query.start_date) ? moment(req.query.start_date).format('YYYY-MM-DD') : moment().startOf('months').format('YYYY-MM-DD');
        let endDate = (req.query.end_date) ? moment(req.query.end_date).format('YYYY-MM-DD') : moment().endOf('months').format('YYYY-MM-DD');
        const { user_ptnr_id } = Auth.user();

        PtsfrMstr.findAll({
            attributes: [
                ["ptsfr_oid", 'transfer_oid'],
                ["ptsfr_code", "transfer_code"],
                ['ptsfr_date', 'shipment_date'],
                ['ptsfr_receive_date', 'receive_date'],
                [Sequelize.col(`"status_transfer"."trans_desc"`), 'status'],
                [Sequelize.literal(`COUNT("singular_detail_transfer"."ptsfrd_oid")`), 'total_articles'],
            ],
            include: [
                {
                    model: PtsfrdDet,
                    as: 'singular_detail_transfer',
                    attributes: []
                }, {
                    model: TransStatus,
                    as: 'status_transfer',
                    attributes: []
                }, {
                    model: LocMstr,
                    as: 'destination_location',
                    attributes: [],
                    right: true,
                    include: [
                        {
                            model: PtnrMstr,
                            as: 'detail_partner',
                            attributes: [],
                            include: [
                                {
                                    model: DbgdDet,
                                    as: 'grouping_partner',
                                    attributes: []
                                }
                            ]
                        }
                    ]
                }
            ],
            where: [
                Sequelize.where(Sequelize.col(`"destination_location->detail_partner->grouping_partner"."dbgd_dbg_oid"`), {
                    [Op.eq]: Sequelize.literal(`(SELECT dbgd_dbg_oid FROM public.dbgd_det WHERE dbgd_ptnr_id = ${user_ptnr_id})`)
                }),
                Sequelize.where(Sequelize.col(`ptsfr_date`), {
                    [Op.between]: [startDate, endDate]
                })
            ],
            group: [
                'status',
                "ptsfr_oid",
                'receive_date',
                "transfer_code",
                'shipment_date',
            ],
            order: [
                ['ptsfr_receive_date', 'desc'],
                ['ptsfr_date', 'desc']
            ],
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
        .catch(err => [
            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: err.message
                })
        ])
    }

    show = (req, res) => {
        let { user_ptnr_id } = Auth.user();

        PtsfrMstr.findOne({
            attributes: [
                ['ptsfr_oid', 'transfer_oid'],
                [Sequelize.literal(`(SELECT en_desc FROM public.en_mstr WHERE en_id = ptsfr_en_id LIMIT 1)`), 'entity'],
                ['ptsfr_code', 'transfer_code'],
                ['ptsfr_date', 'transfer_date'],
                ['ptsfr_loc_git', 'loc_git_id'],
                ['ptsfr_loc_to_id', 'loc_to_id'],
                [Sequelize.literal(`(SELECT loc_desc FROM public.loc_mstr WHERE loc_id = ptsfr_loc_to_id LIMIT 1)`), 'location_destination'],
                ['ptsfr_receive_date', 'receive_date'],
                [Sequelize.literal(`(SELECT "trans_desc" FROM public.trans_status WHERE trans_id = ptsfr_trans_id LIMIT 1)`), 'status']
            ],
            include: [
                {
                    model: PtsfrdDet,
                    required: false,
                    as: 'detail_transfer',
                    attributes: [
                        ['ptsfrd_oid', 'detail_transfer_oid'],
                        ['ptsfrd_pt_id', "product_id"],
                        [Sequelize.literal(`"detail_transfer->detail_product"."pt_desc1"`), 'product_name'],
                        [Sequelize.literal(`"detail_transfer->detail_product"."pt_code"`), 'product_code'],
                        ['ptsfrd_qty', 'quantity_shipped'],
                        [Sequelize.literal(`CASE WHEN "ptsfrd_qty_receive" IS NULL THEN 0 ELSE "ptsfrd_qty_receive" END`), "quantity_received"]
                    ],
                    include: [
                        {
                            model: PtMstr,
                            as: 'detail_product',
                            attributes: []
                        }
                    ]
                }, {
                    model: LocMstr,
                    as: 'destination_location',
                    attributes: [],
                    include: [
                        {
                            model: PtnrMstr,
                            as: 'detail_partner',
                            attributes: [],
                            include: [
                                {
                                    model: DbgdDet.scope({method: ['filterGroup', user_ptnr_id]}),
                                    as: 'grouping_partner',
                                    attributes: [],
                                }
                            ]
                        }
                    ]
                }
            ],
            where: [
                Sequelize.where(Sequelize.col('ptsfr_oid'), {
                    [Op.eq]: req.params.transfer_oid
                }),
            ],
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

    update = async (req, res) => {        
        try {
            const {transfer_oid} = req.params;
            const { user_ptnr_id, usernama } = Auth.user();
            const {loc_git_id: locGitId, loc_to_id: locToId, detail_receive: detailReceive} = req.body;

            let result = await sequelize.transaction(async t => {
                // update header transfer issue
                await this.updateHeaderTransferIssue(usernama, transfer_oid, t)

                for (const {detail_transfer_oid: detailTransferOid, product_id: productId, quantity_shipped: quantityShipped} of detailReceive) {
                    let [dataGITLocation, dataDestinationLocation] = await Promise.all([ 
                        // get data from GIT location
                        this.getDataQuantity(locGitId, productId, t),
                        // get data from destination location
                        this.getDataQuantity(locToId, productId, t),
                    ]);

                    let dataGIT = dataGITLocation;
                    let dataDL = dataDestinationLocation;

                    let qtyForGIT = parseInt(dataGIT.dataValues.invc_qty_available) - parseInt(quantityShipped);
                    let qtyForDestination = (dataDL) ? parseInt(dataDL.dataValues.invc_qty_available) + parseInt(quantityShipped) : parseInt(quantityShipped);

                    if (dataDL == null) {
                        await Promise.all([
                            // update detail transfer issue
                            this.updateDetailTransferIssue(detailTransferOid, quantityShipped, t),
                            // update data GIT location
                            this.updateQuantityByLocation(dataGIT.dataValues.invc_oid, qtyForGIT, dataGIT.dataValues.invc_qty_available, t),
                            // input new data by product & location
                            this.inputDataByProductLocation(locToId, productId, quantityShipped, t),
                        ])
                    } else {
                        await Promise.all([
                            // update detail transfer issue
                            this.updateDetailTransferIssue(detailTransferOid, quantityShipped, t),
                            // update data GIT location
                            this.updateQuantityByLocation(dataGIT.dataValues.invc_oid, qtyForGIT, dataGIT.dataValues.invc_qty_available, t),
                            // update data Destination location
                            this.updateQuantityByLocation(dataDL.dataValues.invc_oid, qtyForDestination, dataDL.dataValues.invc_qty_available, t)
                        ])
                    }
                }
            })

            res.status(200)
                .json({
                    status:'success',
                    message: 'ok',
                    data: result,
                    error: null
                });
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

    updateHeaderTransferIssue = async (username, ptsfrOid, transaction) => {
        let result = await PtsfrMstr.update({
            ptsfr_upd_by: username,
            ptsfr_upd_date: moment().format('YYYY-MM-DD HH:mm:ss'),
            ptsfr_trans_id: 'C',
            ptsfr_receive_date: moment().format('YYYY-MM-DD')
        }, {
            where: {
                ptsfr_oid: ptsfrOid
            },
            transaction: transaction,
            logging: async (sql, {bind}) => {
                let realSql = sql.split(': ')[1];

                await insertQuery(realSql, bind);
            }
        })

        return result;
    }

    updateDetailTransferIssue = async (ptsfrdOid, qty, transaction) => {
        let result = await PtsfrdDet.update({
            ptsfrd_qty_receive: qty
        }, {
            where: {
                ptsfrd_oid: ptsfrdOid
            },
            transaction: transaction,
            logging: async (sql, {bind}) => {
                let realSql = sql.split(': ')[1];

                await insertQuery(realSql, bind);
            }
        })

        return result;
    }

    updateLocationGIT = async (invcOid, qty, qtyOld, transaction) => {
        let result = await this.updateQuantityByLocation(invcOid, qty, qtyOld, transaction);

        return result;
    }

    inputDataByProductLocation = async (locId, ptId, qty, transaction) => {
        let productInformation = await this.getProductInformation(ptId);

        await this.createDataByProductLocation(locId, productInformation, qty, transaction);
    }

    getDataQuantity = async (locId, ptId, transaction) => {
        let result = await InvcMstr.findOne({
            attributes: ['invc_oid', 'invc_qty_available'],
            where: {
                invc_loc_id: locId,
                invc_pt_id: ptId
            },
            transaction: transaction,
            logging: false
        })

        return result;
    }

    updateQuantityByLocation = async (invcOid, qty, qtyOld, transaction) => {
        let result = await InvcMstr.update({
            invc_qty_available: qty,
            invc_qty_old: qtyOld,
        }, {
            where: {
                invc_oid: invcOid
            },
            transaction: transaction,
            logging: async (sql, {bind}) => {
                let realSql = sql.split(': ')[1];

                await insertQuery(realSql, bind);
            }
        })

        return result;
    }

    getProductInformation = async (ptId) => {
        let {dataValues} = await PtMstr.findOne({
            attributes: [
                ['pt_id', 'product_id'], 
                ['pt_en_id', 'entity_id']
            ],
            where: {
                pt_id: ptId
            }
        })

        return dataValues;
    }

    createDataByProductLocation = async (locId, dataProduct, qty, transaction) => {
        await InvcMstr.create({
            invc_oid: uuidv4(),
            invc_dom_id: 1,
            invc_en_id: dataProduct.entity_id,
            invc_si_id: 992,
            invc_loc_id: locId,
            invc_pt_id: dataProduct.product_id,
            invc_qty_available: qty,
            invc_qty_booked: 0,
            invc_qty: 0,
            invc_qty_old: 0,
            invc_qty_alloc: 0,
            invc_total: 0,
            invc_qty_booking: 0
        }, {
            transaction: transaction,
            // logging: async (sql, {bind}) => {
            //     let realSql = sql.split(': ')[1];

            //     await insertQuery(realSql, bind);
            // }
        })
    }
}

module.exports = new ShipmentController();