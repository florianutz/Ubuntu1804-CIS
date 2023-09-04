export enum AppLock {
    Disabled = 'Disabled',
    Face_ID = 'Face_ID',
    Touch_ID = 'Touch_ID',
    PIN = 'PIN'
}

export default interface IUser {
    first_name?: string,
    last_name?: string,
    middle_name?: string,
    referral_code?: string,
    user_id?: string,
    created_at?: Date,
    updated_at?: Date,
    email?: string,
    code?: string,
    app_lock?: AppLock,
    MFA_enabled?: boolean,
    phone_number?: string
    country_code?: string,
    calling_code?: string,
    photo?: string,
    address?: string,
    remember_device?: boolean,
    cognito_id?: string
    active?: boolean;
    events_id?: string;
}

export interface IUsersArns {
    users_arns: string[];
}