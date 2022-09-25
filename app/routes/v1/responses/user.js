const { ERROR_TYPES } = require("../../../utils/constants");
const MESSAGES = require("../../../utils/messages");
const userData = {
    "_id": "61fba617f4f70d6c0b3eff58",
    "username" :"",
    "profileImage": "default.png",
    "biography": "this is user biography in multiple line"
};

module.exports = {
    "login": {
        200: {
            "schema": {
                "type": "object",
                "example": {
                    "statusCode": 200,
                    "status": true,
                    "message": "Logged in successfully.",
                    "type": "SUCCESS",
                    "data": {
                        "user": userData,
                        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MmE4N2MzYzRhZDQyNjIxNDg1ZDFlMWYiLCJzZXNzaW9uSWQiOiI2MWVkNWY1OS1kMTUxLTQzYmEtOWNkOS1mMDMwMWY5ZTNjYjUiLCJkYXRlIjoxNjU1ODk0MjYyOTA4LCJpYXQiOjE2NTU4OTQyNjJ9.PymOWnUrI1ZUDrfxsIDBMjgHjG0hezlGhTu673VEL0I"
                    }
                }
            }
        },
        400: {
            "schema": {
                "type": "object",
                "example": {
                    "statusCode": 400,
                    "message": MESSAGES.INVALID_ETHEREUM_ADDRESS,
                    "status": false,
                    "type": "BAD_REQUEST"
                }
            }
        },
    },
    "updateUser": {
        200: {
            "schema": {
                "type": "object",
                "example": {
                    "statusCode": 200,
                    "message": MESSAGES.USER_UPDATED_SUCCESSFULLY,
                    "status": true,
                    "type": "Default",
                    "data": userData,
                }
            }
        }
    },
    "getProfile": {
        200: {
            "schema": {
                "type": "object",
                "example": {
                    "statusCode": 200,
                    "message": MESSAGES.SUCCESS,
                    "status": true,
                    "type": "Default",
                    "data": userData,
                }
            }
        }
    },
    "userList": {
        200: {
            "schema": {
                "type": "object",
                "example": {
                    "statusCode": 200,
                    "message": MESSAGES.SUCCESS,
                    "status": true,
                    "type": "Default",
                    "data": [userData],
                }
            }
        }
    },
    "deleteAccount": {
        200: {
            "schema": {
                "type": "object",
                "example": {
                    "statusCode": 200,
                    "message": MESSAGES.SUCCESS,
                    "status": true,
                    "type": "Default"
                }
            }
        }
    },
    "fileUpload": {
        200: {
            schema: {
                type: "object",
                example: {
                    message: MESSAGES.FILE_UPLOADED_SUCCESSFULLY,
                    data: "https://d2k2rpt0lk7syj.cloudfront.net/test/chat_1648710480510.png"
                }
            }
        },
        400: {
            schema: {
                type: "object",
                example: {
                    message: "groupId is required."
                }
            }
        }
    },
    "checkUsername": {
        200: {
            "schema": {
                "type": "object",
                "example": {
                    "statusCode": 200,
                    "status": true,
                    "message": "Success.",
                    "type": "SUCCESS",
                    "data": {
                        "available": true
                    }
                }
            }
        }
    },
    "saveDeviceToken": {
        200: {
            "schema": {
                "type": "object",
                "example": {
                    "statusCode": 200,
                    "status": true,
                    "message": "Device token stored successfully.",
                    "type": "SUCCESS"
                }
            }
        }
    },
    "qrShortLink": {
        200: {
            "schema": {
                "type": "object",
                "example": {
                    "statusCode": 200,
                    "status": true,
                    "message": "Success.",
                    "type": "SUCCESS",
                    "data": {
                        "shortLink": "https://mejhoolapp.page.link/zBWC5Z3J6awquUtYA",
                        "previewLink": "https://mejhoolapp.page.link/zBWC5Z3J6awquUtYA?d=1"
                    }
                }
            }
        }
    },
    "deviceToken": {
        "statusCode": 200,
        "status": true,
        "message": "Device token stored successfully.",
        "type": "SUCCESS"
    }
}
