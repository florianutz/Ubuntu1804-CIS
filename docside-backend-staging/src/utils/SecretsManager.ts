import AWS from "aws-sdk";

class SecretsManager {
  static async getSecret(secretName: string, region: string) {
    const config = { region };
    const secretsManager = new AWS.SecretsManager(config);
    try {
      const secretValue = await secretsManager.getSecretValue({ SecretId: secretName }).promise();
      if ("SecretString" in secretValue) {
        return JSON.parse(secretValue.SecretString as string);
      } else {
        const buff = Buffer.from(secretValue.SecretBinary as string, "base64");
        const buffStr = buff.toString("ascii");
        return JSON.parse(buffStr);
      }
    } catch (err: any) {
      throw err;
    }
  }
}

export default SecretsManager;
