'use strict';

const fs = require("fs");
const pino = require("pino");
const BCRYPT = require("bcrypt");
const JWT = require("jsonwebtoken");
const MONGOOSE = require('mongoose');
const CONSTANTS = require('./constants');
const admin = require("firebase-admin");
const {FIREBASE} = require("../../config")
const qr = require('qrcode'); 
const axios = require("axios")
const util = require('util');
const generateQrAsync = util.promisify(qr.toDataURL);

const sessionModel = require('../models/sessionModel');
const { createPinoBrowserSend, createWriteStream } = require("pino-logflare");
const { SMTP, WEB_URL, ADMIN_WEB_URL, PINO, ENVIRONMENT, LIVE_LOGGER_ENABLE } = require('../../config');
const CONFIG = require("../../config");

const PINO_CRED = { apiKey: PINO.API_KEY, sourceToken: PINO.API_SECRET };

const stream = createWriteStream( PINO_CRED ); // create pino-logflare stream
const send = createPinoBrowserSend( PINO_CRED ); // create pino-logflare browser stream

let commonFunctions = {};

/**
 * incrypt password in case user login implementation
 * @param {*} payloadString 
 */
commonFunctions.hashPassword = (payloadString) => {
    return BCRYPT.hashSync(payloadString, CONSTANTS.SECURITY.BCRYPT_SALT);
};

/**
 * @param {string} plainText 
 * @param {string} hash 
 */
commonFunctions.compareHash = (payloadPassword, userPassword) => {
    return BCRYPT.compareSync(payloadPassword, userPassword);
};

/**
 * function to get array of key-values by using key name of the object.
 */
commonFunctions.getEnumArray = (obj) => {
    return Object.keys(obj).map(key => obj[key]);
};

/** 
 * used for converting string id to mongoose object id
 */
commonFunctions.convertIdToMongooseId = (stringId) => {
    if(!stringId) return;
    return MONGOOSE.Types.ObjectId(stringId);
};

/** used for comare mongoose object id */
commonFunctions.matchMongoId = (id1, id2) => {
    if(!id1 || !id2) return false;
    return id1.toString() == id2.toString();
};

/**
 * create jsonwebtoken
 */
commonFunctions.encryptJwt = (payload) => {
    return JWT.sign(payload, CONSTANTS.SECURITY.JWT_SIGN_KEY, { algorithm: 'HS256'});
};

/**
 * decrypt jsonwebtoken
 */
commonFunctions.decryptJwt = (token) => {
    return JWT.verify(token, CONSTANTS.SECURITY.JWT_SIGN_KEY, { algorithm: 'HS256' })
};

/**
 * function to convert an error into a readable form.
 * @param {} error 
 */
