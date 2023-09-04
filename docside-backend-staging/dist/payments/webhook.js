"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleStripeWebhooks = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const StripeService_1 = __importDefault(require("../utils/StripeService"));
const docClient = new aws_sdk_1.default.DynamoDB.DocumentClient();
const headers = {
    "content-type": "application/json",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
};
const updateSubscriptionByCheckoutSession = async (checkoutSessionId, customerId, subscriptionId) => {
    try {
        const subscription = await docClient
            .get({
            TableName: "tft_subscriptions",
            Key: {
                stripe_session_id: checkoutSessionId,
            },
        })
            .promise();
        if (!subscription || !subscription.Item) {
            throw new Error("subscription resource not found");
        }
        const item = Object.assign(Object.assign({}, subscription.Item), { stripe_customer_id: customerId, stripe_subscription_id: subscriptionId });
        await docClient
            .put({
            TableName: "tft_subscriptions",
            Item: item,
        })
            .promise();
    }
    catch (e) {
        throw e;
    }
};
const updatePaymentStatusByCheckoutSession = async (checkoutSessionId, status, payment_intent) => {
    try {
        const payment = await docClient
            .get({
            TableName: "tft_payments",
            Key: {
                stripe_session_id: checkoutSessionId,
            },
        })
            .promise();
        if (!payment || !payment.Item) {
            throw new Error("payment resource not found");
        }
        const item = payment_intent && payment_intent.length !== 0
            ? Object.assign(Object.assign({}, payment.Item), { updated_at: new Date().toISOString(), stripe_payment_intent: payment_intent, status }) : Object.assign(Object.assign({}, payment.Item), { updated_at: new Date().toISOString(), status });
        await docClient
            .put({
            TableName: "tft_payments",
            Item: item,
        })
            .promise();
    }
    catch (e) {
        throw e;
    }
};
const getSubscriptionBySubscriptionId = async (subscriptionId) => {
    const subscription = await docClient
        .query({
        TableName: "tft_subscriptions",
        IndexName: "stripe_subscription_id",
        KeyConditionExpression: "#stripe_subscription_id = :v_stripe_subscription_id",
        ExpressionAttributeNames: {
            "#stripe_subscription_id": "stripe_subscription_id",
        },
        ExpressionAttributeValues: {
            ":v_stripe_subscription_id": subscriptionId,
        },
    })
        .promise();
    return subscription;
};
const deleteSubscriptionBySubscriptionId = async (subscriptionId) => {
    try {
        const subscription = await getSubscriptionBySubscriptionId(subscriptionId);
        if (!subscription.Items) {
            throw new Error("subscription resources not found");
        }
        await docClient
            .delete({
            TableName: "tft_subscriptions",
            Key: {
                stripe_session_id: subscription.Items[0].stripe_session_id,
            },
        })
            .promise();
    }
    catch (e) {
        throw e;
    }
};
const updatePeriodEndBySubscriptionId = async (subscriptionId, periodEnd) => {
    try {
        const subscription = await getSubscriptionBySubscriptionId(subscriptionId);
        if (!subscription.Items) {
            throw new Error("subscription resources not found");
        }
        await docClient
            .put({
            TableName: "tft_subscriptions",
            Item: Object.assign(Object.assign({}, subscription.Items[0]), { updated_at: new Date().toISOString(), period_end: periodEnd }),
        })
            .promise();
    }
    catch (e) {
        throw e;
    }
};
const updateStatusByPaymentIntent = async (paymentIntentId, status) => {
    try {
        const payment = await docClient
            .query({
            TableName: "tft_payments",
            IndexName: "stripe_payment_intent",
            KeyConditionExpression: "#stripe_payment_intent = :v_stripe_payment_intent",
            ExpressionAttributeNames: {
                "#stripe_payment_intent": "stripe_payment_intent",
            },
            ExpressionAttributeValues: {
                ":v_stripe_payment_intent": paymentIntentId,
            },
        })
            .promise();
        if (!payment.Items) {
            throw new Error("payment resources not found");
        }
        await docClient
            .put({
            TableName: "tft_payments",
            Item: Object.assign(Object.assign({}, payment.Items[0]), { updated_at: new Date().toISOString(), status }),
        })
            .promise();
    }
    catch (e) {
        throw e;
    }
};
const handleStripeWebhooks = async (event) => {
    try {
        const webhookSecret = await StripeService_1.default.getStripeWebhookSecret();
        const stripe = await new StripeService_1.default().getStripeClient();
        const sig = event === null || event === void 0 ? void 0 : event.headers["Stripe-Signature"];
        const stripeEvent = stripe.webhooks.constructEvent(event.body, sig, webhookSecret);
        // View the event object to see what objectId represents, which shows when to use it for stripe_payment_intent or stripe_checkout_id (or something else relevant).
        // https://stripe.com/docs/api#event_object
        const jsonData = JSON.parse(event.body);
        const { id: objectId, payment_intent, customer, subscription, period_end } = jsonData.data.object;
        switch (stripeEvent.type) {
            case "checkout.session.completed":
                if (customer && subscription) {
                    await updateSubscriptionByCheckoutSession(objectId, customer, subscription);
                }
                else {
                    await updatePaymentStatusByCheckoutSession(objectId, "Submitted", payment_intent);
                }
                break;
            case "checkout.session.async_payment_succeeded":
                if (payment_intent) {
                    await updatePaymentStatusByCheckoutSession(objectId, "Succeeded", payment_intent);
                }
                break;
            case "checkout.session.async_payment_failed":
                if (payment_intent) {
                    await updatePaymentStatusByCheckoutSession(objectId, "Failed", payment_intent);
                }
                break;
            case "payment_intent.canceled":
                await updateStatusByPaymentIntent(objectId, "Canceled");
                break;
            case "charge.refunded":
                if (payment_intent) {
                    await updateStatusByPaymentIntent(payment_intent, "Refunded");
                }
                break;
            case "invoice.payment_succeeded":
                if (period_end && subscription) {
                    await updatePeriodEndBySubscriptionId(subscription, period_end);
                }
                break;
            case "customer.subscription.deleted":
                await deleteSubscriptionBySubscriptionId(objectId);
                break;
            default:
                break;
        }
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                received: true,
            }),
        };
    }
    catch (e) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
                error: e.message,
            }),
        };
    }
};
exports.handleStripeWebhooks = handleStripeWebhooks;
//# sourceMappingURL=webhook.js.map