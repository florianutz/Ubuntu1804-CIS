type IArchive = {
    isArquive: boolean,
    membersId: string[]
}
type IUnread = {
    membersId: string[]
}

export type IChannel = {
    channel_id: string,
    external_channel_id: string,
    user_id: string,
    name: string,
    photo: string,
    extra_data: string,
    arquive: IArchive
    unread:IUnread
}

export type IChannelWithChime = {
    channel_id: string,
    external_channel_id: string,
    user_id: string,
    name: string,
    photo: string,
    extra_data: string,
    arquive: IArchive
    ChannelSummary: AWS.ChimeSDKMessaging.ChannelSummary
    Token?: AWS.ChimeSDKMessaging.NextToken
}

export type IArchiveChannel = {
    archive: boolean,
}

export type IReadChannel = {
    unread: boolean,
}