commonFunctions.convertErrorIntoReadableForm = (error) => {
    let errorMessage = '';
    if (error.message.indexOf("[") > -1) {
        errorMessage = error.message.substr(error.message.indexOf("["));
    } else {
        errorMessage = error.message;
    }
    errorMessage = errorMessage.replace(/"/g, '');
    errorMessage = errorMessage.replace('[', '');
    errorMessage = errorMessage.replace(']', '');
    error.message = errorMessage;
    return error;
};

/**
 * Logger for error and success
 */
commonFunctions.log = {
    info: (data) =>{
        console.log('\x1b[33m' + data,'\x1b[0m');
    },
    success: (data) =>{
        console.log('\x1b[32m' + data,'\x1b[0m');
    },
    error: (data) =>{
        console.log('\x1b[31m' + data,'\x1b[0m');
    },
    default: (data) =>{
        console.log(data, '\x1b[0m');
    }
};

/**
 * function to get pagination condition for aggregate query.
 * @param {*} sort 
 * @param {*} skip 
 * @param {*} limit 
 */
commonFunctions.getPaginationConditionForAggregate = (sort, skip, limit) => {
    let condition = [
        ...(!!sort ? [{ $sort: sort }] : []),
        { $skip: skip },
        { $limit: limit }
    ];
    return condition;
};

/**
 * Send an email to perticular user mail 
 * @param {*} email email address
 * @param {*} subject  subject
 * @param {*} content content
 * @param {*} cb callback
 */
commonFunctions.sendEmail = async (userData, type) => {
    const transporter = require('nodemailer').createTransport(SMTP.TRANSPORT);
    const handleBars = require('handlebars');
    /** setup email data with unicode symbols **/
    const mailData = commonFunctions.emailTypes(userData, type), email = userData.email, ccEmail = userData.ccEmail, bccEmail = userData.bccEmail;
    let template="";
    let result="";
    if(mailData && mailData.template){
        template = handleBars.compile(mailData.template);
    }
    if(template){
        result = template(mailData.data);
    }
    
    let emailToSend = {
        to: email,
        cc: ccEmail,
        bcc: bccEmail,
        from: SMTP.SENDER,
        subject: mailData.Subject
    }
    if(userData.attachments && userData.attachments.length){
        emailToSend.attachments = userData.attachments;
    }
    if (result) {
        emailToSend.html = result;
    }
    if(userData.icalEvent){
        emailToSend.icalEvent = userData.icalEvent;
    }
    return await transporter.sendMail(emailToSend);
};

/**
 * function to create template
 */
commonFunctions.emailTypes = (user, type) => {
    let EmailStatus = {
        Subject: '',
        data: {},
        template: ''
    };
    switch (type) {
        case CONSTANTS.EMAIL_TYPES.WELCOME_EMAIL:
            EmailStatus['Subject'] = CONSTANTS.EMAIL_SUBJECTS.WELCOME_EMAIL;
            EmailStatus.template = CONSTANTS.EMAIL_CONTENTS.WELCOME_EMAIL;
            EmailStatus.data['name'] = user.name;
            break;

        default:
            EmailStatus['Subject'] = 'Welcome Email!';
            break;
    }
    return EmailStatus;
};

/**
 * function to make email template dynamic.
 */
commonFunctions.renderTemplate = (template, data) => {
    return handlebars.compile(template)(data);
};

/**
 * function to create reset password link.
 */
commonFunctions.createResetPasswordLink = (userData) => {
    let dataForJWT = { _id: userData._id, Date: Date.now, email: userData.email };
    let baseUrl = (userData.userType == CONSTANTS.USER_TYPE.STAFF) ? WEB_URL : ADMIN_WEB_URL;
    let resetPasswordLink = baseUrl + '/reset-password/' + commonFunctions.encryptJwt(dataForJWT);
    return resetPasswordLink;
};

/**
 * function to generate random otp string
 */
commonFunctions.generateOTP = (length) => {
    let chracters = '0123456789';
    let randomString = '';
    for (let i = length; i > 0; --i)
        randomString += chracters[Math.floor(Math.random() * chracters.length)];

    return randomString;
};

/**
 * function to generate random hex color code
 */
commonFunctions.generateColorCode = ()=>{
    var letters = '04DEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * letters.length)];
    }
    return color;
}


/**
 * function to returns a random number between min and max (both included) 
 */
commonFunctions.getRandomInteger = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Function to generate expiry time in seconds
 */
commonFunctions.generateExpiryTime = (seconds) => {
    return new Date(new Date().setSeconds(new Date().getSeconds() + seconds));
};

/**
 * function to convert seconds in HMS string
 */
commonFunctions.convertSecondsToHMS = (value) => {
    const sec = parseInt(value, 10);
    let hours   = Math.floor(sec / 3600);
    let minutes = Math.floor((sec - (hours * 3600)) / 60);
    let seconds = sec - (hours * 3600) - (minutes * 60);
    str = ''
    if(hours) str = str + hours + (hours > 1 ? ' Hours': ' Hour')
    if(minutes) str = str+' ' + minutes + (minutes > 1 ? ' Minutes': ' Minute')
    if(seconds) str = str+' ' + seconds + (seconds > 1 ? ' Seconds': ' Second')

    return str.trim();
}

