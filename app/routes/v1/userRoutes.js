'use strict';

const { Joi } = require('../../utils/joiUtils');
const CONSTANTS = require('../../utils/constants');
const { userController } = require('../../controllers');
const userResp = require('./responses/user');
const { PROFILE_VISIBLE_STATUS } = require('../../utils/constants');

module.exports = [
	{
		method: 'POST',
		path: '/v1/user/login',
		joiSchemaForSwagger: {
			body: {
				publicAddress: Joi.string().ethereumAddress().required().description("Ethereum wallet addresses must check for a leading 0x followed by a random string of 40 hexadecimal characters (lowercase a-f, uppercase A-F, and numbers 0-9). This is not case sensitive.")
			},
			response: userResp.login,
			group: 'USER',
			description: 'Route to login a user using Ethereum wallet address.',
			model: 'Register'
		},
		handler: userController.loginUser
	},
	{
		method: 'POST',
		path: '/v2/user/login',
		joiSchemaForSwagger: {
			body: {
				signature: Joi.string().required().description("A signature of users public address signed with metamask."),
				message: Joi.string().required().description("A public address that was used to generate the signature."),
			},
			response: userResp.login,
			group: 'USER',
			description: 'Route to login a user using Ethereum wallet address.',
			model: 'RegisterWithMetamask'
		},
		handler: userController.loginUserWithMetamask
	}, 
	{
		method: 'PUT',
		path: '/v1/user',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description("User's JWT token.")
			},
			body: {
				username: Joi.string().isValidUsername().optional().description("User's username."),
				profileImage: Joi.string().imageUrl().optional().description("profile image url"),
				biography: Joi.string().optional().allow("").description("biography of user"),
			},
			response: userResp.updateUser,
			group: 'USER',
			description: 'Route to update a user.',
			model: 'UpdateUser'
		},
		auth: CONSTANTS.AVAILABLE_AUTHS.USER,
		handler: userController.updateUser
	}, {
		method: 'GET',
		path: '/v1/user',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description("User's JWT token.")
			},
			query: {
				id: Joi.string().mongoId().optional().description("user database id.")
			},
			response: userResp.getProfile,
			group: 'USER',
			description: 'Route to get user profile.',
			model: 'Profile'
		},
		auth: CONSTANTS.AVAILABLE_AUTHS.USER,
		handler: userController.getProfile
	}, 
	{
		method: 'GET',
		path: '/v1/users',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description("User's JWT token.")
			},
			query: {
				username: Joi.string().optional().description("Username"),
				limit: Joi.number().optional().default(10).description("limit"),
				skip: Joi.number().optional().default(0).description("skip"),
			},
			response: userResp.userList,
			group: 'USER',
			description: 'Route to all user profiles or users that match username regex.',
			model: 'Profiles'
		},
		auth: CONSTANTS.AVAILABLE_AUTHS.USER,
		handler: userController.getUsers
	}, 
	{
		method: 'DELETE',
		path: '/v1/user',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description("User's JWT token.")
			},
			response: userResp.deleteAccount,
			group: 'USER',
			description: 'Route to delete own account.',
			model: 'DeleteAccount'
		},
		auth: CONSTANTS.AVAILABLE_AUTHS.USER,
		handler: userController.deleteUser
	}, {
		method: 'PUT',
		path: '/v1/user/privacy/profileVisible',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description("User's JWT token.")
			},
			body: {
				action: Joi.string().valid('add', 'remove', 'replace').description("action"),
				users: Joi.array().items(Joi.object().keys({
					userId: Joi.string().mongoId().description("user db id"),
				    username: Joi.string().required()}))
			},
			response: userResp.updateUser,
			group: 'USER',
			description: 'Route to update user profile visible to.',
			model: 'ProfileVisible'
		},
		auth: CONSTANTS.AVAILABLE_AUTHS.USER,
		handler: userController.updateProfileVisibleTo
	}, {
		method: 'GET',
		path: '/v1/user/check',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description("User's JWT token.")
			},
			query: {
				username: Joi.string().required().description("Username")
			},
			response: userResp.checkUsername,
			group: 'USER',
			description: 'Route to find out user by username.',
			model: 'UserCheck'
		},
		auth: CONSTANTS.AVAILABLE_AUTHS.USER,
		handler: userController.checkUser
	},
	{
		method: 'PUT',
		path: '/v1/user/deviceToken',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description("User's JWT token.")
			},
			body: {
				token: Joi.string().required().description("Device token.")
			},
			response: userResp.deviceToken,
			group: 'USER',
			description: 'Route to send device token for notifications.',
			model: 'UserDeviceToken'
		},
		auth: CONSTANTS.AVAILABLE_AUTHS.USER,
		handler: userController.saveDeviceToken
	}, {
		method: 'GET',
		path: '/v1/user/qr',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description("User's JWT token.")
			},
			response: userResp.qrShortLink,
			group: 'USER',
			description: 'Route to profile qr of a user.',
			model: 'UserQr'
		},
		auth: CONSTANTS.AVAILABLE_AUTHS.USER,
		handler: userController.getQRCode
	},
];