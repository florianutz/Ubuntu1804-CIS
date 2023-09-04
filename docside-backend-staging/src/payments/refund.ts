import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { handleError } from "../utils/customError";
import StripeService from "../utils/StripeService";

const headers = {
  "content-type": "application/json",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Origin": "*", // Allow from anywhere
  "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
};

export const refundByStripePaymentIntent = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const stripe = await new StripeService().getStripeClient();
    const reqBody = JSON.parse(event.body as string) as { stripe_payment_intent: string };
    await stripe.refunds.create({
      payment_intent: reqBody.stripe_payment_intent,
    });
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ status: "refunded" }),
    };
  } catch (e) {
    return handleError(e);
  }
};
