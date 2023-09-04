import AWS, { S3 } from 'aws-sdk';

AWS.config.update({
  accessKeyId: process.env.AWS_A_KEY,
  secretAccessKey: process.env.AWS_S_KEY
});

export const s3Client = new S3({
  signatureVersion: 'v4'
});
