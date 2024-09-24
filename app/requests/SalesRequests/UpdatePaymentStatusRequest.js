const Joi = require('joi');

const schemaValidate = Joi.object({
    invoice: Joi.string().required(),
    payment_status: Joi.string().required()
})

const UpdatePaymentStatusRequest = (req, res, next) => {
    const {error} = schemaValidate.validate({
        invoice: req.params.invoice,
        payment_status: req.body.payment_status
    })

    if (error) {
        let result = error.details.map(({message}) => {
            return message
        })

        res.status(300)
            .json({
                status: 'failed',
                message: 'invalidate!',
                data: null,
                error: {
                    validation: result
                }
            })

        return;
    }

    next();
}

module.exports = UpdatePaymentStatusRequest;