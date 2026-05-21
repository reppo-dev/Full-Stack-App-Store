"use server";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/lib/s3Client";

export async function s3UploadAction(data: FormData) {
  const file: File | null = data.get("file") as File;
  if (!file) throw new Error("no file");

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const uniqueFileName = `${Date.now()}_${file.name}`;

  const params = {
    Body: buffer,
    Bucket: process.env.PARSPACK_BUCKET_NAME!,
    Key: uniqueFileName,
    ContentType: file.type,
  };

  try {
    await s3Client.send(new PutObjectCommand(params));
    const imageUrl = `https://${process.env.PARSPACK_BUCKET_NAME}.c675240.parspack.net/${uniqueFileName}`;
    return { success: true as const, imagePath: imageUrl };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}
