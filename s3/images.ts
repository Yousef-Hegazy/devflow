import sharp from "sharp";

const DEFAULT_MAX_WIDTH = 2000;
const DEFAULT_QUALITY = 100;

export async function compressImage(file: File, maxWidth = DEFAULT_MAX_WIDTH, quality = DEFAULT_QUALITY) {
  const arrayBuffer = await file.arrayBuffer();
  const input = Buffer.from(arrayBuffer);

  // If not an image, return original buffer and mime
  if (!file.type || !file.type.startsWith("image/")) {
    return { buffer: input, mime: file.type || "application/octet-stream" };
  }

  // Build sharp pipeline
  let pipeline = sharp(input).rotate().resize({ width: maxWidth, withoutEnlargement: true });
  let outMime = file.type;

  if (file.type.includes("jpeg") || file.type.includes("jpg")) {
    pipeline = pipeline.jpeg({ quality, mozjpeg: true });
    outMime = "image/jpeg";
  } else if (file.type.includes("png")) {
    // PNG doesn't benefit as much from quality reductions; set a high compression level
    pipeline = pipeline.png({ compressionLevel: 8 });
    outMime = "image/png";
  } else if (file.type.includes("webp")) {
    pipeline = pipeline.webp({ quality });
    outMime = "image/webp";
  } else if (file.type.includes("avif")) {
    pipeline = pipeline.avif({ quality: Math.max(30, Math.min(quality, 60)) });
    outMime = "image/avif";
  } else {
    // Fallback to JPEG to get reasonable compression for unknown image types
    pipeline = pipeline.jpeg({ quality, mozjpeg: true });
    outMime = "image/jpeg";
  }

  const buffer = await pipeline.toBuffer();
  return { buffer, mime: outMime };
}
