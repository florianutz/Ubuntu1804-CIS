import Stripe from "stripe";
import SecretsManager from "./SecretsManager";

class StripeService {
  getStripeClient = async () => {
    try {
      const secretName = "stripe-api-key-dev";
      const region = "us-east-1";
      const apiValue = await SecretsManager.getSecret(secretName, region);
      const stripe = new Stripe(apiValue.secretKey as string, {
        apiVersion: "2022-11-15",
      });
      return stripe;
    } catch (err) {
      throw err;
    }
  };

  static getStripeWebhookSecret = async () => {
    const secretName = "stripe-api-key-dev";
    const region = "us-east-1";
    const apiValue = await SecretsManager.getSecret(secretName, region);
    return apiValue.stripeWebhook;
  };
}

export default StripeService;
