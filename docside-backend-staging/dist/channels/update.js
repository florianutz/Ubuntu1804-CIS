"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unreadReadChannel = exports.archiveUnarchiveChannel = exports.updateChannel = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const customError_1 = require("../utils/customError");
const chimesdkmessaging_1 = __importDefault(require("aws-sdk/clients/chimesdkmessaging"));
const docClient = new aws_sdk_1.default.DynamoDB.DocumentClient();
const headers = {
    'content-type': 'application/json',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
};
const updateChannel = async (event) => {
    var _a;
    try {
        const id = (_a = event.pathParameters) === null || _a === void 0 ? void 0 : _a.id;
        const reqBody = JSON.parse(event.body);
        if (id) {
            const currentChannel = await docClient
                .get({
                TableName: "tft_channel",
                Key: {
                    channel_id: id,
                },
            })
                .promise();
            if (!currentChannel)
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ error: "not found" }),
                };
            const currentChannelItem = currentChannel === null || currentChannel === void 0 ? void 0 : currentChannel.Item;
            const channelData = Object.assign(Object.assign({}, currentChannelItem), reqBody);
            const userRes = await docClient
                .put({
                TableName: "tft_channel",
                Item: channelData,
            })
                .promise();
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(userRes),
            };
        }
        else {
            throw new Error("event type not found");
        }
    }
    catch (e) {
        console.log(e);
        return (0, customError_1.handleError)(e);
    }
};
exports.updateChannel = updateChannel;
const archiveUnarchiveChannel = async (event) => {
    var _a, _b, _c, _d;
    try {
        const { sub } = (_b = (_a = event.requestContext) === null || _a === void 0 ? void 0 : _a.authorizer) === null || _b === void 0 ? void 0 : _b.claims;
        const external_channel_id_param = (_c = event.pathParameters) === null || _c === void 0 ? void 0 : _c.id;
        const appInstanceArn = "arn:aws:chime:us-east-1:932483909208:app-instance/0bcc044e-8941-438e-ba61-f35086bbfd84";
        const external_channel_id = `${appInstanceArn}/channel/${external_channel_id_param}`;
        const reqBody = JSON.parse(event.body);
        console.log(reqBody);
        if (external_channel_id) {
            const currentChannel = await docClient
                .scan({
                TableName: "tft_channel",
                FilterExpression: "external_channel_id = :external_channel_id",
                ExpressionAttributeValues: {
                    ':external_channel_id': external_channel_id,
                }
            })
                .promise();
            if (!(currentChannel === null || currentChannel === void 0 ? void 0 : currentChannel.Items))
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ error: "not found" }),
                };
            const currentChannelItem = currentChannel === null || currentChannel === void 0 ? void 0 : currentChannel.Items[0];
            let membersId = [];
            if ((_d = currentChannelItem === null || currentChannelItem === void 0 ? void 0 : currentChannelItem.arquive) === null || _d === void 0 ? void 0 : _d.membersId) {
                membersId = [...currentChannelItem.arquive.membersId];
            }
            const found = membersId.findIndex((element) => element === sub);
            if (reqBody.archive === true) { //if user is archiving
                if (found === -1) //archive if is not archived for the user
                    membersId.push(sub);
            }
            else {
                if (found !== -1)
                    membersId.splice(found, 1);
            }
            const channelData = Object.assign(Object.assign({}, currentChannelItem), { arquive: {
                    isArquive: false,
                    membersId: membersId
                } });
            const chimeBearerArn = `${appInstanceArn}/user/${sub}`;
            const params = {
                ChannelArn: external_channel_id,
                ChimeBearer: chimeBearerArn,
            };
            const chimeMessaging = new chimesdkmessaging_1.default();
            const request = await chimeMessaging.describeChannel(params);
            const response = await request.promise();
            const chimeChannel = response === null || response === void 0 ? void 0 : response.Channel;
            if (chimeChannel) {
                const channelsCompose = Object.assign(Object.assign({}, channelData), { ChannelSummary: chimeChannel });
                await docClient
                    .put({
                    TableName: "tft_channel",
                    Item: channelsCompose,
                })
                    .promise();
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify(channelsCompose),
                };
            }
            else {
                throw new Error("chime channel not found");
            }
        }
        else {
            throw new Error("channel not found");
        }
    }
    catch (e) {
        console.log(e);
        return (0, customError_1.handleError)(e);
    }
};
exports.archiveUnarchiveChannel = archiveUnarchiveChannel;
const unreadReadChannel = async (event) => {
    var _a, _b, _c, _d;
    try {
        const { sub } = (_b = (_a = event.requestContext) === null || _a === void 0 ? void 0 : _a.authorizer) === null || _b === void 0 ? void 0 : _b.claims;
        const external_channel_id_param = (_c = event.pathParameters) === null || _c === void 0 ? void 0 : _c.id;
        const appInstanceArn = "arn:aws:chime:us-east-1:932483909208:app-instance/0bcc044e-8941-438e-ba61-f35086bbfd84";
        const external_channel_id = `${appInstanceArn}/channel/${external_channel_id_param}`;
        const reqBody = JSON.parse(event.body);
        console.log(reqBody);
        if (external_channel_id) {
            const currentChannel = await docClient
                .scan({
                TableName: "tft_channel",
                FilterExpression: "external_channel_id = :external_channel_id",
                ExpressionAttributeValues: {
                    ':external_channel_id': external_channel_id,
                }
            })
                .promise();
            if (!(currentChannel === null || currentChannel === void 0 ? void 0 : currentChannel.Items))
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ error: "not found" }),
                };
            const currentChannelItem = currentChannel === null || currentChannel === void 0 ? void 0 : currentChannel.Items[0];
            let membersId = [];
            if ((_d = currentChannelItem === null || currentChannelItem === void 0 ? void 0 : currentChannelItem.unread) === null || _d === void 0 ? void 0 : _d.membersId) {
                membersId = [...currentChannelItem.unread.membersId];
            }
            const found = membersId.findIndex((element) => element === sub);
            if (reqBody.unread === true) { //if channel is unread for this user
                if (found === -1) //mark as unread if is not read for the user
                    membersId.push(sub);
            }
            else {
                if (found !== -1)
                    membersId.splice(found, 1);
            }
            const channelData = Object.assign(Object.assign({}, currentChannelItem), { unread: {
                    membersId: membersId
                } });
            const chimeBearerArn = `${appInstanceArn}/user/${sub}`;
            const params = {
                ChannelArn: external_channel_id,
                ChimeBearer: chimeBearerArn,
            };
            const chimeMessaging = new chimesdkmessaging_1.default();
            const request = await chimeMessaging.describeChannel(params);
            const response = await request.promise();
            const chimeChannel = response === null || response === void 0 ? void 0 : response.Channel;
            if (chimeChannel) {
                const channelsCompose = Object.assign(Object.assign({}, channelData), { ChannelSummary: chimeChannel });
                await docClient
                    .put({
                    TableName: "tft_channel",
                    Item: channelsCompose,
                })
                    .promise();
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify(channelsCompose),
                };
            }
            else {
                throw new Error("chime channel not found");
            }
        }
        else {
            throw new Error("channel not found");
        }
    }
    catch (e) {
        console.log(e);
        return (0, customError_1.handleError)(e);
    }
};
exports.unreadReadChannel = unreadReadChannel;
//# sourceMappingURL=update.js.map