import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import AWS from "aws-sdk";
import { ICall } from "../entities/ICall";
import IUser from "../entities/IUser";
import { handleError } from "../utils/customError";

const docClient = new AWS.DynamoDB.DocumentClient();
const headers = {
  "content-type": "application/json",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Origin": "*", // Allow from anywhere
  "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
};

export const updateCall = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id;
    const reqBody = JSON.parse(event.body as string) as ICall;

    const user = await docClient
      .get({
        TableName: "tft_calls",
        Key: {
          call_id: id,
        },
      })
      .promise();

    if (!user)
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: "not found" }),
      };

    const userData: IUser = {
      ...user,
      ...reqBody,
      updated_at: new Date(),
      user_id: id,
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

export const updateMe = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { email } = event.requestContext?.authorizer?.claims;
    if (!email) return handleError({ statusCode: 403, message: "User is not authorized" });

    const reqBody = JSON.parse(event.body as string) as IUser;

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

    const userData: IUser = {
      ...user,
      ...reqBody,
      updated_at: new Date(),
      user_id: (user as IUser).user_id,
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
