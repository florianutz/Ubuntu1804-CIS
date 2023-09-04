"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAllEventTypes = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const customError_1 = require("../utils/customError");
const docClient = new aws_sdk_1.default.DynamoDB.DocumentClient();
const headers = {
    "content-type": "application/json",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
};
const findAllEventTypes = async (event) => {
    var _a, _b;
    try {
        const { email } = (_b = (_a = event.requestContext) === null || _a === void 0 ? void 0 : _a.authorizer) === null || _b === void 0 ? void 0 : _b.claims;
        const users = await docClient.scan({
            TableName: 'tft_users',
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
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: "not authorized" })
            };
        const result = await docClient
            .scan({
            TableName: "tft_event_type3_dev",
        })
            .promise();
        const eventTypes = result.Items;
        const toResult = [];
        for (const element of eventTypes) {
            if (element.user_id === user.user_id) {
                toResult.push(element);
            }
        }
        console.log(toResult);
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(toResult),
        };
    }
    catch (e) {
        console.log(e);
        return (0, customError_1.handleError)(e);
    }
};
exports.findAllEventTypes = findAllEventTypes;
//# sourceMappingURL=findAll.js.map