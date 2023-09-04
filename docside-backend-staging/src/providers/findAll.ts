import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import AWS from "aws-sdk";
import { handleError } from "../utils/customError";

const docClient = new AWS.DynamoDB.DocumentClient();
const headers = {
  "content-type": "application/json",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Origin": "*", // Allow from anywhere
  "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
};

const createFilterQuery = (params: AWS.DynamoDB.DocumentClient.ScanInput, filters: string[], search?: string) => {
  params.FilterExpression += search ? " AND (" : "(";
  for (let index = 0; index < filters.length; index++) {
    if (params.ExpressionAttributeNames && params.ExpressionAttributeValues) {
      params.ExpressionAttributeNames["#state"] = "states";
      params.ExpressionAttributeValues[`:states${index}`] = filters[index];
      params.FilterExpression += `contains(#state, :states${index})`;
      if (index !== filters.length - 1) {
        params.FilterExpression += " OR ";
      } else {
        params.FilterExpression += ")";
      }
    }
  }
};

const getAllProviders = async (sort: string, limit: number, page: number) => {
  const queryData = await docClient.scan({ TableName: "providers" }).promise();
  const sortDirection = sort === "asc" ? 1 : -1;
  const items = queryData.Items?.sort((a, b) => (a > b ? sortDirection : -sortDirection));
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      docs: items?.slice(limit * (page - 1), limit * page) ?? [],
      total: queryData.Count,
      page: page * 1,
    }),
  };
};

export const findProviders = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    let { limit = 10, page = 1, sort = "asc", query: search, filter } = event.queryStringParameters as any;
    const sortDirection = sort === "asc" ? 1 : -1;
    filter = filter ? filter.split(",") : undefined;
    if (!!!filter && !!!search) {
      return await getAllProviders(sort, limit, page);
    }
    const params = {
      TableName: "providers",
      IndexName: "fullName-index",
      ExpressionAttributeNames: search
        ? {
            "#name": "fullName",
          }
        : {},
      ExpressionAttributeValues: search
        ? {
            ":value": search,
          }
        : {},
      FilterExpression: search ? "contains(#name, :value)" : "",
    } as AWS.DynamoDB.DocumentClient.ScanInput;

    if (filter && filter.length > 0) {
      createFilterQuery(params, filter, search);
    }

    const queryData = await docClient.scan(params).promise();
    const items = queryData.Items?.sort((a, b) => (a > b ? sortDirection : -sortDirection));
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        docs: items?.slice(limit * (page - 1), limit * page) ?? [],
        total: queryData.Count,
        page: page * 1,
      }),
    };
  } catch (error) {
    return handleError(error);
  }
};
