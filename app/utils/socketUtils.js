const routes = require('../routes/socketRoutes')
const { Joi } = require('./joiUtils')


let socketUtils = {};

socketUtils.route = async (packet) => {
    try {
        const result = routes.map(async (route) => {
            if (route.eventName == packet[0]) {
                await joiValidatorMethod(packet[1], route)
            }
        })
        await Promise.all(result)
    } catch (error) {
        throw error
    }
}

/**
* function to check the error of all joi validations
* @param {*} joiValidatedObject 
*/
let checkJoiValidationError = (joiValidatedObject) => {
    if (joiValidatedObject.error) throw joiValidatedObject.error;
}

/**
* function to validate request body/params/query/headers with joi schema to validate a request is valid or not.
* @param {*} route 
*/
let joiValidatorMethod = async (request, route) => {
    if (route.joiSchemaForSocket && Object.keys(route.joiSchemaForSocket).length) {    
      request = await Joi.object(route.joiSchemaForSocket).validate(request);
    checkJoiValidationError(request);
    }
};

module.exports = socketUtils