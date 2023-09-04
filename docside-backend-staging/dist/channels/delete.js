"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteChannel = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const customError_1 = require("../utils/customError");
const docClient = new aws_sdk_1.default.DynamoDB.DocumentClient();
const headers = {
    'content-type': 'application/json',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
};
const deleteChannel = async (event) => {
    var _a;
    try {
        const id = (_a = event.pathParameters) === null || _a === void 0 ? void 0 : _a.id;
        const channel = await docClient.delete({
            TableName: 'tft_channel',
            Key: {
                external_channel_id: id
            }
        }).promise();
        if (!channel)
            return {
                statusCode: 404,
                body: JSON.stringify("Channel not found")
            };
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify("Channel deleted")
        };
    }
    catch (e) {
        return (0, customError_1.handleError)(e);
    }
};
exports.deleteChannel = deleteChannel;
//# sourceMappingURL=delete.js.map