"use strict";

const CONFIG = require("../../config");
const path = require("path");
const { v4: uuid } = require('uuid');
const { ethers } = require("ethers")
const { userModel, conversationRoomModel } = require("../models");
const { dbService, userService, fileUploadService } = require("../services");
const { createSuccessResponse, createErrorResponse } = require("../helpers");
const { matchMongoId, convertIdToMongooseId, createDeepLink } = require("../utils/utils");
const { createSession } = require("../utils/dbUtils");
const {
	MESSAGES,
	EMAIL_TYPES,
	ERROR_TYPES,
	NORMAL_PROJECTION,
	FILE_UPLOAD_TYPE,
	PROFILE_VISIBLE_STATUS,
	S3_DEFAULT_IMAGE,
	SOCKET_EVENTS,
	PAGINATION,
} = require("../utils/constants");
const sessionModel = require("../models/sessionModel");

/**************************************************
 ***************** User Controller ***************
 **************************************************/
let userController = {};

/**
 * function to get server response.
 * @returns
 */
userController.checkServer = async () => {
	return createSuccessResponse(MESSAGES.SERVER_IS_WORKING_FINE);
};

/**
 * function to check user auth.
 * @param {*} payload
 * @returns
 */
userController.checkUserAuth = async () => {
	return createSuccessResponse(MESSAGES.AUTH_IS_WORKING_FINE);
};

/**
 * function to test email service.
 * @param {*} payload
 * @returns
 */
userController.testEmail = async (payload) => {
	await sendEmail(
		{
			email: payload.email,
		},
		EMAIL_TYPES.WELCOME_EMAIL
	);
	return createSuccessResponse(MESSAGES.EMAIL_IS_WORKING_FINE);
};

/**
 * Function to upload file.
 * @param {*} payload
 * @returns
 */
userController.uploadFile = async (payload) => {
	if (!Object.keys(payload.file).length) {
		throw createErrorResponse(
			MESSAGES.FILE_REQUIRED_IN_PAYLOAD,
			ERROR_TYPES.BAD_REQUEST
		);
	}
	let pathToUpload = path.resolve(
		__dirname + `../../..${CONFIG.PATH_TO_UPLOAD_FILES_ON_LOCAL}`
	),
		pathOnServer = CONFIG.PATH_TO_UPLOAD_FILES_ON_LOCAL;

	let fileUrl = await fileUploadService.uploadFile(
		payload,
		pathToUpload,
		pathOnServer
	);
	const data = { fileUrl, groupId: payload.groupId };
	if (payload.index) {
		data.index = payload.index;
	}
	return createSuccessResponse(MESSAGES.FILE_UPLOADED_SUCCESSFULLY, data);
};

/**
 * function to login a user.
 * @param {*} payload
 * @returns
 */
userController.loginUser = async (payload) => {
	// for keeping the id in case of manual login
	payload.publicAddress = payload.publicAddress.toLowerCase()

	let user = await dbService.findOne(userModel, {
		publicAddress: payload.publicAddress,
	});

	if (!user) {
		user = await dbService.create(userModel, {
			publicAddress: payload.publicAddress,
		});

	}

	// logging out from other devices / sessions
	global.io.to(user._id.toString()).emit(SOCKET_EVENTS.OTHER_DEVICE_LOGIN, { message: MESSAGES.OTHER_DEVICE_LOGIN });

	const token = await createSession({ userId: user._id, sessionId : uuid() });

	return createSuccessResponse(MESSAGES.LOGGED_IN_SUCCESSFULLY, {
		user,
		token,
	});
};

/**
 * function to login a user with metamask.
 * @param {*} payload
 * @returns
 */
userController.loginUserWithMetamask = async (payload) => {
	const timestamp = Date.now(); 
	const signatureTimestamp = Date.parse(payload.message);
	// timestamp in the message should be more than 30 seconds old or  more than 0 seconds greater than signature
	if ((signatureTimestamp < timestamp - 30000) || (signatureTimestamp > timestamp )) {
		throw createErrorResponse(MESSAGES.UNAUTHORIZED, ERROR_TYPES.UNAUTHORIZED);
	}

	let publicAddress;

	try{
		 publicAddress = ethers.utils.verifyMessage(payload.message, payload.signature);
		 publicAddress = publicAddress.toLowerCase();
	}catch(err){
		throw createErrorResponse(MESSAGES.UNAUTHORIZED, ERROR_TYPES.UNAUTHORIZED);
	}
	
	let user = await dbService.findOne(userModel, {
		publicAddress 
	});

	if (!user) {
		user = await dbService.create(userModel, {
			publicAddress
		});
		
	}

	// logging out from other devices / sessions
	global.io.to(user._id.toString()).emit(SOCKET_EVENTS.OTHER_DEVICE_LOGIN, { message: MESSAGES.OTHER_DEVICE_LOGIN });

	const token = await createSession({ userId: user._id, sessionId: uuid() });

	return createSuccessResponse(MESSAGES.LOGGED_IN_SUCCESSFULLY, {
		user,
		token,
	});
};

/**
 * function to save device token for notification.
 * @param {*} payload
 * @returns
 */
userController.saveDeviceToken = async (payload) => {
	await dbService.findOneAndUpdate(sessionModel, {userId : payload.user._id}, { deviceToken : payload.token})
	return createSuccessResponse(MESSAGES.TOKEN_SAVED_SUCCESSFULLY);
};

/**
 * function to update user.
 * @param {*} payload
 * @returns
 */
userController.updateUser = async (payload) => {

	if (payload.username){
		let users = await dbService.find(userModel, { username: payload.username });
		if (users.length) return createErrorResponse(MESSAGES.USERNAME_NOT_AVAILABLE, ERROR_TYPES.ALREADY_EXISTS);
	}

	let user = await dbService.findOneAndUpdate( userModel, { _id: payload.user._id }, payload, { new: true } );
	return createSuccessResponse(MESSAGES.USER_UPDATED_SUCCESSFULLY, user);
};

