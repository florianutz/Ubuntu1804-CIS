"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findChannelMembers = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const customError_1 = require("../utils/customError");
const docClient = new aws_sdk_1.default.DynamoDB.DocumentClient();
const headers = {
    "content-type": "application/json",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
};
const findChannelMembers = async (event) => {
    const reqBody = JSON.parse(event.body);
    try {
        /**scan the users to find the members of the channel */
        var titleObject = {};
        var index = 0;
        reqBody === null || reqBody === void 0 ? void 0 : reqBody.users_arns.forEach((userArn) => {
            index++;
            var titleKey = ":titlevalue" + index;
            titleObject[titleKey.toString()] = userArn;
        });
        const result = await docClient
            .scan({
            TableName: "tft_users",
            FilterExpression: "cognito_id IN (" + Object.keys(titleObject).toString() + ")",
            ExpressionAttributeValues: titleObject,
        })
            .promise();
        const users = result.Items;
        const userNames = users.map((user) => {
            var _a;
            const member = {
                name: `${user === null || user === void 0 ? void 0 : user.first_name} ${user === null || user === void 0 ? void 0 : user.last_name} `,
                cognito_id: (_a = user === null || user === void 0 ? void 0 : user.cognito_id) !== null && _a !== void 0 ? _a : '',
            };
            return member;
        });
        const members = {
            channel_member_names: userNames
        };
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(members),
        };
    }
    catch (e) {
        return (0, customError_1.handleError)(e);
    }
};
exports.findChannelMembers = findChannelMembers;
//# sourceMappingURL=findChannelMembers.js.map