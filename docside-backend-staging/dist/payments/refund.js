"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refundByStripePaymentIntent = void 0;
const customError_1 = require("../utils/customError");
const StripeService_1 = __importDefault(require("../utils/StripeService"));
const headers = {
    "content-type": "application/json",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
};
const refundByStripePaymentIntent = async (event) => {
    try {
        const stripe = await new StripeService_1.default().getStripeClient();
        const reqBody = JSON.parse(event.body);
        await stripe.refunds.create({
            payment_intent: reqBody.stripe_payment_intent,
        });
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ status: "refunded" }),
        };
    }
    catch (e) {
        return (0, customError_1.handleError)(e);
    }
};
exports.refundByStripePaymentIntent = refundByStripePaymentIntent;
//# sourceMappingURL=refund.js.map