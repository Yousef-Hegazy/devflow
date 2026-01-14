import { env } from "@/env";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "./client";
import { compressImage } from "./images";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

export async function uploadFile(file: File) {
    if (!env.S3_BUCKET_NAME) {
        throw new Error("S3_BUCKET_NAME is not configured");
    }

    // Compress images before uploading
    let key: string;
    let mime: string;
    let body: Buffer;

    if (file.type && file.type.startsWith("image/")) {
        const { buffer, mime: outMime } = await compressImage(file);
        if (buffer.length > MAX_IMAGE_BYTES) {
            throw new Error("Image exceeds maximum allowed size of 5MB after compression");
        }
        body = buffer;
        mime = outMime;
        // Use generated uuid and set extension according to mime
        const ext = outMime.split("/")[1] || "jpg";
        key = `${crypto.randomUUID()}.${ext.replace("jpeg", "jpg")}`;
    } else {
        // Non-image file: upload as-is
        const arrayBuffer = await file.arrayBuffer();
        body = Buffer.from(arrayBuffer);
        mime = file.type || "application/octet-stream";
        key = `${crypto.randomUUID()}_${file.name.replace(/\s+/g, "_")}`;
    }

    await s3Client.send(
        new PutObjectCommand({
            Bucket: env.S3_BUCKET_NAME,
            Key: key,
            Body: body,
            ContentType: mime,
        })
    );

    const endpoint = env.S3_ENDPOINT?.replace(/\/$/, "") || "";
    const url = `${endpoint}/${env.S3_BUCKET_NAME}/${encodeURIComponent(key)}`;

    return { key, url };
}

export async function deleteFile(key: string) {
    if (!env.S3_BUCKET_NAME) return;

    await s3Client.send(
        new DeleteObjectCommand({
            Bucket: env.S3_BUCKET_NAME,
            Key: key,
        })
    );
}
