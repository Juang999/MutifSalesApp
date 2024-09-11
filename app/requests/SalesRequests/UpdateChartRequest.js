const Joi = require('joi');

const validation = Joi.object({
    cs_oid: Joi.string().required(),
    qty: Joi.number().required(),
})

const updateChartRequest = (req, res, next) => {
    let updateChartValidate = validation.validate({
        cs_oid: req.params.cs_oid,
        qty: req.body.cs_qty
    }, {
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