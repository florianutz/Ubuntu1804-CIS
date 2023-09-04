"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAllUserChannel = exports.findAllChannel = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const customError_1 = require("../utils/customError");
const chimesdkmessaging_1 = __importDefault(require("aws-sdk/clients/chimesdkmessaging"));
const docClient = new aws_sdk_1.default.DynamoDB.DocumentClient();
const headers = {
    "content-type": "application/json",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
};
const findAllChannel = async (event) => {
    var _a;
    const id = (_a = event.pathParameters) === null || _a === void 0 ? void 0 : _a.user_id;
    try {
        const result = await docClient
            .scan({
            TableName: "tft_channel",
        })
            .promise();
        const channels = result.Items;
        const toResult = [];
        for (const element of channels) {
            if (element.user_id === id) {
                toResult.push(element);
            }
        }
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(toResult),
        };
    }
    catch (e) {
        return (0, customError_1.handleError)(e);
    }
};
exports.findAllChannel = findAllChannel;
const findAllUserChannel = async (event) => {
    var _a, _b, _c;
    const cognito_user = (_b = (_a = event.requestContext) === null || _a === void 0 ? void 0 : _a.authorizer) === null || _b === void 0 ? void 0 : _b.claims;
    try {
        const appInstanceArn = "arn:aws:chime:us-east-1:932483909208:app-instance/0bcc044e-8941-438e-ba61-f35086bbfd84";
        const chimeBearerArn = `${appInstanceArn}/user/${cognito_user.sub}`;
        const params = {
            ChimeBearer: chimeBearerArn,
        };
        const chimeMessaging = new chimesdkmessaging_1.default();
        const request = (await chimeMessaging).listChannelMembershipsForAppInstanceUser(params);
        const response = await request.promise();
        const chimeChannels = response;
        var titleObject = {};
        var index = 0;
        (_c = chimeChannels === null || chimeChannels === void 0 ? void 0 : chimeChannels.ChannelMemberships) === null || _c === void 0 ? void 0 : _c.forEach((channelMembership) => {
            if (channelMembership === null || channelMembership === void 0 ? void 0 : channelMembership.ChannelSummary) {
                index++;
                var titleKey = ":titlevalue" + index;
                titleObject[titleKey.toString()] = channelMembership === null || channelMembership === void 0 ? void 0 : channelMembership.ChannelSummary.ChannelArn;
            }
        });
        const result = await docClient
            .scan({
            TableName: "tft_channel",
            FilterExpression: "external_channel_id IN (" + Object.keys(titleObject).toString() + ")",
            ExpressionAttributeValues: titleObject,
        })
            .promise();
        const channels = result.Items;
        const channelsCompose = [];
        channels.forEach((channel) => {
            var _a;
            const foundChannel = (_a = chimeChannels.ChannelMemberships) === null || _a === void 0 ? void 0 : _a.find((channelMembership) => { var _a; return ((_a = channelMembership === null || channelMembership === void 0 ? void 0 : channelMembership.ChannelSummary) === null || _a === void 0 ? void 0 : _a.ChannelArn) === channel.external_channel_id; });
            if (foundChannel && (foundChannel === null || foundChannel === void 0 ? void 0 : foundChannel.ChannelSummary)) {
                const channelCompose = Object.assign(Object.assign({}, channel), { Token: chimeChannels.NextToken, ChannelSummary: foundChannel === null || foundChannel === void 0 ? void 0 : foundChannel.ChannelSummary });
                channelsCompose.push(channelCompose);
            }
        });
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(channelsCompose),
        };
    }
    catch (e) {
        return (0, customError_1.handleError)(e);
    }
};
exports.findAllUserChannel = findAllUserChannel;
//# sourceMappingURL=findAll.js.map