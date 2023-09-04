import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import AWS from "aws-sdk";
import { handleError } from "../utils/customError";
import { CreateStripeCheckoutSessionParams } from "../entities/CreateStripeCheckoutSessionParams";
import Stripe from "stripe";
import StripeService from "../utils/StripeService";

const docClient = new AWS.DynamoDB.DocumentClient();
const headers = {
  "content-type": "application/json",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Origin": "*", // Allow from anywhere
  "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
};

const storePaymentDataFromSession = async (
  session: Stripe.Response<Stripe.Checkout.Session>,
  paymentType: "subscription" | "one-time",
) => {
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
  } else {
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

export const createStripeCheckoutSession = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const stripe = await new StripeService().getStripeClient();
    const reqBody = JSON.parse(event.body as string) as CreateStripeCheckoutSessionParams;
    let line_items: Stripe.Checkout.SessionCreateParams.LineItem[];
    if (reqBody.payment_type === "one-time") {
      const { amount, product_name } = reqBody;
      if (amount < 50 || amount > 99999999) {
        return handleError(new Error("'amount' must be between 50 and 99999999"));
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
    } else if (reqBody.payment_type === "subscription") {
      const { stripe_price_id } = reqBody;
      line_items = [{ price: stripe_price_id, quantity: 1 }];
    } else {
      return handleError(new Error("payment_type must be either 'subscription' or 'one-time'"));
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
  } catch (e) {
    return handleError(e);
  }
};
