"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPin = void 0;
const crypto_1 = __importDefault(require("crypto"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const customError_1 = require("../utils/customError");
const docClient = new aws_sdk_1.default.DynamoDB.DocumentClient();
const headers = {
    'content-type': 'application/json',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
};
const verifyPin = async (event) => {
    var _a, _b;
    try {
        const { pin } = JSON.parse(event.body);
        const { email } = (_b = (_a = event.requestContext) === null || _a === void 0 ? void 0 : _a.authorizer) === null || _b === void 0 ? void 0 : _b.claims;
        if (!email)
            return (0, customError_1.handleError)({ statusCode: 403, message: 'User is not authorized' });
        const hash = crypto_1.default.createHash('sha256');
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
        const hashPin = hash.update(pin).digest('hex');
        if (user.code !== hashPin) {
            throw (0, customError_1.handleError)({ statusCode: 400, message: 'Invalid pin code' });
        }
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'Code Verified' })
        };
    }
    catch (e) {
        return (0, customError_1.handleError)(e);
    }
};
exports.verifyPin = verifyPin;
//# sourceMappingURL=verify.js.map