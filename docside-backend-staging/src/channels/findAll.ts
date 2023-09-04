import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import AWS from "aws-sdk";
import { IChannel, IChannelWithChime } from "../entities/IChannel";
import { handleError } from "../utils/customError";
import ChimeMessaging from "aws-sdk/clients/chimesdkmessaging";

const docClient = new AWS.DynamoDB.DocumentClient();
const headers = {
  "content-type": "application/json",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Origin": "*", // Allow from anywhere
  "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
};
export const findAllChannel = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.user_id;
  try {
    const result = await docClient
      .scan({
        TableName: "tft_channel",
      })
      .promise();

    const channels = result.Items as IChannel[];
    const toResult = [];
    for (const element of channels) {
      if (element.user_id === id) {
        toResult.push(element);
      }
    }
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(toResult),
    };
  } catch (e) {
    return handleError(e);
  }
};

export const findAllUserChannel = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const cognito_user = event.requestContext?.authorizer?.claims;

  try {
    const appInstanceArn = "arn:aws:chime:us-east-1:932483909208:app-instance/0bcc044e-8941-438e-ba61-f35086bbfd84";
    const chimeBearerArn = `${appInstanceArn}/user/${cognito_user.sub}`;

    const params = {
      ChimeBearer: chimeBearerArn,
    };
    const chimeMessaging = new ChimeMessaging();
    const request = (await chimeMessaging).listChannelMembershipsForAppInstanceUser(params);
    const response: AWS.ChimeSDKMessaging.ListChannelMembershipsForAppInstanceUserResponse = await request.promise();
    const chimeChannels = response;
    var titleObject: { [k: string]: any } = {};
    var index = 0;

    chimeChannels?.ChannelMemberships?.forEach((channelMembership) => {
      if (channelMembership?.ChannelSummary) {
        index++;
        var titleKey = ":titlevalue" + index;
        titleObject[titleKey.toString()] = channelMembership?.ChannelSummary.ChannelArn;
      }
    });
    const result = await docClient
      .scan({
        TableName: "tft_channel",
        FilterExpression: "external_channel_id IN (" + Object.keys(titleObject).toString() + ")",
        ExpressionAttributeValues: titleObject,
      })
      .promise();

    const channels = result.Items as IChannel[];
    const channelsCompose: IChannelWithChime[] = [];
    channels.forEach((channel) => {
      const foundChannel = chimeChannels.ChannelMemberships?.find(
        (channelMembership) => channelMembership?.ChannelSummary?.ChannelArn === channel.external_channel_id,
      );
      if (foundChannel && foundChannel?.ChannelSummary) {
        const channelCompose: IChannelWithChime = {
          ...channel,
          Token: chimeChannels.NextToken,
          ChannelSummary: foundChannel?.ChannelSummary,
        };
        channelsCompose.push(channelCompose);
      }
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(channelsCompose),
    };
  } catch (e) {
    return handleError(e);
  }
};
