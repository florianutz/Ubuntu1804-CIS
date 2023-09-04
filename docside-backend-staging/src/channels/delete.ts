import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import AWS from 'aws-sdk';
import { handleError } from "../utils/customError";

const docClient = new AWS.DynamoDB.DocumentClient()
const headers = {
  'content-type' : 'application/json',
  'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Origin': '*', // Allow from anywhere
        'Access-Control-Allow-Methods':
          'GET, POST, PATCH, PUT, DELETE, OPTIONS',
}

export const deleteChannel = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try{
    const id = event.pathParameters?.id

    const channel = await docClient.delete({
      TableName: 'tft_channel',
      Key: {
        external_channel_id: id
      }
    }).promise();
  
    if (!channel)
      return {
        statusCode: 404,
        body: JSON.stringify("Channel not found")
      };
  
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify("Channel deleted")
    };
  }catch(e){
    return handleError(e)
  }
  
};