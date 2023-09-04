import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import AWS from 'aws-sdk';
import { IArchiveChannel, IChannel, IChannelWithChime, IReadChannel } from "../entities/IChannel";
import { handleError } from "../utils/customError";
import ChimeMessaging from "aws-sdk/clients/chimesdkmessaging";

const docClient = new AWS.DynamoDB.DocumentClient()
const headers = {
  'content-type': 'application/json',
  'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Origin': '*', // Allow from anywhere
        'Access-Control-Allow-Methods':
          'GET, POST, PATCH, PUT, DELETE, OPTIONS',
}

export const updateChannel = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id;
    const reqBody = JSON.parse(event.body as string) as IChannel;

    if (id) {
      const currentChannel = await docClient
        .get({
          TableName: "tft_channel",
          Key: {
            channel_id: id,
          },
        })
        .promise();
      if (!currentChannel)
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: "not found" }),
        };
      const currentChannelItem = currentChannel?.Item as IChannel;

      const channelData: IChannel = {
        ...currentChannelItem,
        ...reqBody,
      };
      
      const userRes = await docClient
        .put({
          TableName: "tft_channel",
          Item: channelData,
        })
        .promise();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(userRes),
      };
    } else {
      throw new Error("event type not found");
    }
  } catch (e) {
    console.log(e)
    return handleError(e);
  }
};

export const archiveUnarchiveChannel = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { sub } = event.requestContext?.authorizer?.claims
    const external_channel_id_param = event.pathParameters?.id;
    const appInstanceArn = "arn:aws:chime:us-east-1:932483909208:app-instance/0bcc044e-8941-438e-ba61-f35086bbfd84";
    const external_channel_id = `${appInstanceArn}/channel/${external_channel_id_param}`

    const reqBody = JSON.parse(event.body as string) as IArchiveChannel;
    console.log(reqBody)
    if (external_channel_id) {
      const currentChannel = await docClient
        .scan({
          TableName: "tft_channel",
          FilterExpression: "external_channel_id = :external_channel_id",
          ExpressionAttributeValues: {
            ':external_channel_id': external_channel_id,}
        })
        .promise();
      if (!currentChannel?.Items)
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: "not found" }),
        };
      const currentChannelItem = currentChannel?.Items[0] as IChannel;
      
      let membersId:string[] = []
      if(currentChannelItem?.arquive?.membersId){
        membersId = [...currentChannelItem.arquive.membersId]
      }
      const found = membersId.findIndex((element)=>element === sub)
      if(reqBody.archive === true){ //if user is archiving
        if (found === -1) //archive if is not archived for the user
          membersId.push(sub)
      }else {
        if (found !== -1)
          membersId.splice(found,1)
      }
      const channelData: IChannel = {
        ...currentChannelItem,
        arquive:{
          isArquive:false,
          membersId:membersId
        }
      };

      const chimeBearerArn = `${appInstanceArn}/user/${sub}`;

      const params = {
        ChannelArn: external_channel_id,
        ChimeBearer: chimeBearerArn,
      };
      const chimeMessaging = new ChimeMessaging();
      const request = await chimeMessaging.describeChannel(params);
      const response: AWS.ChimeSDKMessaging.DescribeChannelResponse =
        await request.promise();
      const chimeChannel = response?.Channel;

      if(chimeChannel){
        const channelsCompose: IChannelWithChime={
          ...channelData,
          ChannelSummary:chimeChannel
        }
        await docClient
          .put({
            TableName: "tft_channel",
            Item: channelsCompose,
          })
          .promise();
  
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(channelsCompose),
        };
      }else{
        throw new Error("chime channel not found");
      }
    } else {
      throw new Error("channel not found");
    }
  } catch (e) {
    console.log(e)
    return handleError(e);
  }
};

export const unreadReadChannel = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { sub } = event.requestContext?.authorizer?.claims
    const external_channel_id_param = event.pathParameters?.id;
    const appInstanceArn = "arn:aws:chime:us-east-1:932483909208:app-instance/0bcc044e-8941-438e-ba61-f35086bbfd84";
    const external_channel_id = `${appInstanceArn}/channel/${external_channel_id_param}`

    const reqBody = JSON.parse(event.body as string) as IReadChannel;
    console.log(reqBody)
    if (external_channel_id) {
      const currentChannel = await docClient
        .scan({
          TableName: "tft_channel",
          FilterExpression: "external_channel_id = :external_channel_id",
          ExpressionAttributeValues: {
            ':external_channel_id': external_channel_id,}
        })
        .promise();
      if (!currentChannel?.Items)
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: "not found" }),
        };
      const currentChannelItem = currentChannel?.Items[0] as IChannel;
      
      let membersId:string[] = []
      if(currentChannelItem?.unread?.membersId){
        membersId = [...currentChannelItem.unread.membersId]
      }
      const found = membersId.findIndex((element)=>element === sub)
      if(reqBody.unread === true){ //if channel is unread for this user
        if (found === -1) //mark as unread if is not read for the user
          membersId.push(sub)
      }else {
        if (found !== -1)
          membersId.splice(found,1)
      }
      const channelData: IChannel = {
        ...currentChannelItem,
        unread:{
          membersId:membersId
        }
      };

      const chimeBearerArn = `${appInstanceArn}/user/${sub}`;

      const params = {
        ChannelArn: external_channel_id,
        ChimeBearer: chimeBearerArn,
      };
      const chimeMessaging = new ChimeMessaging();
      const request = await chimeMessaging.describeChannel(params);
      const response: AWS.ChimeSDKMessaging.DescribeChannelResponse =
        await request.promise();
      const chimeChannel = response?.Channel;

      if(chimeChannel){
        const channelsCompose: IChannelWithChime={
          ...channelData,
          ChannelSummary:chimeChannel
        }
        await docClient
          .put({
            TableName: "tft_channel",
            Item: channelsCompose,
          })
          .promise();
  
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(channelsCompose),
        };
      }else{
        throw new Error("chime channel not found");
      }
    } else {
      throw new Error("channel not found");
    }
  } catch (e) {
    console.log(e)
    return handleError(e);
  }
};