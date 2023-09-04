import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import crypto from "crypto";
import AWS from "aws-sdk";
import { handleError } from "../utils/customError";
import IUser from "../entities/IUser";

const docClient = new AWS.DynamoDB.DocumentClient();
const headers = {
  "content-type": "application/json",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Origin": "*", // Allow from anywhere
  "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
};

export const setPin = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { pin } = JSON.parse(event.body as string);
    const { email } = event.requestContext?.authorizer?.claims;
    if (!email) return handleError({ statusCode: 403, message: "User is not authorized" });

    const hash = crypto.createHash("sha256");
    const hashPin = hash.update(pin).digest("hex");

    const user = await docClient
      .get({
        TableName: "tft_users",
        Key: {
          email: email,
        },
      })
      .promise();

    if (!user)
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: "not found" }),
      };

    const userData = {
      ...user,
      user_id: (user as IUser).user_id,
      code: hashPin,
    };

    const userRes = await docClient
      .put({
        TableName: "tft_users",
        Item: userData,
      })
      .promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(userRes),
    };
  } catch (e) {
    return handleError(e);
  }
};
