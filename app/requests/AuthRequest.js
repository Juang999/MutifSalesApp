const Joi = require('joi');

const validation = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
})

const AuthRequest = (req, res, next) => {
    let loginValidate = validation.validate(req.body, {
        abortEarly: false
    })

    if (loginValidate.error) {
        let error = loginValidate.error.details.map(element => {
            return element.message
        })

        res.status(300)
            .json({
                status: 'failed',
                message: 'field required',
                data: null,
                error: error
            })

        return;
    }

    next();
}

module.exports = AuthRequest;