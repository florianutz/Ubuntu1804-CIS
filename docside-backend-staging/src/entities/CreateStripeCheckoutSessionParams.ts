/**
 * Payment type of either 'one-time' or 'subscription'
 * @typedef {(one-time|subscription)} PaymentType
 */

/**
 * @description Parameters for creating a checkout session depending on if it's a one time payment or subscription.
 * @param {PaymentType} payment_type - accepts values of 'one-time' or 'subscription'.
 * @param {number} amount - required for one-time payment only. Price in cents, minimum 50 maximum 99999999.
 * @param {string} product_name - required for one-time payment only. Name of item.
 * @param {string} stripe_price_id - required for subscription only. ID for price object.
 */

export type CreateStripeCheckoutSessionParams =
  | {
      payment_type: "one-time";
      product_name: string;
      amount: number;
    }
  | {
      payment_type: "subscription";
      stripe_price_id: string;
    };
