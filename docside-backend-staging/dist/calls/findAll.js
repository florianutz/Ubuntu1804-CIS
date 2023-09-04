"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAllCall = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const customError_1 = require("../utils/customError");
const docClient = new aws_sdk_1.default.DynamoDB.DocumentClient();
const headers = {
    'content-type': 'application/json',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
};
const findAllCall = async (event) => {
    var _a;
    const id = (_a = event.pathParameters) === null || _a === void 0 ? void 0 : _a.user_id;
    try {
        const result = await docClient.scan({
            TableName: 'tft_calls',
        }).promise();
        const calls = result.Items;
        const toResult = [];
        for (const element of calls) {
            if (element.user_id === id) {
                toResult.push(element);
            }
        }
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(calls)
        };
    }
    catch (e) {
        return (0, customError_1.handleError)(e);
    }
};
exports.findAllCall = findAllCall;
//# sourceMappingURL=findAll.js.map