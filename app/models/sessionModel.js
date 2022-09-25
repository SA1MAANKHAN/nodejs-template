'use strict';

/************* Modules ***********/
const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;
const { TOKEN_TYPES, USER_TYPE } = require("../utils/constants");

// NOTE: this model is uses for development only( not live and staging server) 
/************* User Session Model ***********/
const sessionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'users' }, 
    userType: { type: Number, enum: Object.values(USER_TYPE), default: USER_TYPE.USER  },
    tokenType: { type: Number, default: TOKEN_TYPES.LOGIN },
    token: { type: String }, 
    deviceToken: {type: String},
    sessionId: { type: String, unique: true },
    tokenExpDate: { type: Date },
}, { timestamps: true, versionKey: false });

module.exports = MONGOOSE.model('session', sessionSchema);