"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findOneEventType = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const customError_1 = require("../utils/customError");
const divideIntervals_1 = require("../utils/divideIntervals");
const docClient = new aws_sdk_1.default.DynamoDB.DocumentClient();
const headers = {
    "content-type": "application/json",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
};
const findOneEventType = async (event) => {
    var _a, _b, _c, _d, _e, _f, _g;
    try {
        const id = (_a = event.pathParameters) === null || _a === void 0 ? void 0 : _a.id;
        //1111find the event type needed11111
        const eventType = await docClient
            .get({
            TableName: "tft_event_type3_dev",
            Key: {
                event_type_id: id,
            },
        })
            .promise();
        if (!eventType)
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: "not found" }),
            };
        //22222find the provider of the event type22222222
        const provider_id = (_b = eventType === null || eventType === void 0 ? void 0 : eventType.Item) === null || _b === void 0 ? void 0 : _b.user_id;
        const users = await docClient
            .scan({
            TableName: "tft_users",
        })
            .promise();
        const usersItems = users.Items;
        let provider;
        for (const element of usersItems) {
            if (element.user_id === provider_id) {
                provider = element;
                break;
            }
        }
        if (!provider)
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: "provider not found" }),
            };
        //33333333find the working hours of that user333333
        const result = await docClient
            .scan({
            TableName: "tft_working_hors_dev",
        })
            .promise();
        const workingHours = result.Items;
        let myWorkingHours;
        for (const element of workingHours) {
            if (element.user_id === provider.user_id) {
                myWorkingHours = element;
                break;
            }
        }
        /////////////////////////////////////////////
        const appointmentsResult = await docClient
            .scan({
            TableName: "tft_appointment_dev",
        })
            .promise();
        const appointments = appointmentsResult.Items;
        const eventTypeAppointments = [];
        for (const element of appointments) {
            if (element.event_type_id === ((_c = eventType === null || eventType === void 0 ? void 0 : eventType.Item) === null || _c === void 0 ? void 0 : _c.event_type_id)) {
                eventTypeAppointments.push(element);
            }
        }
        const offset = (_e = (_d = event.queryStringParameters) === null || _d === void 0 ? void 0 : _d.offset) !== null && _e !== void 0 ? _e : 0;
        let appointmentDate;
        if ((_f = event.queryStringParameters) === null || _f === void 0 ? void 0 : _f.appointmentDate) {
            appointmentDate = new Date((_g = event.queryStringParameters) === null || _g === void 0 ? void 0 : _g.appointmentDate);
            appointmentDate.setMinutes(appointmentDate.getMinutes() - (+offset));
        }
        const intervals = (0, divideIntervals_1.divideIntervals)(myWorkingHours, eventType === null || eventType === void 0 ? void 0 : eventType.Item, eventTypeAppointments, +offset, appointmentDate);
        /////////////////////////////////////////////
        const response = {
            workingHours: myWorkingHours,
            eventType: eventType,
            provider: provider,
            intervals: intervals
        };
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(response),
        };
    }
    catch (e) {
        return (0, customError_1.handleError)(e);
    }
};
exports.findOneEventType = findOneEventType;
//# sourceMappingURL=findOne.js.map