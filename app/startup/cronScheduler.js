'use strict';

const cron = require('node-cron');
const { conversationController } = require('../controllers');
const { SOCKET_EVENTS } = require('../utils/constants');

const cronTasks = {};

module.exports = async () => {

    /** schedules for every second  */
    /** check for room expiry time every second  */

    cron.schedule("*/1 * * * * *", async () => {
        const expiredRooms = await conversationController.groupExpiry();
        // if no room has expired
        if (!expiredRooms.length) return 
        
        expiredRooms.forEach(room => {
            // check if the event for is already due
            if (conversationController.checkIfRecentlyExpired(room.uniqueCode)) return;
            setTimeout(() => {
                global.io.in(room.uniqueCode).emit(SOCKET_EVENTS.ROOM_EXPIRED, { expiredRoom: room.uniqueCode });
            }, 5000)
        })
        
    });

};