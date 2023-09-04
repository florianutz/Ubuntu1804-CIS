"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const stripe_1 = __importDefault(require("stripe"));
const SecretsManager_1 = __importDefault(require("./SecretsManager"));
class StripeService {
    constructor() {
        this.getStripeClient = async () => {
            try {
                const secretName = "stripe-api-key-dev";
                const region = "us-east-1";
                const apiValue = await SecretsManager_1.default.getSecret(secretName, region);
                const stripe = new stripe_1.default(apiValue.secretKey, {
                    apiVersion: "2022-11-15",
                });
                return stripe;
            }
            catch (err) {
                throw err;
            }
        };
    }
}
_a = StripeService;
StripeService.getStripeWebhookSecret = async () => {
    const secretName = "stripe-api-key-dev";
    const region = "us-east-1";
    const apiValue = await SecretsManager_1.default.getSecret(secretName, region);
    return apiValue.stripeWebhook;
};
exports.default = StripeService;
//# sourceMappingURL=StripeService.js.map