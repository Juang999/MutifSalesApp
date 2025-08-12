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
    first_name: Joi.string().optional(),
    last_name: Joi.string().optional(),
    address: Joi.string().required(),
    city: Joi.string().required(),
    email: Joi.string().email().optional(),
    phone: Joi.string().optional(),
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