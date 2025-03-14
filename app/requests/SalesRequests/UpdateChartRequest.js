const Joi = require('joi');

const validation = Joi.array().items(Joi.object({
    cs_oid: Joi.string().required(),
    cs_qty: Joi.number().required(),
}))

const updateChartRequest = (req, res, next) => {

    let updateChartValidate = validation.validate(req.body.updateData, {
        abortEarly: false
    })

    if (updateChartValidate.error) {
        res.status(300)
            .json({
                status: 'failed',
                message: 'field required',
                data: null,
                error: updateChartValidate.error.details.map(element => {
                            return element.message
                        })
            })

        return;
    }

    next();
}

module.exports = updateChartRequest;