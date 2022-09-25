'use strict';

const { userModel } = require('./../models')
let userService = {};

/**
* function to create.
*/
userService.create = async (payload) => {
    return await new userModel(payload).save();
};

/**
* function to insert.
*/
userService.insertMany = async (payload) => {
    return await userModel.insertMany(payload);
};

/**
* function to find.
*/
userService.find = async (criteria, projection = {}) => {
    return await userModel.find(criteria, projection).lean();
};

/**
* function to find one.
*/
userService.findOne = async (criteria, projection = {}) => {
    return await userModel.findOne(criteria, projection).lean();
};

/**
* function to update one.
*/
userService.findOneAndUpdate = async (criteria, dataToUpdate, projection = {}) => {
    return await userModel.findOneAndUpdate(criteria, dataToUpdate, projection).lean();
};

/**
* function to update Many.
*/
userService.updateMany = async (criteria, dataToUpdate, projection = {}) => {
    return await userModel.updateMany(criteria, dataToUpdate, projection).lean();
};

/**
* function to delete one.
*/
userService.deleteOne = async (criteria) => {
    return await userModel.deleteOne(criteria);
};

/**
* function to delete Many.
*/
userService.deleteMany = async (criteria) => {
    return await userModel.deleteMany(criteria);
};

/**
* function to apply aggregate on userModel.
*/
userService.aggregate = async (query) => {
    return await userModel.aggregate(query);
};

module.exports = userService;