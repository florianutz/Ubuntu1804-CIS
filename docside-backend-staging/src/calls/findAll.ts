import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import AWS from 'aws-sdk';
import { ICall } from "../entities/ICall";
import { handleError } from "../utils/customError";

const docClient = new AWS.DynamoDB.DocumentClient()
const headers = {
  'content-type': 'application/json',
  'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Origin': '*', // Allow from anywhere
        'Access-Control-Allow-Methods':
          'GET, POST, PATCH, PUT, DELETE, OPTIONS',
}
export const findAllCall = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  const id = event.pathParameters?.user_id
  try {
    const result = await docClient.scan({
      TableName: 'tft_calls',
    }).promise();

    const calls = result.Items as ICall[];
    const toResult = [];
    for (const element of calls) {
      if (element.user_id === id) {
        toResult.push(element)
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(calls)
    };
  } catch (e) {
    return handleError(e)
  }

};
