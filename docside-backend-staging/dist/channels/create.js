"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChannel = void 0;
const uuid_1 = require("uuid");
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const customError_1 = require("../utils/customError");
const docClient = new aws_sdk_1.default.DynamoDB.DocumentClient();
const headers = {
    'content-type': 'application/json',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
};
const createChannel = async (event) => {
    try {
        const reqBody = JSON.parse(event.body);
        const channel = Object.assign(Object.assign({}, reqBody), { channel_id: (0, uuid_1.v4)() });
        const userData = await docClient.put({
            TableName: 'tft_channel',
            Item: channel
        }).promise();
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(channel)
        };
    }
    catch (e) {
        return (0, customError_1.handleError)(e);
    }
};
exports.createChannel = createChannel;
//# sourceMappingURL=create.js.map