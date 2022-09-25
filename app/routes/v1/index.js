'use strict';

/********************************
 ********* Import All routes ***********
 ********************************/
let v1Routes = [
    ...require('./fileRoutes'),
    ...require('./testRoutes'),
    ...require('./userRoutes'),
];

module.exports = v1Routes;
