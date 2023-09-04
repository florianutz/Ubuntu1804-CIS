"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMe = exports.updateUser = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const customError_1 = require("../utils/customError");
const docClient = new aws_sdk_1.default.DynamoDB.DocumentClient();
const headers = {
    'content-type': 'application/json',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
};
const updateUser = async (event) => {
    var _a;
    try {
        const id = (_a = event.pathParameters) === null || _a === void 0 ? void 0 : _a.id;
        const reqBody = JSON.parse(event.body);
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
        const userData = Object.assign(Object.assign(Object.assign({}, user), reqBody), { updated_at: new Date(), user_id: id });
        const userRes = await docClient.put({
            TableName: 'tft_users',
            Item: userData
        }).promise();
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(userRes)
        };
    }
    catch (e) {
        return (0, customError_1.handleError)(e);
    }
};
exports.updateUser = updateUser;
const updateMe = async (event) => {
    var _a, _b;
    try {
        const { email } = (_b = (_a = event.requestContext) === null || _a === void 0 ? void 0 : _a.authorizer) === null || _b === void 0 ? void 0 : _b.claims;
        if (!email)
            return (0, customError_1.handleError)({ statusCode: 403, message: 'User is not authorized' });
        const reqBody = JSON.parse(event.body);
        const users = await docClient.scan({
            TableName: 'tft_users',
            // Key: {
            //     email: email
            // }
        }).promise();
        let user;
        if (users === null || users === void 0 ? void 0 : users.Items)
            for (let i of users === null || users === void 0 ? void 0 : users.Items) {
                if (i.email === email) {
                    user = i;
                }
            }
        if (!user)
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: "not found" })
            };
        const userData = Object.assign(Object.assign(Object.assign({}, user), reqBody), { updated_at: new Date(), user_id: user.user_id });
        await docClient.put({
            TableName: 'tft_users',
            Item: userData
        }).promise();
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(userData)
        };
    }
    catch (e) {
        return (0, customError_1.handleError)(e);
    }
};
exports.updateMe = updateMe;
//# sourceMappingURL=update.js.map