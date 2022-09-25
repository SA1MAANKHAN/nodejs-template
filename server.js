'use strict';

/***********************************
**** node module defined here *****
***********************************/
require('dotenv').config();
const EXPRESS = require("express");
const { SERVER } = require('./config');
const requestIp = require("request-ip")

/** creating express server app for server. */
const app = EXPRESS();

// helper to check request ip address - for proxy server
// app.use(commonFunctions.getIpAddress)

/********************************
***** Server Configuration *****
********************************/
const server = require('http').Server(app);
global.io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
/** Server is running here */
let startNodeserver = async () => {
    await require('./app/startup/expressStartup')(app); // express startup.
    await require(`./app/startup/socket`).connect(global.io);
    // require("./app/startup/red5pro")(server, SERVER.PORT )
    
    return new Promise((resolve, reject) => {
        server.listen(SERVER.PORT, (err) => {
            if (err) reject(err);
            resolve();
        });
    });
};

startNodeserver().then(() => {
    console.log('Node server running on', SERVER.URL);
}).catch((err) => {
    console.log('Error in starting server', err);
    process.exit(1);
});

process.on('unhandledRejection', error => {
    console.log('unhandledRejection', error);
});