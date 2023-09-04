import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { v4 } from "uuid";
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

export const createUser = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const reqBody = JSON.parse(event.body as string) as IUser;
    const user: IUser = {
      ...reqBody,
      created_at: new Date(),
      updated_at: new Date(),
      user_id: v4(),
    };
    const userData = await docClient
      .put({
        TableName: "tft_users",
        Item: user,
      })
      .promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(userData),
    };
  } catch (e) {
    return handleError(e);
  }
};

export const createMe = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const cognito_user = event.requestContext?.authorizer?.claims;

    //verify if user already exist
    const result = await docClient
      .scan({
        TableName: "tft_users",
      })
      .promise();
    const users = result.Items as IUser[];
    let user = null;
    for (const element of users) {
      if (element.email === cognito_user.email) {
        user = element;
        break;
      }
    }
    // if user already exist don't create but return it
    if (user)
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(user),
      };

    const userProfile: IUser = {
      first_name: cognito_user.name,
      last_name: cognito_user.family_name,
      referral_code: "",
      cognito_id: cognito_user.sub,
      email: cognito_user.email,
      code: "",
      MFA_enabled: false,
      active: true,
      events_id: "0",
      created_at: new Date(),
      updated_at: new Date(),
      user_id: v4(),
    };
    await docClient
      .put({
        TableName: "tft_users",
        Item: userProfile,
      })
      .promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(userProfile),
    };
  } catch (e) {
    return handleError(e);
  }
};
