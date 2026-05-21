import { S3Client } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
  region: "us-east-1",
  endpoint: process.env.PARSPACK_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.PARSPACK_ACCESS_KEY!,
    secretAccessKey: process.env.PARSPACK_SECRET_KEY!,
  },
  forcePathStyle: true,
});