/**
 * Variable to create logging
 */
commonFunctions.logger = (() => {
    if(LIVE_LOGGER_ENABLE){
        return pino({
            browser: {
                transmit: {
                    send,
                },
            }
        }, stream);
    }

    if (!fs.existsSync('./error.log')) {
        fs.writeFileSync('./error.log', "")
    }
    return pino(pino.destination('./error.log'));
})();

/**
 * function to valiadte mongooseId 
 */
commonFunctions.validateMongooseId = (objectId) => {
    return objectId == new MONGOOSE.Types.ObjectId(objectId)
};

/**
 * function to create mongooseId 
 */
commonFunctions.createMongooseId = () => {
    return MONGOOSE.Types.ObjectId()
};

/**
 * sending fcm push
 */
let flag = 0
commonFunctions.sendFCMNotification = async (tokens, payload, notificationType, sound = "default") => {
    if (flag == 0) {
        admin.initializeApp({
            credential: admin.credential.cert(FIREBASE.WEB_SERVER_FCM_KEY)
        });
        flag++;
    }

    let data = {};

    if(notificationType === CONSTANTS.NOTIFICATION_TYPE.CALL){
        data = {
            uniqueCode : payload.uniqueCode,
            streamName: payload.streamName,
            callStatus : payload.callStatus,
            callType : payload.type.toString()
        }

        if (payload.startTimeStamp) data["startTimeStamp"] = payload.startTimeStamp;
    }

    if(notificationType === CONSTANTS.NOTIFICATION_TYPE.MESSAGE) {
        data = { 
            message: payload.message,
            roomId: payload.roomId,
            userId: payload.userId,
            messageId: payload.messageId,
            username: payload.username,
            publicAddress: payload.publicAddress,
            uniqueCode: payload.uniqueCode,
            color: payload.color,
            members: JSON.stringify(payload.members),
            _id: JSON.stringify(payload._id),
            createdBy: JSON.stringify(payload.createdBy)
        }
    }

    // This registration token comes from the client FCM SDKs.
    let message = {
        data,
        tokens
    }
    // Send a message to the device corresponding to the provided
    // registration token.
    admin.messaging().sendMulticast(message)
        .then((response) => {
            // Response is a message ID string.
            console.log("Notification Sent Successfully.")
            // createSuccessResponse(CONSTANTS.MESSAGES.NOTIFICATION_SENT_SUCCESSFULLY);
        })
        .catch((error) => {
            console.log(error.message, "Error Occurred in sending the notification.");
        });
};

commonFunctions.generateQrCode = async (data) => {
    let strData = JSON.stringify(data) 
    const qr = await generateQrAsync(strData)
    return qr
}

commonFunctions.createDeepLink = async (data = "", value = "", route) => {
    let url = `https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${CONFIG.FCM.DEEP_LINK_KEY}`;
    return await axios.post(url,
        {
            "dynamicLinkInfo": {
                "domainUriPrefix": "https://mejhoolapp.page.link",
                "link": `https://mejhool.com/${route}?` + data + "=" + value ,

                "androidInfo": {
                    "androidPackageName": CONFIG.FCM.ANDROID_PACKAGE_NAME,
                },
                "iosInfo": {
                    "iosBundleId": CONFIG.FCM.IOS_PACKAGE_NAME,
                },
                "navigationInfo": {
                    "enableForcedRedirect": "1"
                }
            }
        })
}

// middleware for loggin req ip address
commonFunctions.getIpAddress = (req, res, next) => {
   const clientIp = requestIp.getClientIp(req);
   console.log({ ip: req.ip, ip2: req.socket.remoteAddress, headerIp: req.headers['x-forwarded-for'], socketIp: req.connection.remoteAddress, clientIp })
    next()
}

module.exports = commonFunctions;