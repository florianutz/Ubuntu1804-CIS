import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import crypto from 'crypto';
import AWS from 'aws-sdk';
import { handleError } from "../utils/customError";
import IUser from "../entities/IUser";

const docClient = new AWS.DynamoDB.DocumentClient()
const headers = {
  'content-type': 'application/json',
  'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Origin': '*', // Allow from anywhere
        'Access-Control-Allow-Methods':
          'GET, POST, PATCH, PUT, DELETE, OPTIONS',
}

export const verifyPin = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { pin } = JSON.parse(event.body as string);
    const { email } = event.requestContext?.authorizer?.claims
    if(!email)
      return handleError({statusCode: 403, message: 'User is not authorized'})

    const hash = crypto.createHash('sha256');

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

    const hashPin = hash.update(pin).digest('hex');
    if ((user as IUser).code !== hashPin) {
      throw handleError({statusCode: 400, message: 'Invalid pin code'});
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({message: 'Code Verified'})
    };
  } catch (e) {
    return handleError(e)
  }

};
