/** -- import all modules */
const { authService } = require("../services");
const { MESSAGES, SOCKET_EVENTS, MESSAGE_TYPES, NODE_EVENTS } = require("../utils/constants");
const { validateMongooseId, convertIdToMongooseId  } = require("../utils/utils");
const routeUtils = require('../utils/routeUtils')
const { conversationController } = require('../controllers');
const dbService = require("../services/dbService");
const { userModel } = require(`../models`);
// const { checkMessageStatus } = require("../controllers/conversationController");
const socketUtils = require("../utils/socketUtils");

const eventEmitter =  require("../startup/eventEmitter");
const CONSTANTS = require("../utils/constants");

let socketConnection = {};

socketConnection.connect = function (io) {
    io.use(authService.socketAuthentication);
    io.on('connection', async (socket) => {
        ('connection established: ', socket.id);
        const allUserRoomData = await conversationController.markAllMessagesReceived({userId : socket.id})
        // get last message received by all persons of all rooms this user is member of
        const lastMessagesReceived = await conversationController.getLastReceived(allUserRoomData.roomIds)
        allUserRoomData.uniqueCodes.forEach(uniqueCode => socket.in(uniqueCode).emit(SOCKET_EVENTS.ALL_MESSAGES_RECEIVED, { message: MESSAGES.SOCKET.MESSAGE_READ, lastMessagesReceived }))
        
        socket.use(async (packet, next) => {
            console.log("Socket hit:=>", packet);
            try {
                await socketUtils.route(packet)
                next();
            } catch (error) {
               packet[2]({success: false, message: error.message, statusCode: 400})
            }  
        });

        socket.on(SOCKET_EVENTS.TEST, (payload, callback) => {
            console.log('Testing', payload);
            callback({success: true, message: MESSAGES.SOCKET.SOCKET_IS_RUNNING_FINE});
        });

        socket.on(SOCKET_EVENTS.CREATE_ROOM, async (payload, callback) => {
            payload.userId=socket.id;
            const response = await conversationController.createRoom(payload);
            // joining the newly createdRoom
            if (response.statusCode === 200) {
                // join user in newly created room
                socket.join(response.data.uniqueCode)
                callback({ success: true, message: response.message, data: response });
            } else {
                callback({ success: false, message: response.message, data: response });
            }
        });

        socket.on(SOCKET_EVENTS.JOIN_ROOM, async (payload, callback) => {
            payload.userId = socket.id;
            const response = await conversationController.joinConversation(payload);

            if (response.statusCode === 200) { 
                socket.join(payload.joinCode) 
                callback({ success: true, message: response.message, data: response });
                // notify members that new member has joined

                const data = await conversationController.conversationList({ user: { _id: convertIdToMongooseId(socket.id) }, searchKey : payload.joinCode})
                socket.in((response.data.uniqueCode)).emit(SOCKET_EVENTS.NEW_USER_JOINED, { members: data });

            }else{
                callback({ success: false, message: response.message, data: response });
            }
        });

        socket.on(SOCKET_EVENTS.JOIN_WITH_FRIEND_ROOM, async (payload, callback) => {
            payload.userId = socket.id;
            const response = await conversationController.joinConversationWithFriend(payload);

            if (response.statusCode === 200) {
                const memberIds = response.data.members.map(member => member.userId.toString())
                const [friendId] = memberIds.filter(userId => userId !== socket.id)
                // join creater in the newlycreated or existing room                
                socket.join(response.data.uniqueCode);
                // send newroom join notification to friend
                socket.to(friendId).emit(SOCKET_EVENTS.ADDED_IN_ROOM, response.data);
                callback({ success: true, message: response.message, data: response });
            } else {
                callback({ success: false, message: response.message, data: response });
            }
        });

        // this socket join the user in newly creted socket room
        socket.on(SOCKET_EVENTS.JOIN_ME_IN, async (payload, callback) => {
            // send user roomId in you want to join
            socket.join(payload.uniqueCode) 
            callback({ success: true });
        })
        
        socket.on(SOCKET_EVENTS.SEND_MESSAGE, async (payload, callback) => {

            if(payload.type && !Object.values(MESSAGE_TYPES).includes(payload.type)) {
                return ({ success: false, message: MESSAGES.CONVERSATION.INVALID_MSG_TYPE });
            }
            if (payload.messageId && !validateMongooseId(payload.messageId)) {
                return ({ success: false, message: MESSAGES.MESSAGE_ID_IS_NOT_OBJECTID });
            }
            payload.userId = socket.id;
            let roomData = await conversationController.roomInformation(payload); 
            let socketRooms = Array.from(socket.rooms);

        
            if (socketRooms.indexOf(roomData.uniqueCode) < 0){
                console.log("SOCKET ROOM NOT FOUND")
                callback ({ success: false, message: MESSAGES.CONVERSATION.NOT_FOUND });
                return;
            }
            const user = await dbService.findOne(userModel, { _id: payload.userId })
            if (!user) return ({ success: false, message: MESSAGES.CONVERSATION.NOT_FOUND });
            payload.username = user.username;
            payload.publicAddress = user.publicAddress
            let msg = await conversationController.saveMessage(payload);
            payload.sender = { _id: payload.userId };

            // send fcm notification
            conversationController.FCMNotification(payload, roomData, CONSTANTS.NOTIFICATION_TYPE.MESSAGE );
            
            const messageData = { ...payload, _id: msg._id, createdAt: msg.createdAt }
            
            socket.in(roomData.uniqueCode).emit(SOCKET_EVENTS.NEW_MESSAGE, messageData);
            callback({ success: true, data:payload, message: MESSAGES.SOCKET.MESSAGE_SENT });
        });

        socket.on(SOCKET_EVENTS.TYPING, async (payload, callback) => {
            payload.userId = socket.id;
            let roomData = await conversationController.roomInformation(payload);
            let socketRooms  = Array.from(socket.rooms);
            if (socketRooms.indexOf(roomData.uniqueCode) < 0){
                console.log("SOCKET ROOM NOT FOUND")
                callback({ success: false, message: MESSAGES.CONVERSATION.NOT_FOUND });
                return;
            }
            socket.in(roomData.uniqueCode).emit(SOCKET_EVENTS.TYPING, payload );
            callback({ success: true, message: MESSAGES.SOCKET.MESSAGE_SENT });
        })

        socket.on(SOCKET_EVENTS.STOPPED_TYPING, async (payload, callback) => {
            payload.userId = socket.id;
            let roomData = await conversationController.roomInformation(payload);
            let socketRooms = Array.from(socket.rooms);
            if (socketRooms.indexOf(roomData.uniqueCode) < 0) {
                console.log("SOCKET ROOM NOT FOUND")
                callback({ success: false, message: MESSAGES.CONVERSATION.NOT_FOUND });
                return;
            }
            socket.in(roomData.uniqueCode).emit(SOCKET_EVENTS.STOPPED_TYPING, payload);
            callback({ success: true, message: MESSAGES.SOCKET.MESSAGE_SENT });
        })

        socket.on(SOCKET_EVENTS.READ_MESSAGE, async (payload, callback) => {
            payload.userId = socket.id;
            let {_id, uniqueCode} = await conversationController.updateMessageRead(payload);

            let socketRooms = Array.from(socket.rooms);
            if (socketRooms.indexOf(uniqueCode) < 0) {
                callback({ success: false, message: MESSAGES.CONVERSATION.NOT_FOUND });
                return;
            }
            const lastReadMessage = await conversationController.getLastRead([_id]);
            if (lastReadMessage[0]) socket.in(uniqueCode).emit(SOCKET_EVENTS.READ_MESSAGE, { message: MESSAGES.SOCKET.MESSAGE_READ, messageId: lastReadMessage[0].messageId, roomId: _id, memberCount: lastReadMessage[0].membersCount , uniqueCode })
            callback({ success: true, message: MESSAGES.SOCKET.MESSAGE_READ });
        });

        socket.on(SOCKET_EVENTS.MESSAGE_RECEIVED, async (payload, callback) => { 
            payload.userId = socket.id;
            let {_id, uniqueCode} = await conversationController.updateMessageReceived(payload);
            
            let socketRooms = Array.from(socket.rooms);
            if (socketRooms.indexOf(uniqueCode) < 0) {
                return ({ success: false, message: MESSAGES.CONVERSATION.NOT_FOUND });
            }

            const lastReceivedMessage = await conversationController.getLastReceived([_id])
            if (lastReceivedMessage[0]) socket.in(uniqueCode).emit(SOCKET_EVENTS.MESSAGE_RECEIVED, { message: MESSAGES.SOCKET.MESSAGE_RECEIVED, messageId: lastReceivedMessage[0].messageId, roomId: _id, memberCount: lastReceivedMessage[0].membersCount, uniqueCode })
            callback({ success: true, message: MESSAGES.SOCKET.MESSAGE_RECEIVED });
        })

        socket.on(SOCKET_EVENTS.VIDEO_CALL, async (payload, callback) => {
            conversationController.videoCall(socket, payload, callback);
        });

        socket.on(SOCKET_EVENTS.VIDEO_CALL_PUBLISH, async (payload, callback) => {
            payload.userId = socket.id;
            socket.liveVideoCallUniqueCode = payload.uniqueCode
            socket.liveVideoCallStreamName = payload.streamName
            socket.callType = payload.type

            const room = await dbService.findOne(conversationRoomModel, { uniqueCode: payload.uniqueCode })

            if(!room){
                callback({ success: false, message: MESSAGES.CONVERSATION.NOT_FOUND });
                return;
            } 
            // DISABLE CALL IS GLOBAL GROUPS
            if(room.roomType === CONSTANTS.CONVERSATION_ROOMS.CHANNEL){

                callback({
                    success: false,
                    message: MESSAGES.CHANNELS_DONT_SUPPORT_CALLS,
                });

                return 
            } 

            const userData = await dbService.findOne(userModel, { _id : socket.id })
            const streams = await conversationController.createVideoCall({ ...payload, roomId : room._id, username: userData.username} )

            if(streams.length === 1){
                // new call created
                socket.in(payload.uniqueCode).emit(SOCKET_EVENTS.CALL_STARTED, {
                    uniqueCode: payload.uniqueCode,
                });

                conversationController.FCMNotification({ ...payload, callStatus: "started", startTimeStamp: `${Date.now()}` }, room, CONSTANTS.NOTIFICATION_TYPE.CALL);
                
                await dbService.findOneAndUpdate(conversationRoomModel, { uniqueCode: payload.uniqueCode }, { isCallActive: true, activeCallType: payload.type })

                // adding video call started event bubble
                let event; 
                payload.type == CONSTANTS.CALL_TYPE.VIDEO ? event = "VIDEO_CALL_STARTED" : event = "AUDIO_CALL_STARTED";
                
                await conversationController.createRoomEvent(event, room._id, payload.uniqueCode, payload.userId);
            }
            socket.in(payload.uniqueCode).emit(SOCKET_EVENTS.VIDEO_CALL_SUBSCRIBE, { 
                uniqueCode : payload.uniqueCode, 
                streamName : payload.streamName,
                type: payload.type,
                streamCount: streams.length + 1,
                username : userData.username
            });

            callback({
                success: true,
                data: {...payload, streams},
                message: MESSAGES.SOCKET.SUBSCRPTION_SENT,
            });
        });

        socket.on(SOCKET_EVENTS.REJECT_CALL, async (payload, callback) => {
            payload.userId = socket.id;
            let roomData = await conversationController.roomInformation(payload);
            let socketRooms = Array.from(socket.rooms);
            if (socketRooms.indexOf(roomData.uniqueCode) < 0) {
                console.log("SOCKET ROOM NOT FOUND")
                callback({ success: false, message: MESSAGES.CONVERSATION.NOT_FOUND });
                return;
            }

            let callAction = "REJECT_CALL";
            // immediately end the call if number of members is one or two
            if (roomData.members.length <= 2) callAction = "CALL_ENDED";
            
            socket.in(roomData.uniqueCode).emit(SOCKET_EVENTS[callAction], payload);

            callback({ success: true, message: MESSAGES.SOCKET.REJECT_CALL });
        })


        socket.on(SOCKET_EVENTS.VIDEO_CALL_AUDIO_CHANGED, async (payload, callback) => {
            payload.userId = socket.id;
            socket.in(payload.uniqueCode).emit(SOCKET_EVENTS.VIDEO_CALL_CHANGE_AUDIO, payload);
            callback({
                success: true,
                data: { ...payload },
                message: MESSAGES.SOCKET.AUDIO_CHANGED,
            });
        });

        socket.on(SOCKET_EVENTS.VIDEO_CALL_VIDEO_CHANGED, async (payload, callback) => {
            payload.userId = socket.id;
            socket.in(payload.uniqueCode).emit(SOCKET_EVENTS.VIDEO_CALL_CHANGE_VIDEO, payload);
            callback({
                success: true,
                data: { ...payload },
                message: MESSAGES.SOCKET.VIDEO_CHANGED,
            });
        });

        socket.on(SOCKET_EVENTS.VIDEO_CALL_UNPUBLISH, async (payload, callback) => {
            payload.userId = socket.id;
            const numberOfPeopleOnCall = await conversationController.removeFromVideoCall(payload)

            if (numberOfPeopleOnCall <= 1) {
                socket.in(payload.uniqueCode).emit(SOCKET_EVENTS.CALL_ENDED, {
                    uniqueCode: payload.uniqueCode,
                });
                const room = await dbService.findOneAndUpdate(conversationRoomModel, { uniqueCode: payload.uniqueCode }, { isCallActive: false }, { new: true})
                
                conversationController.FCMNotification({ ...payload, callStatus: "ended" }, room, CONSTANTS.NOTIFICATION_TYPE.CALL);
            }
       
            socket.in(payload.uniqueCode).emit(SOCKET_EVENTS.VIDEO_CALL_UNSUBSCRIBE, { uniqueCode: payload.uniqueCode, streamName: payload.streamName, numberOfPeopleOnCall });
            callback({
                success: true,
                data: { ...payload, numberOfPeopleOnCall },
                message: MESSAGES.SOCKET.STOPPED_PUBLISHING,
           
            });
        });



        socket.on(SOCKET_EVENTS.DISCONNECT, async () => {
            console.log('Disconnected socket id: ', socket.id);  
            // for removing participants from the call when the socket gets disconnected
            const payload = {}
            payload.userId = socket.id
            payload.uniqueCode = socket.liveVideoCallUniqueCode
            payload.streamName = socket.liveVideoCallStreamName
            payload.type = socket.callType

            if (!(payload.uniqueCode && payload.streamName )) return;

            const numberOfPeopleOnCall = await conversationController.removeFromVideoCall(payload)

            if (numberOfPeopleOnCall <= 1) {
                await dbService.updateOne(conversationRoomModel, { uniqueCode: payload.uniqueCode }, { isCallActive: false })
                socket.in(payload.uniqueCode).emit(SOCKET_EVENTS.CALL_ENDED, {
                    uniqueCode: payload.uniqueCode,
                });
            }

            socket.in(payload.uniqueCode).emit(SOCKET_EVENTS.VIDEO_CALL_UNSUBSCRIBE, { uniqueCode: payload.uniqueCode, streamName: payload.streamName });
        });  

    });
};

module.exports = socketConnection;