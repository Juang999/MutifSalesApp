const {
    CodeMstr,
    RegKelMstr,
    SqMstr, SqdDet, 
    PtMstr, Sequelize, 
    PtnrMstr, PtnraAddr, 
    sequelize, TConfUser, 
    PtnracCntc, RegCityMstr, 
    RegPropMstr, RegKecMstr,
    PiMstr, PidDet, PiddDet,
} = require('../../../models');
const moment = require('moment');
const {Op} = require('sequelize');
const Auth = require('../../../helper/Auth');
let {getData} = require('../../../helper/ProductUrl');
const {info, error: errorLog} = require('../../../helper/Logging');

class OrderController {
    invoiceNumberSequence = (req, res) => {
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
            logging: false
        })
        .then(([countedData]) => {
            let baseNumber = '0000';
            let dataSequence = countedData.dataValues.invoice_number;
            let invoiceNumber = baseNumber.slice(0, -dataSequence.toString().length) + dataSequence;

            res.status(200)
                .json({
                    status: 'success',
                    message: 'ok',
                    data: {invoice_number: invoiceNumber},
                    
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

    getDetailInvoiceNumber = (req, res) => {
        let {user_ptnr_id} = Auth.user();

        Promise.all([
            this.getHeaderInvoice(req.params.invoice, user_ptnr_id), 
            this.getDetailInvoice(req.params.invoice, user_ptnr_id)
        ]).then(([headerInvoice, detailInvoice]) => {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'ok',
                    data: {
                        invoice: headerInvoice.invoice,
                        date: headerInvoice.date,
                        partner_name: headerInvoice.partner_name,
                        partner_address: headerInvoice.partner_address,
                        partner_phone: headerInvoice.partner_phone,
                        partner_email: headerInvoice.partner_email,
                        sales_person: headerInvoice.sales_person,
                        payment_type: headerInvoice.payment_type,
                        shipping_name: headerInvoice.shipping_name,
                        shipping_service: headerInvoice.shipping_service,
                        shipping_charges: headerInvoice.shipping_charges,
                        status: headerInvoice.status,
                        products: detailInvoice
                    },
                    error: null
                })
        }).catch(err => {
            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: err.message
                })
        })
    }

    getInvoiceNumber = async (req, res) => {
        try {
            let startDate = (req.query.start_date) ? moment(req.query.start_date).format('YYYY-MM-DD HH:mm:ss') : moment().startOf('months').format('YYYY-MM-DD HH:mm:ss')
            let endDate = (req.query.end_date) ? moment(req.query.end_date).format('YYYY-MM-DD HH:mm:ss') : moment().endOf('months').format('YYYY-MM-DD HH:mm:ss')
            let search = (req.query.search) ? req.query.search : '';
    
            let dataInvoice = await SqMstr.findAll({
                        attributes: [
                            [Sequelize.literal('DISTINCT(sq_midtrans_inv_number)'), 'invoice'],
                            ['sq_midtrans_inv_status', 'status'],
                            [Sequelize.col(`"sq_date"`), 'start_date'],
                            [Sequelize.col(`"sq_need_date"`), 'end_date'],
                            [Sequelize.literal(`CAST(SUM(sq_total) AS INTEGER)`), 'total_purchase'],
                        ],
                        where: {
                            sq_add_date: {
                                [Op.between]: [startDate, endDate]
                            },
                            sq_code: {
                                [Op.iLike]: `%${search}%`
                            },
                            sq_midtrans_inv_number: {
                                [Op.not]: null
                            },
                            sq_ptnr_id_sold: Auth.user().user_ptnr_id
                        },
                        group: [
                            'sq_midtrans_inv_number',
                            'sq_midtrans_inv_status',
                            'sq_date',
                            'sq_need_date',
                        ],
                        // logging: false
                    })

            let result = await this.makeFormatInvoice(dataInvoice)

            res.status(200)
                .json({
                    status:'success',
                    message: 'ok',
                    data: result,
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

    getDetailUser = async (userId) => {
        

        return dataUser;
    }

    getOrderedItem = async (invoiceNumber) => {
        try {
            
            let dataItem = await SqdDet.findAll({
                attributes: [
                    [Sequelize.col('"product"."pt_desc1"'), 'product_name'],
                    [Sequelize.col('"product"."pt_code"'), 'product_code'],
                    ['sqd_qty', 'quantity_ordered'],
                    [Sequelize.col(`"product->singular_relation_price_list->singular_detail_price_list"."pidd_price"`), "price"],
                    [Sequelize.col(`"product->singular_relation_price_list->singular_detail_price_list"."pidd_disc"`), "discount"],
                ],
                include: [
                    {
                        model: PtMstr,
                        as: 'product',
                        attributes: [],
                        include: [
                            {
                                model: PidDet,
                                as: 'singular_relation_price_list',
                                attributes: [],
                                include: [
                                    {
                                        model: PiMstr,
                                        as:'master_price_list',
                                        attributes: [],
                                        where: {
                                            pi_id: {
                                                [Op.in]: [1040, 2020, 3020]
                                            }
                                        }
                                    }, {
                                        model: PiddDet,
                                        as: 'singular_detail_price_list',
                                        attributes: [],
                                        where: {
                                            pidd_payment_type: 9942
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ],
                where: {
                    sqd_sq_oid: {
                        [Op.in]: Sequelize.literal(`(SELECT sq_oid FROM public.sq_mstr WHERE sq_midtrans_inv_number = '${invoiceNumber}')`)
                    }
                }
            })
    
            return dataItem;
        } catch (error) {
            return error.message
        }
    }

    makeFormatInvoice = async (dataInvoice) => {
        let result = [];

        for (const {dataValues} of dataInvoice) {
            result.push({
                invoice: dataValues.invoice,
                status: dataValues.status,
                start_date: dataValues.start_date,
                end_date: dataValues.end_date,
                total_purchase: dataValues.total_purchase,
                date: new Date(await this.getDateInvoice(dataValues.invoice))
            })
        }

        return result.sort((a, b) => b.date.getTime() - a.date.getTime());
    }

    getDateInvoice = async (invoiceNumber) => {
        let {dataValues} = await SqMstr.findOne({
            attributes: [
                [Sequelize.literal('DATE(sq_add_date)'), 'sq_add_date']
            ],
            where: {
                sq_midtrans_inv_number: invoiceNumber
            },
            logging: false
        })

        return dataValues.sq_add_date;
    }

    getHeaderInvoice = async (invoiceNumber, ptnrId) => {
        try {
            
            let result = await SqMstr.findOne({
                attributes: [
                    ['sq_midtrans_inv_number', 'invoice'],
                    [Sequelize.literal(`DATE(sq_add_date)`), 'date'],
                    [Sequelize.col(`bill_to.ptnr_name`), 'partner_name'],
                    [Sequelize.literal(`CONCAT("bill_to->singular_partner_address"."ptnra_line_3", ', ', "bill_to->singular_partner_address"."ptnra_line_2", ', ', "bill_to->singular_partner_address"."ptnra_line_1")`), 'partner_address'],
                    [Sequelize.literal(`"bill_to->singular_partner_address->singular_contact_address"."ptnrac_phone_1"`), 'phone'],
                    [Sequelize.literal(`"bill_to->singular_partner_address->singular_contact_address"."ptnrac_email"`), 'email'],
                    [Sequelize.col(`"pay_type"."code_name"`), 'payment_type'],
                    [Sequelize.col('"sales_person"."ptnr_name"'), 'sales_name'],
                    ['sq_shipping_name', 'shipping_name'],
                    ['sq_shipping_service', 'shipping_service'],
                    ['sq_shipping_charges', 'shipping_charges'],
                    ['sq_midtrans_inv_status', 'status'],
                ],
                include: [
                    {
                        model: PtnrMstr,
                        as: 'bill_to',
                        attributes: [],
                        include: [
                            {
                                model: PtnraAddr,
                                as: 'singular_partner_address',
                                attributes: [],
                                include: [
                                    {
                                        model: PtnracCntc,
                                        as: 'singular_contact_address',
                                        attributes: [],
                                    }
                                ],
                                where: {
                                    ptnra_active: 'Y'
                                }
                            }
                        ]
                    }, {
                        model: PtnrMstr,
                        as: 'sales_person',
                        attributes: []
                    }, {
                        model: CodeMstr,
                        as: 'pay_type',
                        attributes: []
                    }
                ],
                where: {
                    sq_midtrans_inv_number: invoiceNumber,
                    sq_ptnr_id_sold: ptnrId
                },
                logging: false
            }) 
    
            return {
                invoice: (result) ? result.dataValues.invoice : null,
                date: (result) ? result.dataValues.date : null,
                partner_name: (result) ? result.dataValues.partner_name : null,
                partner_address: (result) ? result.dataValues.partner_address : null,
                partner_phone: (result) ? result.dataValues.phone : null,
                partner_email: (result) ? result.dataValues.email : null,
                sales_person: (result) ? result.dataValues.sales_name : null,
                payment_type: (result) ? result.dataValues.payment_type : null,
                shipping_name: (result) ? result.dataValues.shipping_name : null,
                shipping_service: (result) ? result.dataValues.shipping_service : null,
                shipping_charges: (result) ? result.dataValues.shipping_charges : null,
                status: (result) ? result.dataValues.status : null,
            };
        } catch (error) {
            return error.message
        }
    }

    getDetailInvoice = async (invoiceNumber, ptnrId) => {
        let dataProducts = await this.getProducts(invoiceNumber, ptnrId);
        let result = [];

        if (dataProducts.length > 0) {
            for (const {dataValues} of dataProducts) {
                let imageProduct = await this.getImageProduct(dataValues.product_code);
    
                let photo = (imageProduct === '-') ? null : imageProduct;
                result.push({
                    product_name: dataValues.product_name,
                    product_code: dataValues.product_code,
                    weight: dataValues.weight,
                    qty_product: dataValues.qty_product,
                    price: dataValues.price,
                    discount: dataValues.discount,
                    image: photo
                })
            }    
        }

        return result || null;
    }

    getProducts = async (invoiceNumber, ptnrId) => {
        let result = await SqdDet.findAll({
            attributes: [
                [Sequelize.col('product.pt_desc1'), 'product_name'],
                [Sequelize.col('product.pt_code'), 'product_code'],
                [Sequelize.col('product.pt_weight'), 'weight'],
                [Sequelize.literal('CAST(sqd_qty AS INTEGER)'), 'qty_product'],
                [Sequelize.literal('CAST(sqd_price AS INTEGER)'), 'price'],
                [Sequelize.literal('ROUND(sqd_disc, 2)'), 'discount']
            ],
            include: [
                {
                    model: PtMstr,
                    as: 'product',
                    attributes: []
                }
            ],
            where: {
                sqd_sq_oid: {
                    [Op.in]: Sequelize.literal(`(SELECT sq_oid FROM public.sq_mstr WHERE sq_midtrans_inv_number = '${invoiceNumber}' AND sq_ptnr_id_sold = ${ptnrId})`)
                }
            },
            logging: false
        })

        return result;
    }

    getImageProduct = async (productCode) => {
        let {data: getImage} = await getData(`/exapro/${productCode}/image`)

        return getImage;
    }
}

module.exports = new OrderController();