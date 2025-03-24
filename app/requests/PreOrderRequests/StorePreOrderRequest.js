const joi = require('joi');

const validation = joi.object({
    product_id: joi.string().required(),
    quantity: joi.string().required(),
    entity_id: joi.string().required(),
    inventory_oid: joi.string().required(),
    pricelist_id: joi.string().required()
})

const StorePreOrderRequest = (req, res, next) => {
    let storeValidate = validation.validate(req.body, {
        abortEarly: false
    })

    if (storeValidate.error) {
        let error = storeValidate.error.details.map(element => {
            return element.message
        })

        res.status(300)
            .json({
                status: 'invalidate',
                message: 'field required',
                data: null,
                error: error
            })

        return;
    }

    next();
}

module.exports = StorePreOrderRequest;