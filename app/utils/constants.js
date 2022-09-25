'use strict';

const CONFIG = require('../../config')

let CONSTANTS = {};

CONSTANTS.SERVER = {
    ONE: 1
};

CONSTANTS.SERVER_TYPES = {
    API: 'api',
    SOCKET: 'socket'
};

CONSTANTS.NOTIFICATION_TYPE={
    MESSAGE :1,
    CALL : 2,
}

CONSTANTS.AVAILABLE_AUTHS = {
    ADMIN: 'admin',
    USER: 'user',
    ADMIN_USER: 'admin_user',
    ALL: 'all'
};

CONSTANTS.FILE_UPLOAD_TYPE = {
    PROFILE_IMAGE: 1,
    CHAT_MEDIA: 2,
};

CONSTANTS.JOIN_STATUS = {
    JOINED : 1,
    AVAILABLE : 2
}

CONSTANTS.TOKEN_TYPES = {
    LOGIN: 1,
    OTP: 2,
    RESET_PASSWORD:3,
};

CONSTANTS.DATABASE_VERSIONS = {
    ONE: 1,
};

CONSTANTS.USER_TYPE = {
    USER: 1,
    ADMIN: 2
};

CONSTANTS.PASSWORD_PATTER_REGEX = /^(?=.{6,})(?=.*[a-z])(?=.*[0-9])(?=.*[A-Z])(?=.*[@#$%^&+=]).*$/;

CONSTANTS.NAME_REGEX=/^[a-zA-Z\s]{1,20}[a-zA-Z\s]$/;
CONSTANTS.PHONE_REGEX=/^\+\d{1,3}\d{8,10}$/;
CONSTANTS.ETHEREUM_ADDRESS_REGEX=/^0x[a-fA-F0-9]{40}$/;
CONSTANTS.USERNAME_REGEX = /^(?=[a-zA-Z0-9._]{6,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/

CONSTANTS.NORMAL_PROJECTION = { __v: 0, isDeleted: 0, createdAt: 0, updatedAt: 0 };

CONSTANTS.MESSAGES = require('./messages');

CONSTANTS.SECURITY = {
    JWT_SIGN_KEY: 'fasdkfjklandfkdsfjladsfodfafjalfadsfkads',
    BCRYPT_SALT: 8,
    STATIC_TOKEN_FOR_AUTHORIZATION: '58dde3df315587b279edc3f5eeb98145'
};

CONSTANTS.ERROR_TYPES = {
    OTHER_DEVICE_LOGIN : "Your public address was used to login on other device",
    DATA_NOT_FOUND: 'DATA_NOT_FOUND',
    BAD_REQUEST: 'BAD_REQUEST',
    MONGO_EXCEPTION: 'MONGO_EXCEPTION',
    ALREADY_EXISTS: 'ALREADY_EXISTS',
    FORBIDDEN: 'FORBIDDEN',
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
    UNAUTHORIZED: 'UNAUTHORIZED',
    INVALID_MOVE: 'invalidMove'
};

CONSTANTS.LOGIN_TYPES = {
    METAMASK: 1
};

CONSTANTS.EMAIL_TYPES = {
    WELCOME_EMAIL: 1
};

CONSTANTS.EMAIL_SUBJECTS = {
    WELCOME_EMAIL: 'Test email'
};

CONSTANTS.EMAIL_CONTENTS = {
    WELCOME_EMAIL: `<p>Hello<span style="color: #3366ff;"></span>,</p><p>This is test Email.</p><p>Regards,<br>Team CuesZ</p>`
};

CONSTANTS.AVAILABLE_EXTENSIONS_FOR_FILE_UPLOADS = ['csv', 'png'];
CONSTANTS.ALLOWED_EXTENSIONS_FOR_PROFILE_IMAGE = ['jpg', 'png', 'jpeg', 'JPG', 'PNG', 'JPEG', 'webp', 'WEBP'];

CONSTANTS.GENDER = {
    MALE: "Male",
    FEMALE: "Female",
    OTHERS: "Other"
};

CONSTANTS.OTP_EXPIRIED_TIME_IN_SECONDS = 300;

CONSTANTS.USER_STATUS = {
    DELETED: 1,
};

CONSTANTS.S3_DEFAULT_IMAGE = "default.jpeg";

CONSTANTS.REDIS_EXPIRE_TIME_IN_SEC = 10800;

CONSTANTS.VIDEO_FORMATS = ["flv", "mp4", "m3u8", "ts", "3gp", "mov", "avi", "wmv"]

CONSTANTS.NODE_EVENTS = {
}

CONSTANTS.SOCKET_EVENTS = {
}

CONSTANTS.PAGINATION = {
    SKIP: 0,
    LIMIT: 20
}

CONSTANTS.COLORS = ["#ec1346","#e74818","#fc804a","#8c2242","#fc6c64","#ffb586","#377b06","#74c23d",
"#c2d421","#153166","#4e6db1","#1741e8","#50085d","#5d54a0","#721ce3","#4b1200","#ae6337","#ce9a7e",]

module.exports = CONSTANTS;