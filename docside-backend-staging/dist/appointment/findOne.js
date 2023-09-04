"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findOneAppointment = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const customError_1 = require("../utils/customError");
const docClient = new aws_sdk_1.default.DynamoDB.DocumentClient();
const headers = {
    "content-type": "application/json",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
};
const findOneAppointment = async (event) => {
    var _a, _b;
    try {
        const id = (_a = event.pathParameters) === null || _a === void 0 ? void 0 : _a.id;
        //1111find the appointment needed11111
        const appointment = await docClient
            .get({
            TableName: "tft_appointment_dev",
            Key: {
                appointment_id: id,
            },
        })
            .promise();
        console.log("-----------------------");
        console.log(appointment);
        if (!appointment)
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: "not found" }),
            };
        //22222find the users of the appointment22222222
        const usersIds = (_b = appointment === null || appointment === void 0 ? void 0 : appointment.Item) === null || _b === void 0 ? void 0 : _b.usersIds;
        console.log(usersIds);
        const users = await docClient
            .scan({
            TableName: "tft_users",
        })
            .promise();
        const usersItems = users.Items;
        let attendees = [];
        for (const id of usersIds) {
            const attendee = usersItems.find((user) => user.user_id === id);
            if (attendee)
                attendees.push(attendee);
        }
        console.log("-----------------------");
        console.log(attendees);
        const response = {
            appointment: appointment,
            attendees: attendees,
        };
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(response),
        };
    }
    catch (e) {
        console.log(e);
        return (0, customError_1.handleError)(e);
    }
};
exports.findOneAppointment = findOneAppointment;
//# sourceMappingURL=findOne.js.map