"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMe = exports.createUser = void 0;
const uuid_1 = require("uuid");
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const customError_1 = require("../utils/customError");
const docClient = new aws_sdk_1.default.DynamoDB.DocumentClient();
const headers = {
    "content-type": "application/json",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
};
const createUser = async (event) => {
    try {
        const reqBody = JSON.parse(event.body);
        const user = Object.assign(Object.assign({}, reqBody), { created_at: new Date(), updated_at: new Date(), user_id: (0, uuid_1.v4)() });
        const userData = await docClient
            .put({
            TableName: "tft_users",
            Item: user,
        })
            .promise();
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(userData),
        };
    }
    catch (e) {
        return (0, customError_1.handleError)(e);
    }
};
exports.createUser = createUser;
const createMe = async (event) => {
    var _a, _b;
    try {
        const cognito_user = (_b = (_a = event.requestContext) === null || _a === void 0 ? void 0 : _a.authorizer) === null || _b === void 0 ? void 0 : _b.claims;
        //verify if user already exist
        const result = await docClient
            .scan({
            TableName: "tft_users",
        })
            .promise();
        const users = result.Items;
        let user = null;
        for (const element of users) {
            if (element.email === cognito_user.email) {
                user = element;
                break;
            }
        }
        // if user already exist don't create but return it
        if (user)
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(user),
            };
        const userProfile = {
            first_name: cognito_user.name,
            last_name: cognito_user.family_name,
            referral_code: "",
            cognito_id: cognito_user.sub,
            email: cognito_user.email,
            code: "",
            MFA_enabled: false,
            active: true,
            events_id: "0",
            created_at: new Date(),
            updated_at: new Date(),
            user_id: (0, uuid_1.v4)(),
        };
        await docClient
            .put({
            TableName: "tft_users",
            Item: userProfile,
        })
            .promise();
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(userProfile),
        };
    }
    catch (e) {
        return (0, customError_1.handleError)(e);
    }
};
exports.createMe = createMe;
//# sourceMappingURL=create.js.map