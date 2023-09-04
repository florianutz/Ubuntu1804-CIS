import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import AWS from "aws-sdk";
import { handleError } from "../utils/customError";
import { Provider, ProviderSchema } from "../entities/Provider";

const docClient = new AWS.DynamoDB.DocumentClient();
const headers = {
  "content-type": "application/json",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Origin": "*", // Allow from anywhere
  "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
};

export const updateProvider = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id;
    const reqBody = JSON.parse(event.body as string) as Partial<Provider>;
    const { success } = ProviderSchema.partial().safeParse(reqBody);
    if (!success) {
      return { statusCode: 422, headers, body: JSON.stringify({ error: "invalid fields" }) };
    }

    const { Item: provider } = await docClient
      .get({
        TableName: "providers",
        Key: {
          id,
        },
      })
      .promise();

    if (!provider) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: "not found" }),
      };
    }

    const userData: Partial<Provider> = {
      ...provider,
      ...reqBody,
      id,
    };

    await docClient
      .put({
        TableName: "providers",
        Item: userData,
      })
      .promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(userData),
    };
  } catch (error) {
    return handleError(error);
  }
};
