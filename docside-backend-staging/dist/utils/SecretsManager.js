"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
class SecretsManager {
    static async getSecret(secretName, region) {
        const config = { region };
        const secretsManager = new aws_sdk_1.default.SecretsManager(config);
        try {
            const secretValue = await secretsManager.getSecretValue({ SecretId: secretName }).promise();
            if ("SecretString" in secretValue) {
                return JSON.parse(secretValue.SecretString);
            }
            else {
                const buff = Buffer.from(secretValue.SecretBinary, "base64");
                const buffStr = buff.toString("ascii");
                return JSON.parse(buffStr);
            }
        }
        catch (err) {
            throw err;
        }
    }
}
exports.default = SecretsManager;
//# sourceMappingURL=SecretsManager.js.map