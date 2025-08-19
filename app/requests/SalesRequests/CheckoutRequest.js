const Joi = require('joi');

const schemaValidate = Joi.object({
    payment_type: Joi.number().required(),
    payment_method: Joi.number().required(),
    shipping_name: Joi.string().required(),
    shipping_cost: Joi.number().required(),
    invoice_number: Joi.string().required(),
    is_consigment: Joi.string().required(),
    referral_code: Joi.string().optional(),
    transaction_type: Joi.string().optional(),
    remarks: Joi.string().optional(),
    sales_person_id: Joi.number().required(),
    first_name: Joi.string().optional().allow('', null),
    last_name: Joi.string().optional().allow('', null),
    address: Joi.string().optional().allow('', null),
    city: Joi.string().optional().allow('', null),
    email: Joi.string().optional().allow('', null),
    phone: Joi.string().optional().allow('', null),
    resi_link: Joi.string().optional().allow('', null),
})

const CheckoutRequest = (req, res, next) => {
    let {error} = schemaValidate.validate(req.body, {
        abortEarly: false
    })

    if (error) {
        let validation = error.details.map(({message}) => {
            return message
        })

        res.status(300)
            .json({
                status: 'failed',
                message: 'Validation Error',
                data: null,
                error: {validation}
            })

        return
    }

    next()
}

module.exports = CheckoutRequest;