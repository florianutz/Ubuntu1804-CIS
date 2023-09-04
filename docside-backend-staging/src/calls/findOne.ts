import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import AWS from 'aws-sdk';
import { handleError } from "../utils/customError";

const docClient = new AWS.DynamoDB.DocumentClient()
const headers = {
  'content-type': 'application/json',
  'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Origin': '*', // Allow from anywhere
        'Access-Control-Allow-Methods':
          'GET, POST, PATCH, PUT, DELETE, OPTIONS',
}

export const findOneCall = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id

    const user = await docClient.get({
      TableName: 'tft_calls',
      Key: {
        call_id: id
      }
    }).promise();

    if (!user)
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: "not found" })
      };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(user)
    };
  } catch (e) {
    return handleError(e)
  }

};

export const findMe = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { email } = event.requestContext?.authorizer?.claims
    if(!email)
      return handleError({statusCode: 403, message: 'User is not authorized'})

    const user = await docClient.get({
      TableName: 'tft_users',
      Key: {
        email: email
      }
    }).promise();

    if (!user)
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: "not found" })
      };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(user)
    };
  } catch (e) {
    return handleError(e)
  }

};
