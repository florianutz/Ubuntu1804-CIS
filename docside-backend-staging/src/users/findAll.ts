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
export const findAllUser = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  try {
    const user = await docClient.scan({
      TableName: 'tft_users',
    }).promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(user)
    };
  } catch (e) {
    return handleError(e)
  }

};
