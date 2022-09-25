'use strict';

const { Joi } = require('../../utils/joiUtils');
const { FILE_UPLOAD_TYPE } = require('../../utils/constants');
const { userController } = require('../../controllers');
const userResp = require('./responses/user');

module.exports = [
	{
		method: 'POST',
		path: '/v1/file/upload',
		joiSchemaForSwagger: {
			formData: {
				file: Joi.file({ name: 'file', description: 'Single file' }),
				body: {
					fileName: Joi.string().optional().description("name of the file"),
					type: Joi.number().optional().valid(...Object.values(FILE_UPLOAD_TYPE)).description("1 -> profile, 2-> chat media"),
					groupId: Joi.alternatives().conditional('type', { is: FILE_UPLOAD_TYPE.CHAT_MEDIA, then: Joi.string().required().description("Group/Room unique Id"),otherwise: Joi.forbidden()}),
					index: Joi.string().optional().description("uploading file index")
				}
			},
			group: 'File',
			response: userResp.fileUpload,
			description: 'Route to upload a file',
			model: 'FileUpload'
		},
		handler: userController.uploadFile
	},
];