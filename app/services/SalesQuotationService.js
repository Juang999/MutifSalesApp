const moment = require('moment');
const {Op} = require('sequelize');
const {
    Sequelize,
    CodeMstr, PtMstr,
    PtnrMstr, PtnraAddr,
    PtnracCntc,SqMstr, SqdDet, 
} = require('../../models');
const {insertQuery, insertBulkQuery} = require('../../helper/InputQueryIntoSqlOut');

class SalesQuotationService {
    retrieveDataInvoice = async (date, search, userPartnerId) => {
        try {
            
            let dataInvoice = await SqMstr.findAll({
                        attributes: [
                            [Sequelize.literal('sq_midtrans_inv_number'), 'invoice'],
                            ['sq_midtrans_inv_status', 'status'],
                            [Sequelize.col(`"sq_date"`), 'start_date'],
                            [Sequelize.col(`"sq_need_date"`), 'end_date'],
                            [Sequelize.literal(`CAST(SUM(sq_total) AS INTEGER)`), 'total_purchase'],
                            [Sequelize.fn('MAX', Sequelize.col(`"sq_add_date"`)), 'date'],
                        ],
                        where: [
                            Sequelize.where(Sequelize.literal(`date("sq_add_date")`), {
                                [Op.between]: [date.startDate, date.endDate]
                            }),
                            Sequelize.where(Sequelize.col(`"sq_midtrans_inv_number"`), {
                                [Op.iLike]: `%${search}%`
                            }),
                            Sequelize.where(Sequelize.col(`"sq_midtrans_inv_number"`), {
                                [Op.not]: null
                            }),
                            Sequelize.where(Sequelize.col('sq_ptnr_id_sold'), {
                                [Op.eq]: userPartnerId
                            })
                        ],
                        group: [
                            'sq_midtrans_inv_number',
                            'sq_midtrans_inv_status',
                            'sq_date',
                            'sq_need_date',
                        ],
                        order: [
                            ['sq_date', 'DESC'],
                            ['sq_midtrans_inv_number', 'DESC'],
                        ],
                        logging: false
                    })
    
            return dataInvoice;
        } catch (error) {
            return error.message
        }
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
                [Sequelize.col('product.pt_desc1'), 'product_name'],
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
            logging: false
        })

        return result;
    }

    updatePaymentStatus = async (invoiceNumber, paymentStatus, partnerId, transaction) => {
        await SqMstr.update({
                sq_midtrans_inv_status: paymentStatus
            }, {
                where: {
                    sq_midtrans_inv_number: invoiceNumber,
                    sq_ptnr_id_sold: partnerId
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
}

module.exports = new SalesQuotationService();