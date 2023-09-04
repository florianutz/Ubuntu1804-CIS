export type ICall = {
    call_id: string,
    user_id: string,
    attendeesId: string[],
    startDate: Date,
    endDate: Date,
    duration: Date,
    status: 'Missing call' | 'Finished Call' | 'Hang Off Call'
}