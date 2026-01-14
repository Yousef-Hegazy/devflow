import { env } from "@/env";
import { S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
    endpoint: env.S3_ENDPOINT,
    region: env.S3_REGION, // MinIO ignores this but SDK requires it
    credentials: {
        accessKeyId: env.S3_ACCESS_KEY,
        secretAccessKey: env.S3_SECRET_KEY,
    },
    forcePathStyle: true, // IMPORTANT: MinIO requires this
});

export default s3Client;