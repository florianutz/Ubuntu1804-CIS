"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAllUser = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const customError_1 = require("../utils/customError");
const docClient = new aws_sdk_1.default.DynamoDB.DocumentClient();
const headers = {
    'content-type': 'application/json',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
};
const findAllUser = async (event) => {
    try {
        const user = await docClient.scan({
            TableName: 'tft_users',
        }).promise();
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(user)
        };
    }
    catch (e) {
        return (0, customError_1.handleError)(e);
    }
};
exports.findAllUser = findAllUser;
//# sourceMappingURL=findAll.js.map