export type Subscription = {
  stripe_session_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  period_end: number;
};