/**
 * function to get user profile.
 * @param {*} payload
 * @returns
 */
userController.getProfile = async (payload) => {
	let user = payload.user;
	if (payload.id && !matchMongoId(payload.user._id, payload.id)) {
		user = await dbService.findOne(userModel, { _id: payload.id });
		if (!user) {
			throw createErrorResponse( MESSAGES.NO_USER_FOUND, ERROR_TYPES.DATA_NOT_FOUND );
		}
		if ( !user.profileVisibleTo || !user.profileVisibleTo.some((user) => matchMongoId(user.userId, payload.user._id)) ) {
			throw createErrorResponse( MESSAGES.NOT_PERMISSION_TO_VIEW_PROFILE, ERROR_TYPES.BAD_REQUEST );
		}
	}
	if(!payload.id && user && (user.profileVisibleTo || []).length){
		const profileVisibleToIds = user.profileVisibleTo.map(user => convertIdToMongooseId(user.userId))
		user.profileVisibleTo = await dbService.find(userModel, { _id: { $in: profileVisibleToIds }}, { profileImage: 1, username: 1  });
	}

	return createSuccessResponse(MESSAGES.SUCCESS, { user: user });
};

/**
 * function to get all user profiles or users that match username regex.
 * @param {*} payload
 * @returns
 */
userController.getUsers = async (payload) => {
	const aggregateQuery = [
                { $project: {
                    _id: 1,
                    username: 1,
					publicAddress: 1,
					biography : 1,
                    profileImage: {
                        $cond: {
                            if: {
                                $or: [
                                    { $eq: ["$profileVisibleStatus", PROFILE_VISIBLE_STATUS.ALL] },
                                    { $and: [{ $eq: ["$profileVisibleStatus", PROFILE_VISIBLE_STATUS.SPECIFIC] }, { $in: [payload.user._id, "$profileVisibleTo.userId"] }] }
                                ]
                            },
                            then: { $concat: [CONFIG.S3_FILE_URL, "$profileImage"] },
                            else: { $concat: [CONFIG.S3_FILE_URL, S3_DEFAULT_IMAGE] }
                        }
                    }
                }}
	 ]

		if(payload.username) aggregateQuery.push( { $match: { username: { $regex: payload.username, $options: "i" } } } )

		aggregateQuery.push(
			{
				$facet: {
					users: [
						{ $skip: payload.skip ? payload.skip : PAGINATION.SKIP },
						{ $limit: payload.limit ? payload.limit : PAGINATION.LIMIT },
					],
					userCount: [{ $count: "count" }],
				}
			}
		)

	const users = await dbService.aggregate(userModel, aggregateQuery)

	if (payload.username){
		// getting all the name with regex in the beginning in the front
		 users[0].users = [ ...users[0].users.filter((user)=> user.username.slice(0,payload.username.length).toLowerCase() == payload.username.toLowerCase()),  ...users[0].users.filter((user)=> user.username.slice(0,payload.username.length).toLowerCase() != payload.username.toLowerCase())]
	}

	return createSuccessResponse(MESSAGES.SUCCESS, { ...users[0] });
};

userController.checkUser = async (payload) => {
	const user = await dbService.findOne(userModel, {username: payload.username});
	if(user){
		return createSuccessResponse(MESSAGES.SUCCESS, { available: false});
	}
	return createSuccessResponse(MESSAGES.SUCCESS, { available: true});
};

/**
 * Function to delete user.
 * @param {*} payload
 * @returns
 */
userController.deleteUser = async (payload) => {
	/** -- delete rooms */
	await dbService.deleteMany(conversationRoomModel, {
		createdBy: payload.user._id,
	});
	/** -- remove from other rooms */

	/** -- delete user */
	const criteria = { _id: payload.user._id };
	await dbService.deleteOne(userModel, criteria);
	return createSuccessResponse(MESSAGES.SUCCESS);
};

userController.getQRCode = async (payload)=>{
	try{
		let result = await createDeepLink("username", payload.user.username, "FriendProfile" );
		return createSuccessResponse(MESSAGES.SUCCESS, { shortLink: result.data.shortLink, previewLink: result.data.previewLink });
	}catch(err){
		throw createErrorResponse(err.response.data.error.message, ERROR_TYPES.BAD_REQUEST);
	}
}
/**
 * Function to update profile visibility.
 * @param {*} payload
 * @returns
 */
userController.updateProfileVisibleTo = async (payload) => {
	payload.user.profileVisibleTo = payload.user.profileVisibleTo || [];
	const existingIds = payload.user.profileVisibleTo.map((user) => user.userId.toString());
	if (payload.action == "add") {
		payload.users.forEach((u) => {
		const alreadyExists = existingIds.find(euId => euId == u.userId.toString())
		if (!alreadyExists) {
				payload.user.profileVisibleTo.push(u);
		}
		});
	} else if (payload.action == "remove") {	
		payload.user.profileVisibleTo = payload.user.profileVisibleTo.filter(existingUser => !payload.users.find(user => (user.userId.toString() === existingUser.userId.toString())));

	} else if (payload.action == "replace") {
		payload.user.profileVisibleTo = payload.users;
	}
	const dataToUpdate = { profileVisibleTo: payload.user.profileVisibleTo };
	const user = await dbService.findOneAndUpdate(
		userModel,
		{ _id: payload.user._id },
		dataToUpdate,
		{ new: true }
	);
	return createSuccessResponse(MESSAGES.USER_UPDATED_SUCCESSFULLY, user);
};

module.exports = userController;
