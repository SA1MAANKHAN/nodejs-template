'use strict';
const { NORMAL_PROJECTION } = require('../utils/constants');

const dbService = {};

/**
* function to create.
*/
dbService.create = async (model, payload) => {
    return await new model(payload).save();
};

/**
* function to insert.
*/
dbService.insertMany = async (model, payload) => {
    return await model.insertMany(payload);
};

/**
* function to find.
*/
dbService.find = async (model, criteria, projection = {}) => {
    return await model.find(criteria, projection).lean();
};

/**
* function to find with limit and skip.
*/
dbService.findPaginate = async (model, criteria,  sort = {}, limit = 10, skip = 0 ,  projection = {}) => {
    return await model.find(criteria, projection).sort(sort).limit(limit).skip(skip).lean();
};

/**
* function to find one.
*/
dbService.findOne = async (model, criteria, projection = NORMAL_PROJECTION) => {
    return await model.findOne(criteria, projection).lean();
};

/**
* function to update one.
*/
dbService.updateOne = async (model, criteria, dataToUpdate, options= {new: true}) => {
    return await model.updateOne(criteria, dataToUpdate, options);
};

/**
* function to find and update one.
*/
dbService.findOneAndUpdate = async (model, criteria, dataToUpdate, options= {new: true}) => {
    return await model.findOneAndUpdate(criteria, dataToUpdate, options).lean();
};

/**
* function to update Many.
*/
dbService.updateMany = async (model, criteria, dataToUpdate, projection = {}) => {
    return await model.updateMany(criteria, dataToUpdate, projection).lean();
};

/**
* function to delete one.
*/
dbService.deleteOne = async (model, criteria) => {
    return await model.deleteOne(criteria);
};

/**
* function to delete Many.
*/
dbService.deleteMany = async (model, criteria) => {
    return await model.deleteMany(criteria);
};

/**
* function to apply aggregate on model.
*/
dbService.aggregate = async (model, query) => {
    return await model.aggregate(query);
};



module.exports = dbService;