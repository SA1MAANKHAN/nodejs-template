'use strict';

/********************************
 **** Managing all the services ***
 ********* independently ********
 ********************************/
module.exports = {
    dbService: require('./dbService'),
    userService: require('./userService'),
    swaggerService: require('./swaggerService'),
    authService: require('./authService'),
    fileUploadService: require('./fileUploadService'),
};