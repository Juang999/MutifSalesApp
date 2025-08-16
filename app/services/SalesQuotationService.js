const moment = require('moment');
const {Op} = require('sequelize');
const {
    EnMstr,
    TransStatus,
    CodeMstr, PtMstr,
    Sequelize, LocMstr,
    PtnrMstr, PtnraAddr,
    PiddDet, PidDet, PiMstr,
    PtnracCntc,SqMstr, SqdDet, 
} = require('../../models');
const {insertQuery, insertBulkQuery} = require('../../helper/InputQueryIntoSqlOut');

class SalesQuotationService {
    retrieveDataInvoice = async (date, search, userPartnerId) => {
        let result = SqdDet.findAll({
            attributes: [
                [Sequelize.col(`"header_sq"."sq_midtrans_inv_number"`), 'invoice'],
                [Sequelize.col(`"header_sq"."sq_midtrans_inv_status"`), 'status'],
                [Sequelize.col(`"header_sq"."sq_date"`), 'start_date'],
                [Sequelize.col(`"header_sq"."sq_need_date"`), 'end_date'],
                [Sequelize.literal(`CAST(SUM((sqd_price * sqd_qty) - (sqd_price * sqd_qty * sqd_disc)) AS BIGINT)`), 'total_purchase'],
                [Sequelize.fn('MAX', Sequelize.col(`"header_sq"."sq_add_date"`)), 'date'],
            ],
            include: [
                {
                    model: SqMstr,
                    as: 'header_sq',
                    attributes: []
                }
            ],
            where: [
                Sequelize.where(Sequelize.literal(`date("header_sq"."sq_add_date")`), {
                    [Op.between]: [date.startDate, date.endDate]
                }),
                Sequelize.where(Sequelize.col(`"header_sq"."sq_midtrans_inv_number"`), {
                    [Op.iLike]: `%${search}%`
                }),
                Sequelize.where(Sequelize.col(`"header_sq"."sq_midtrans_inv_number"`), {
                    [Op.not]: null
                }),
                Sequelize.where(Sequelize.col('"header_sq"."sq_ptnr_id_sold"'), {
                    [Op.eq]: userPartnerId
                })
            ],
            group: ['invoice', 'status', 'start_date', 'end_date']
        })
    
        return result;
    }

    getHeaderInvoice = async (invoiceNumber, ptnrId) => {
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
    }

