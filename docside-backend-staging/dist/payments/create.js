"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStripeCheckoutSession = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const customError_1 = require("../utils/customError");
const StripeService_1 = __importDefault(require("../utils/StripeService"));
const docClient = new aws_sdk_1.default.DynamoDB.DocumentClient();
const headers = {
    "content-type": "application/json",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
};
const storePaymentDataFromSession = async (session, paymentType) => {
    if (paymentType === "one-time") {
        await docClient
            .put({
            TableName: "tft_payments",
            Item: {
                stripe_session_id: session.id,
                status: "Created",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
        })
            .promise();
    }
    else {
        await docClient
            .put({
            TableName: "tft_subscriptions",
            Item: {
                stripe_session_id: session.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
        })
            .promise();
    }
};
const createStripeCheckoutSession = async (event) => {
    try {
        const stripe = await new StripeService_1.default().getStripeClient();
        const reqBody = JSON.parse(event.body);
        let line_items;
        if (reqBody.payment_type === "one-time") {
            const { amount, product_name } = reqBody;
            if (amount < 50 || amount > 99999999) {
                return (0, customError_1.handleError)(new Error("'amount' must be between 50 and 99999999"));
            }
            line_items = [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: product_name,
                        },
                        unit_amount: amount,
                    },
                    quantity: 1,
                },
            ];
        }
        else if (reqBody.payment_type === "subscription") {
            const { stripe_price_id } = reqBody;
            line_items = [{ price: stripe_price_id, quantity: 1 }];
        }
        else {
            return (0, customError_1.handleError)(new Error("payment_type must be either 'subscription' or 'one-time'"));
        }
        const session = await stripe.checkout.sessions.create({
            line_items,
            mode: reqBody.payment_type === "subscription" ? "subscription" : "payment",
            success_url: "https://d22zv89zkd1geo.cloudfront.net/success",
            cancel_url: "https://d22zv89zkd1geo.cloudfront.net/failure",
        });
        await storePaymentDataFromSession(session, reqBody.payment_type);
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ url: session.url }),
        };
    }
    catch (e) {
        return (0, customError_1.handleError)(e);
    }
};
exports.createStripeCheckoutSession = createStripeCheckoutSession;
//# sourceMappingURL=create.js.map