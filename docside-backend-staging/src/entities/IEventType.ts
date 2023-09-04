export interface IEventType {
    event_type_id: string;
    user_id: string,
    title: string;
    durationMin: number;
    maxAttendees: number;
    created_at?: Date,
    updated_at?: Date,
}