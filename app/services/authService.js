'use strict';

const { API_AUTH_KEY } = require('../../config');
const { decryptJwt, convertIdToMongooseId } = require("../utils/utils");
const { createErrorResponse } = require("../helpers");
const userService = require('./userService');
const dbService = require('./dbService')
const { conversationRoomModel, sessionModel } = require('../models');
const { MESSAGES, ERROR_TYPES, SOCKET_EVENTS, TOKEN_TYPES, AVAILABLE_AUTHS, USER_TYPE, NORMAL_PROJECTION } = require('../utils/constants');

let authService = {};

authService.validateApiKey = () => {
    return (request, response, next) => {
        if (request.headers['x-api-key'] == API_AUTH_KEY) {
            return next();
        }
        let responseObject = createErrorResponse(MESSAGES.UNAUTHORIZED, ERROR_TYPES.UNAUTHORIZED);
        return response.status(responseObject.statusCode).json(responseObject);
    };
};

/**
 * function to authenticate user.
 */
authService.userValidate = (authType) => {
    return (request, response, next) => {
        validateUser(request, authType).then((isAuthorized) => {
            if(typeof(isAuthorized) == 'string'){
                let responseObject = createErrorResponse(MESSAGES.FORBIDDEN(request.method, request.url), ERROR_TYPES.FORBIDDEN);
                return response.status(responseObject.statusCode).json(responseObject);
            }
            if (isAuthorized) {
                return next();
            }
            let responseObject = createErrorResponse(MESSAGES.UNAUTHORIZED, ERROR_TYPES.UNAUTHORIZED);
            return response.status(responseObject.statusCode).json(responseObject);
        }).catch((err) => {
            let responseObject = createErrorResponse(MESSAGES.UNAUTHORIZED, ERROR_TYPES.UNAUTHORIZED);
            return response.status(responseObject.statusCode).json(responseObject);
        });
    };
};

/**
 * function to validate user's token and fetch its details from the system. 
 * @param {} request 
 */
let validateUser = async (request, authType) => {
    try {
        const session = await decryptJwt( request.headers.authorization );
        if(!session){
            return false;
        }

        // checking session with sessionId
        const existingSession = await dbService.findOne(sessionModel, { userId: convertIdToMongooseId(session.userId), sessionId: session.sessionId });
        if (!existingSession) return false;
    
        const user = await userService.findOne({ _id: convertIdToMongooseId(session.userId) }, {...NORMAL_PROJECTION });

        if (!user) {
            return false;
        }

        request.session = {
            token: request.headers.authorization
        };
        request.user = user;
        return true;
    } catch (err) {
        return false;
    }
};

/*
 * function to authenticate socket token
 */
authService.socketAuthentication = async (socket, next) => {
    try {
        let session = await decryptJwt(socket.handshake.query.authorization);
        if (!session){
            return next({ success: false, message: MESSAGES.UNAUTHORIZED });
        }

        let user = await userService.findOne({ _id: session.userId });
        if (!user) {
            return next({ success: false, message: MESSAGES.UNAUTHORIZED });
        }
        const userId = session.userId.toString();

        socket.id = userId

        let groupData = await dbService.find(conversationRoomModel, { "members.userId": { $eq: socket.id }, $or: [{ expiryTime: { $gt: new Date() } }, { expiryTime: { $eq: null } }] });
        if (!groupData){
            return ({ success: false, message: MESSAGES.NOT_FOUND });
        }
        
        for(let data of groupData){
            socket.join(data.uniqueCode) 
        }

        return next();
    }
    catch (err) {
        return next({success: false, message: MESSAGES.SOMETHING_WENT_WRONG});
    }
};

module.exports = authService;