const MESSAGES = require("../../../utils/messages");
const room = {
    "_id": "623ae31e5bb65f305f18cb21",
    "name": "Test group",
    "uniqueCode": "L13cD7az",
    "members": [
      {
        "unreadCount": 0,
        "_id": "623ae31e5bb65f305f18cb22",
        "userId": "6239b21050bcdf134170226a"
      }
    ],
    "expiryTime": "2022-03-24T07:59:01.349Z",
    "createdAt": "2022-03-23T09:06:38.279Z",
    "updatedAt": "2022-03-23T09:06:38.279Z"
};

module.exports = {
    "create": {
        200: {
            "schema": {
                "type": "object",
                "example": {
                    "statusCode": 200,
                    "message": MESSAGES.CONVERSATION.CREATED,
                    "status": true,
                    "type": "Default",
                    "data": room,
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
    "joinConversation": {
        200: {
            "schema": {
                "type": "object",
                "example": {
                    "statusCode": 200,
                    "message": MESSAGES.CONVERSATION.JOINED,
                    "status": true,
                    "type": "Default",
                    "data": room,
                }
            }
        },
        400: {
            "schema": {
                "type": "object",
                "example": {
                    "statusCode": 400,
                    "message": MESSAGES.CONVERSATION.NOT_FOUND,
                    "status": false,
                    "type": "BAD_REQUEST"
                }
            }
        },
    },
    "matchConversation": {
        200: {
            "schema": {
                "type": "object",
                "example": {
                    "statusCode": 200,
                    "message": MESSAGES.SUCCESS,
                    "status": true,
                    "type": "Default",
                    "data": room,
                }
            }
        },
        400: {
            "schema": {
                "type": "object",
                "example": {
                    "statusCode": 400,
                    "message": MESSAGES.CONVERSATION.NOT_FOUND,
                    "status": false,
                    "type": "BAD_REQUEST"
                }
            }
        },
    },
    "deleteConversation": {
        200: {
            "schema": {
                "type": "object",
                "example": {
                    "statusCode": 200,
                    "message": MESSAGES.CONVERSATION.DELETED,
                    "status": true,
                    "type": "Default",
                    "data": room,
                }
            }
        },
        400: {
            "schema": {
                "type": "object",
                "example": {
                    "statusCode": 400,
                    "message": MESSAGES.CONVERSATION.NOT_FOUND,
                    "status": false,
                    "type": "BAD_REQUEST"
                }
            }
        },
        401: {
            "schema": {
                "type": "object",
                "example": {
                    "statusCode": 401,
                    "message": MESSAGES.CONVERSATION.ROOM_DELETE_UNAUTHORIZED,
                    "status": false,
                    "type": "UNAUTHORIZED"
                }
            }
        },
    },
    "conversationLeft":{
        200: {
            "schema": {
                "type": "object",
                "example": {
                    "statusCode": 200,
                    "status": true,
                    "message": "Conversation left successfully.",
                    "type": "SUCCESS"
                }
            }
        },
    },
    "messages": {
        200: {
            "schema": {
                "type": "object",
                "example": {
                    "statusCode": 200,
                    "status": true,
                    "message": "Conversation list fetched successfully.",
                    "type": "SUCCESS",
                    "data": {
                        "conversationList": [
                            {
                                "_id": "62b2a01efbc54f602f603cc7",
                                "type": 1,
                                "senderId": "62a1aedc43cf8b0a9f36d3b4",
                                "senderName": "SASAS",
                                "readBy": [
                                    "62a1aedc43cf8b0a9f36d3b4"
                                ],
                                "receivedBy": [
                                    "62a1aedc43cf8b0a9f36d3b4"
                                ],
                                "message": "dadada",
                                "roomId": "62b29fcffbc54f602f603c53",
                                "publicAddress": "0xcad1303755ba3ea7ab9dc0a00dcfdf5ebce7d1db",
                                "createdAt": "2022-06-22T04:52:46.124Z",
                                "updatedAt": "2022-06-22T04:52:46.124Z"
                            },
                            {
                                "_id": "62b29ff6fbc54f602f603c96",
                                "type": 1,
                                "senderId": "62a1aedc43cf8b0a9f36d3b4",
                                "senderName": "SASAS",
                                "readBy": [
                                    "62a1aedc43cf8b0a9f36d3b4"
                                ],
                                "receivedBy": [
                                    "62a1aedc43cf8b0a9f36d3b4"
                                ],
                                "message": "dadad",
                                "roomId": "62b29fcffbc54f602f603c53",
                                "publicAddress": "0xcad1303755ba3ea7ab9dc0a00dcfdf5ebce7d1db",
                                "createdAt": "2022-06-22T04:52:06.919Z",
                                "updatedAt": "2022-06-22T04:52:06.919Z"
                            }
                        ],
                        "messageCount": 4
                    }
                }
            }
        },
    },
    "searchResult":{
        200: {
            "schema": {
                "type": "object",
                "example": {
                    "statusCode": 200,
                    "status": true,
                    "message": "Success.",
                    "type": "SUCCESS",
                    "data": [
                        {
                            "_id": "62b2a63efbc54f602f604466",
                            "type": 1,
                            "senderId": "62b04cdbfb92f9585bd33cfa",
                            "senderName": "Rhmont",
                            "readBy": [
                                "62b04cdbfb92f9585bd33cfa"
                            ],
                            "receivedBy": [
                                "62b04cdbfb92f9585bd33cfa"
                            ],
                            "message": "hola",
                            "roomId": "62b2a633fbc54f602f604432",
                            "publicAddress": "0xeae6aba4ff896a2cc36cf1c0f17fab3171eb8973",
                            "createdAt": "2022-06-22T05:18:54.560Z",
                            "updatedAt": "2022-06-22T05:18:54.560Z"
                        }
                    ]
                }
            }
        },
    },
    "emojis": {
        "statusCode": 200,
        "status": true,
        "message": "Success.",
        "type": "SUCCESS",
        "data": [
            "https://d2k2rpt0lk7syj.cloudfront.net/emojis/01_grinningFaceWithSweat.png",
            "https://d2k2rpt0lk7syj.cloudfront.net/emojis/02_faceWithTearsOfJoy.png",
            "https://d2k2rpt0lk7syj.cloudfront.net/emojis/03_pleadingFace.png",
            "https://d2k2rpt0lk7syj.cloudfront.net/emojis/04_faceWithCrossed-outEyes.png",
            "https://d2k2rpt0lk7syj.cloudfront.net/emojis/05_thumbsUp.png",
            "https://d2k2rpt0lk7syj.cloudfront.net/emojis/06_smilingFaceWithHalo.png",
            "https://d2k2rpt0lk7syj.cloudfront.net/emojis/07_smilingFaceWithSmilingEyes.png",
            "https://d2k2rpt0lk7syj.cloudfront.net/emojis/08_money-mouthFace.png",
        ]
    },
    "notificationSounds": {
        "statusCode": 200,
        "status": true,
        "message": "Success.",
        "type": "SUCCESS",
        "data": [
            "https://d2k2rpt0lk7syj.cloudfront.net/notification-sounds/notification1.mp3",
            "https://d2k2rpt0lk7syj.cloudfront.net/notification-sounds/notification2.mp3",
            "https://d2k2rpt0lk7syj.cloudfront.net/notification-sounds/notification3.mp3"
        ]
    },
    "ringtoneSounds": {
        "statusCode": 200,
        "status": true,
        "message": "Success.",
        "type": "SUCCESS",
        "data": [
            "https://d2k2rpt0lk7syj.cloudfront.net/ringtone/ringtoneOne.mp3",
            "https://d2k2rpt0lk7syj.cloudfront.net/ringtone/ringtoneThree.mp3",
            "https://d2k2rpt0lk7syj.cloudfront.net/ringtone/ringtoneTwo.mp3"
        ]
    },
    "notificationSettings": {
        "statusCode": 200,
        "status": true,
        "message": "Success.",
        "type": "SUCCESS",
        "data": {
            "groupSettings": [
                {
                    "showNotification": 0,
                    "ringtone": "https://d2k2rpt0lk7syj.cloudfront.net/ringtone/ringtoneTwo.mp3",
                    "_id": "62d801b58d0d715f7034b779",
                    "roomId": "62d69c97d4944e2384f74254",
                    "uniqueCode": "l5s4ht00a6tjlv2i"
                },
                {
                    "showNotification": 0,
                    "ringtone": "none",
                    "_id": "62d803708d0d715f7034ba83",
                    "roomId": "62d638863fd9623f5a37f6b7",
                    "uniqueCode": "l5rp8qisdhoplot2"
                }
            ],
            "globalSettings": {
                "showNotification": 0,
                "notificationSound": "https://d2k2rpt0lk7syj.cloudfront.net/notification-sounds/1.mp3",
                "ringtone": "https://d2k2rpt0lk7syj.cloudfront.net/ringtone/1.mp3"
            }
        }
    }
}
