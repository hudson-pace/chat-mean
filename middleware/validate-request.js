/* validates the body of a request against a Joi schema object */

module.exports = validateRequest;

function validateRequest(req, next, schema) {
    var options = {
        abortEarly: false,
        allowUnknown: true,
        stripUnknown: true
    };
    var {error, value} = schema.validate(req.body, options);
    if (error) {
        next(`Validation error: ${error.details.map(x => x.message).join(', ')}`);
    }
    else {
        req.body = value;
        next();
    }
}