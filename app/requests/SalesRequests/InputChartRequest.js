const Joi = require('joi');

const validation = Joi.object({
    pt_id: Joi.number().required(),
    en_id: Joi.number().required(),
    invc_oid: Joi.string().required(),
    qty: Joi.number().required(),
    pi_id: Joi.number().required(),
})

const InputChartRequest = (req, res, next) => {
    let inputChartValidate = validation.validate(req.body, {
        abortEarly: false
    })

    if (inputChartValidate.error) {
        res.status(300)
            .json({
                status: 'failed',
                message: 'field required',
                data: null,
                error: inputChartValidate.error.details.map(element => {
                            return element.message
                        })
            })

        return;
    }

    next();
}

module.exports = InputChartRequest;