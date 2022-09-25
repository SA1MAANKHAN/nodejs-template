'use strict';

/************* Modules ***********/
const MONGOOSE = require('mongoose');
const config = require('../../config');
const { S3_DEFAULT_IMAGE } = require('../utils/constants');
const Schema = MONGOOSE.Schema;

const bindUrl = (url) => {
    return `${config.S3_FILE_URL}${url}`;
}
/************* User Model ***********/
const userSchema = new Schema({
    username: { type: String, default: "" , index: true },
    publicAddress: { type: String, unique: true, index: true},
    profileImage: { type: String, default: S3_DEFAULT_IMAGE },
    biography: { type: String, default: "" },
    profileVisibleTo: [{
        userId: { type: Schema.Types.ObjectId, ref: 'users' },
        username: { type: String, default: "" }
    }],
}, { timestamps: true, versionKey: false, collection: "users"});


userSchema.post('findOne', function(doc) {
    if(doc && doc.profileImage){
        doc.profileImage = bindUrl(doc.profileImage);
    }
});

userSchema.post('findOneAndUpdate', function(doc) {
    if(doc && doc.profileImage){
        doc.profileImage = bindUrl(doc.profileImage);
    }
    delete doc.publicAddress;
});


module.exports = MONGOOSE.model('users', userSchema);