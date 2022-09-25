'use strict';

const { Joi } = require('../../utils/joiUtils');
const CONSTANTS = require('../../utils/constants');
const { userController } = require('../../controllers');
const testResp = require('./responses/test');

module.exports = [
	{
		method: 'GET',
		path: '/v1/testServer',
		joiSchemaForSwagger: {
			response: testResp.testServer,
			group: 'TEST',
			description: 'Route to check server is working fine or not?',
			model: 'SERVER'
		},
		handler: userController.checkServer
	}, {
		method: 'POST',
		path: '/v1/testEmail',
		joiSchemaForSwagger: {
			body: {
				email: Joi.string().case('lower').email().optional().description("user's email"),
			},
			group: 'TEST',
			description: 'Route to test email',
			model: 'TEST_EMAIL'
		},
		handler: userController.testEmail
	}, {
		method: 'GET',
		path: '/v1/testAuth',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description("User's JWT token.")
			},
			group: 'TEST',
			description: 'Route to user auth example',
			model: 'USER_AUTH'
		},
		auth: CONSTANTS.AVAILABLE_AUTHS.USER,
		handler: userController.checkUserAuth
	}
];