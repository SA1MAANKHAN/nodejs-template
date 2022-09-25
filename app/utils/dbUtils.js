'use strict';

const CONSTANTS = require('../utils/constants');
const { encryptJwt, generateOTP, generateExpiryTime} = require('../utils/utils');
const { ENVIRONMENT } = require('../../config');

const { dbService, userService } = require('../services');
const { sessionModel } = require('../models');
const { SOCKET_EVENTS, MESSAGES } = require('../utils/constants');
const dbUtils = {};

/**
* function to check valid reference from models.
*/
dbUtils.checkValidReference = async (document, referenceMapping) => {
    for (let key in referenceMapping) {
        let model = referenceMapping[key];
        if (!!document[key] && !(await model.findById(document[key]))) {
            throw CONSTANTS.RESPONSE.ERROR.BAD_REQUEST(key + ' is invalid.');
        }
    }
};


/**
 * function to create sessions 
 */
 dbUtils.createSession = async (payload) => {
    let sessionData = {};

    sessionData.token = encryptJwt({
        userId: payload.userId,
        sessionId: payload.sessionId,
        date: Date.now()
    });

    if(payload.tokenType === CONSTANTS.TOKEN_TYPES.OTP){
        sessionData.token = generateOTP(CONSTANTS.OTP_LENGTH);
        sessionData.tokenExpDate = generateExpiryTime(CONSTANTS.OTP_EXPIRIED_TIME_IN_SECONDS || 10)
    }

    if (ENVIRONMENT === 'development' || payload.tokenType != CONSTANTS.TOKEN_TYPES.LOGIN) {
        sessionData = {
            ...sessionData,
            userId: payload.userId,
            sessionId: payload.sessionId,
            userType: payload.userType,
            tokenType: payload.tokenType || CONSTANTS.TOKEN_TYPES.LOGIN
        };
        await dbService.findOneAndUpdate(sessionModel, { userId: payload.userId }, sessionData, { upsert: true });
    }
    return sessionData.token;
}

module.exports = dbUtils;