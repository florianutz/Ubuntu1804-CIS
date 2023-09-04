"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findMe = exports.findOneByEmail = exports.findOneUser = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const customError_1 = require("../utils/customError");
const docClient = new aws_sdk_1.default.DynamoDB.DocumentClient();
const headers = {
    'content-type': 'application/json',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
};
const findOneUser = async (event) => {
    var _a;
    try {
        const id = (_a = event.pathParameters) === null || _a === void 0 ? void 0 : _a.id;
        const user = await docClient.get({
            TableName: 'tft_users',
            Key: {
                user_id: id
            }
        }).promise();
        if (!user)
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: "not found" })
            };
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
exports.findOneUser = findOneUser;
const findOneByEmail = async (event) => {
    var _a;
    try {
        const email = (_a = event.pathParameters) === null || _a === void 0 ? void 0 : _a.email;
        const result = await docClient.scan({
            TableName: 'tft_users',
        }).promise();
        console.log(result);
        const users = result.Items;
        let user = null;
        for (const element of users) {
            if (element.email === email) {
                user = element;
                break;
            }
        }
        if (!user)
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: "not found" })
            };
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
exports.findOneByEmail = findOneByEmail;
const findMe = async (event) => {
    var _a, _b;
    try {
        const { email } = (_b = (_a = event.requestContext) === null || _a === void 0 ? void 0 : _a.authorizer) === null || _b === void 0 ? void 0 : _b.claims;
        if (!email)
            return (0, customError_1.handleError)({ statusCode: 403, message: 'User is not authorized' });
        const user = await docClient.get({
            TableName: 'tft_users',
            Key: {
                email: email
            }
        }).promise();
        if (!user)
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: "not found" })
            };
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
exports.findMe = findMe;
//# sourceMappingURL=findOne.js.map