    getDetailInvoice = async (invoiceNumber, ptnrId) => {
        let result = await SqdDet.findAll({
            attributes: [
                [Sequelize.col('product.pt_desc_jubelio'), 'product_name'],
                [Sequelize.col('product.pt_code'), 'product_code'],
                [Sequelize.col('product.pt_weight'), 'weight'],
                [Sequelize.literal('CAST(SUM(sqd_qty) AS INTEGER)'), 'qty_product'],
                [Sequelize.literal('CAST(SUM(sqd_price) AS INTEGER)'), 'price'],
                [Sequelize.literal('ROUND(sqd_disc, 2)'), 'discount'],
                [Sequelize.literal(`CONCAT('https://cdn.mutif.biz.id/thumbnail/', "product"."pt_code", '.jpg')`), 'image'],
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
            group: [
                'product_name',
                'product_code',
                'weight',
                'discount',
                'image'
            ],
            logging: false
        })

        return result;

        // let dataProducts = await this.getProducts(invoiceNumber, ptnrId);
        // let result = [];

        // if (dataProducts.length > 0) {
        //     for (const {dataValues} of dataProducts) {
        //         let imageProduct = await this.getImageProduct(dataValues.product_code);
    
        //         let photo = (imageProduct === '-') ? null : imageProduct;
        //         result.push({
        //             product_name: dataValues.product_name,
        //             product_code: dataValues.product_code,
        //             weight: dataValues.weight,
        //             qty_product: dataValues.qty_product,
        //             price: dataValues.price,
        //             discount: dataValues.discount,
        //             image: photo
        //         })
        //     }    
        // }

        // return result || null;
    }

    getHeaderSalesQuotation = async (invoiceNumber) => {
        let result = await SqMstr.findAll({
            attributes: [
                'sq_dom_id',
                'sq_en_id',
                'sq_add_by',
                'sq_ptnr_id_sold',
                'sq_ptnr_id_bill',
                'sq_credit_term',
                'sq_taxable',
                'sq_tax_class',
                'sq_si_id',
                'sq_type',
                'sq_sales_person',
                'sq_pay_type',
                'sq_pay_method',
                'sq_ar_ac_id',
                'sq_ar_sb_id',
                'sq_ar_cc_id',
                'sq_dp',
                'sq_disc_header',
                'sq_total',
                'sq_cu_id',
                'sq_total_ppn',
                'sq_total_pph',
                'sq_payment',
                'sq_exc_rate',
                'sq_tax_inc',
                'sq_cons',
                'sq_terbilang',
                'sq_bk_id',
                'sq_interval',
                'sq_ppn_type',
                'sq_is_package',
                'sq_oid',
                'sq_code',
                'sq_ptsfr_loc_id',
                'sq_ptsfr_loc_to_id',
                'sq_ptsfr_loc_git'
            ],
            where: {
                sq_midtrans_inv_number: invoiceNumber,
                sq_midtrans_inv_status: 'settlement'
            }
        })

        return result;
    }

    getDetailSalesQuotation = async (invoiceNumber) => {
        let result = await SqdDet.findAll({
            attributes: [
                'sqd_dom_id',
                'sqd_en_id',
                'sqd_add_by',
                'sqd_seq',
                'sqd_is_additional_charge',
                'sqd_si_id',
                'sqd_pt_id',
                'sqd_rmks',
                'sqd_qty',
                'sqd_qty_allocated',
                'sqd_um',
                'sqd_cost',
                'sqd_price',
                'sqd_disc',
                'sqd_sales_ac_id',
                'sqd_sales_sb_id',
                'sqd_sales_cc_id',
                'sqd_um_conv',
                'sqd_qty_real',
                'sqd_taxable',
                'sqd_tax_inc',
                'sqd_tax_class',
                'sqd_payment',
                'sqd_dp',
                'sqd_sales_unit',
                'sqd_loc_id',
                'sqd_ppn_type',
                'sqd_invc_oid',
                'sqd_invc_loc_id',
                'sqd_oid',
                'sqd_sq_oid',
            ],
            where: {
                sqd_sq_oid: {
                    [Op.in]: Sequelize.literal(`(SELECT sq_oid FROM public.sq_mstr WHERE sq_midtrans_inv_number = '${invoiceNumber}' AND sq_midtrans_inv_status = 'settlement')`)
                }
            }
        });

        return result;
    }

    countDataSalesQuotation = async () => {
            let startOfMonth = moment().startOf('months').format('YYYY-MM-DD');
            let endOfMonth = moment().endOf('months').format('YYYY-MM-DD');
    
            let result = await SqMstr.count({
                where: {
                    [Op.and]: [
                        Sequelize.where(Sequelize.literal('DATE(sq_add_date)'), {
                            [Op.between]: [startOfMonth, endOfMonth]
                        })
                    ],
                },
                logging: false,
            });
    
            return result;
    }

    getSequenceInvoiceNumber = async (day) => {
        let result = await SqMstr.findAll({
            attributes: [
                [Sequelize.literal(`COUNT(DISTINCT(sq_midtrans_inv_number)) + 1`), 'invoice_number']
            ],
            where: {
                sq_add_date: {
                    [Op.between]: [day.startDay, day.endDay]
                }
            },
            logging: false
        })

        return result;
    }

    getBookedProductByInvoiceNumber = async (invoiceNumber) => {
        let result = await SqdDet.findAll({
            attributes: ['sqd_invc_oid', 'sqd_qty_real'],
            where: {
                sqd_sq_oid: {
                    [Op.in]: Sequelize.literal(`(SELECT sq_oid FROM public.sq_mstr WHERE sq_midtrans_inv_number = '${invoiceNumber}')`)
                }
            },
        })

        return result;
    }

    updatePaymentStatus = async (invoiceNumber, paymentStatus, transactionStatus, transaction) => {
        await SqMstr.update({
                sq_upd_by: 'system',
                sq_close_date: moment().format('YYYY-MM-DD'),
                sq_upd_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                sq_trans_id: transactionStatus,
                sq_midtrans_inv_status: paymentStatus
            }, {
                where: {
                    sq_midtrans_inv_number: invoiceNumber,
                },
                individualHooks: true,
                transaction,
                logging: async (sql, {bind}) => {
                    let realSql = sql.split(': ')[1]

                    await insertQuery(realSql, bind);
                }
            })
    }

    bulkInsertHeaderSalesQuotation = async (dataHeaderSalesQuotation, transaction) => {
        await SqMstr.bulkCreate(dataHeaderSalesQuotation, {
            transaction,
            individualHooks: true,
            logging: async (sql) => {
                const regexPattern = /Executing \([a-f0-9-]+\):/;
                const realSql = sql.replace(regexPattern, "");

                await insertBulkQuery(realSql, 1)
            },
        })
    }

    bulkInsertDetailSalesQuotation = async (dataDetailSalesQuotation, transaction) => {
        await SqdDet.bulkCreate(dataDetailSalesQuotation, {
            transaction,
            individualHooks: true,
            logging: async (sql) => {
                const regexPattern = /Executing \([a-f0-9-]+\):/;
                const realSql = sql.replace(regexPattern, "");

                await insertBulkQuery(realSql, 2)
            },
        })
    }

    getAllHeaderSalesQuotation = async (search, startDate, endDate) => {
        let where = [
                Sequelize.where(Sequelize.literal(`DATE("sq_add_date")`), {
                    [Op.between]: [startDate, endDate]
                }),
                Sequelize.where(Sequelize.col(`"sq_midtrans_inv_number"`), {
                    [Op.iLike]: `%${search.invoice}%`
                }),
            ]

        if (search.dropshipper) {
            where.push(Sequelize.where(Sequelize.col(`"sq_dropshipper"`), {
                [Op.eq]: search.dropshipper
            }))
        }

        if (search.payment_type) {
            where.push(Sequelize.where(Sequelize.col(`"sq_pay_type"`), {
                [Op.eq]: search.payment_type
            }))
        }

        const result = await SqMstr.findAll({
            attributes: [
                ['sq_midtrans_inv_number', 'invoice'],
                'sq_add_by',
                [Sequelize.literal(`MAX(sq_add_date)`), 'sq_add_date'],
                [Sequelize.col(`"sold_to".""ptnr_name"`), 'sold_to_name'],
                [Sequelize.col(`"bill_to".""ptnr_name"`), 'bill_to_name'],
                [Sequelize.col(`"sales_person".""ptnr_name"`), 'sales_name'],
                'sq_trans_rmks',
                'sq_first_name',
                'sq_last_name',
                'sq_dropshipper',
                'sq_booking',
                'sq_cons',
                [Sequelize.literal(`"pay_type"."code_name"`), 'payment_type'],
                [Sequelize.literal(`"status"."trans_desc"`), 'status_transaction'],
                'sq_midtrans_inv_status',
                'sq_shipping_name',
                'sq_shipping_service',
            ],
            include: [
                {
                    model: PtnrMstr,
                    as: 'sold_to',
                    attributes: []
                }, {
                    model: PtnrMstr,
                    as: 'bill_to',
                    attributes: []
                }, {
                    model: PtnrMstr,
                    as: 'sales_person',
                    attributes: []
                }, {
                    model: CodeMstr,
                    as: 'pay_type',
                    attributes: []
                }, {
                    model: TransStatus,
                    as: 'status',
                    attributes: []
                }
            ],
            where,
            order: [
                ['sq_add_date', 'DESC']
            ],
            group: [
                'sq_midtrans_inv_number',
                'sq_add_by',
                'sq_trans_rmks',
                'sq_first_name',
                'sq_last_name',
                'sq_dropshipper',
                'sq_booking',
                'sq_cons',
                'sq_midtrans_inv_status',
                'sq_shipping_name',
                'sq_shipping_service',
                Sequelize.col(`"sold_to".""ptnr_name"`),
                Sequelize.col(`"bill_to".""ptnr_name"`),
                Sequelize.col(`"sales_person".""ptnr_name"`),
                Sequelize.literal(`"pay_type"."code_name"`),
                Sequelize.literal(`"status"."trans_desc"`),
            ]
        });

        return result;
    }

    adminGetHeaderInvoice = async (invoiceNumber) => {
        let result = await SqMstr.findOne({
            attributes: [
                ['sq_midtrans_inv_number', 'invoice'],
                [Sequelize.literal(`DATE(sq_add_date)`), 'date'],
                [Sequelize.col(`bill_to.ptnr_name`), 'partner_name'],
                [Sequelize.literal(`CONCAT("bill_to->singular_partner_address"."ptnra_line_3", ', ', "bill_to->singular_partner_address"."ptnra_line_2", ', ', "bill_to->singular_partner_address"."ptnra_line_1")`), 'partner_address'],
                [Sequelize.literal(`"bill_to->singular_partner_address->singular_contact_address"."ptnrac_phone_1"`), 'phone'],
                [Sequelize.literal(`"bill_to->singular_partner_address->singular_contact_address"."ptnrac_email"`), 'email'],
                [Sequelize.literal(`CASE WHEN sq_dropshipper = 'Y' THEN sq_full_address ELSE NULL END`), 'dropshipper_address'],
                [Sequelize.literal(`CASE WHEN sq_dropshipper = 'Y' THEN sq_phone_number ELSE NULL END`), 'dropshipper_phone'],
                [Sequelize.literal(`CASE WHEN sq_dropshipper = 'Y' THEN sq_email ELSE NULL END`), 'dropshipper_email'],
                ['sq_first_name', 'dropshipper_first_name'],
                ['sq_last_name', 'dropshipper_last_name'],
                'sq_dropshipper',
                'sq_trans_rmks',
                [Sequelize.col(`"pay_type"."code_name"`), 'payment_type'],
                [Sequelize.col('"sales_person"."ptnr_name"'), 'sales_name'],
                ['sq_shipping_name', 'shipping_name'],
                ['sq_shipping_service', 'shipping_service'],
                ['sq_shipping_charges', 'shipping_charges'],
                ['sq_midtrans_inv_status', 'status'],
                ['sq_link_resi', 'resi_link']
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
            },
            logging: false
        }) 

        console.info(result)

        return {
            invoice: (result) ? result.dataValues.invoice : null,
            date: (result) ? result.dataValues.date : null,
            partner_name: (result) ? result.dataValues.partner_name : null,
            partner_address: (result) ? result.dataValues.partner_address : null,
            partner_phone: (result) ? result.dataValues.phone : null,
            partner_email: (result) ? result.dataValues.email : null,
            dropshipper_address: (result) ? result.dataValues.dropshipper_address : null,
            dropshipper_phone: (result) ? result.dataValues.dropshipper_phone : null,
            dropshipper_email: (result) ? result.dataValues.dropshipper_email : null,
            sales_person: (result) ? result.dataValues.sales_name : null,
            dropshipper: (result) ? result.dataValues.sq_dropshipper : null,
            dropshipper_first_name: (result) ? result.dataValues.dropshipper_first_name : null,
            dropshipper_last_name: (result) ? result.dataValues.dropshipper_last_name : null,
            remarks: (result) ? result.dataValues.sq_trans_rmks : null,
            first_name: (result) ? result.dataValues.sq_first_name : null,
            last_name: (result) ? result.dataValues.sq_last_name : null,
            payment_type: (result) ? result.dataValues.payment_type : null,
            shipping_name: (result) ? result.dataValues.shipping_name : null,
            shipping_service: (result) ? result.dataValues.shipping_service : null,
            shipping_charges: (result) ? result.dataValues.shipping_charges : null,
            status: (result) ? result.dataValues.status : null,
            resi_link: (result) ? result.dataValues.resi_link : null,
        };
    }

    adminGetDetailInvoice = async (invoiceNumber) => {
        let result = await SqdDet.findAll({
            attributes: [
                [Sequelize.literal('CASE WHEN sqd_pt_id = 105 THEN "product"."pt_desc1" ELSE "product"."pt_desc_jubelio" END'), 'product_name'],
                [Sequelize.col('product.pt_code'), 'product_code'],
                [Sequelize.literal('CASE WHEN "product"."pt_weight" IS NOT NULL THEN "product"."pt_weight" ELSE 600 END'), 'weight'],
                [Sequelize.literal('CAST(SUM(sqd_qty) AS INTEGER)'), 'qty_product'],
                [Sequelize.literal('CAST(SUM(sqd_price) AS INTEGER)'), 'price'],
                [Sequelize.literal('ROUND(sqd_disc, 2)'), 'discount'],
                [Sequelize.literal(`CONCAT('https://cdn.mutif.biz.id/thumbnail/', "product"."pt_code", '.jpg')`), 'image'],
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
                    [Op.in]: Sequelize.literal(`(SELECT sq_oid FROM public.sq_mstr WHERE sq_midtrans_inv_number = :invoice_number)`)
                }
            },
            group: [
                'product_name',
                'product_code',
                'weight',
                'discount',
                'image'
            ],
            replacements: {
                invoice_number: invoiceNumber
            },
            logging: false
        })

        return result;
    }

    adminGetSalesQuotationCode = async (invoiceNumber) => {
        let result = await SqMstr.findAll({
            attributes: [
                'sq_code',
                [Sequelize.literal(`"entity"."en_desc"`), 'entity_name']
            ],
            include: [
                {
                    model: EnMstr,
                    as: 'entity',
                    attributes: []
                }
            ],
            where: {
                sq_midtrans_inv_number: invoiceNumber
            },
            logging: false
        })

        return result;
    }
}

module.exports = new SalesQuotationService();