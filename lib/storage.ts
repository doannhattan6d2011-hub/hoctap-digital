import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const bucket = process.env.STORAGE_BUCKET!;

const client = new S3Client({
  forcePathStyle: true,
  region: process.env.STORAGE_REGION!,
  endpoint: process.env.STORAGE_S3_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY!,
  },
});

export async function createUploadUrl(key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });
  // URL upload chỉ có hiệu lực trong 5 phút (300 giây)
  return getSignedUrl(client, command, { expiresIn: 300 });
}

export async function createDownloadUrl(key: string) {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  // URL download đúng chuẩn bảo mật: chỉ sống 60 giây
  return getSignedUrl(client, command, { expiresIn: 60 });
}

export async function headObject(key: string) {
  const command = new HeadObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  return client.send(command);
}

export async function getObjectHeader(key: string, bytes: number) {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
    Range: `bytes=0-${bytes - 1}`,
  });
  
  const response = await client.send(command);
  
  if (!response.Body) {
    throw new Error("Không thể đọc được body của file từ Storage.");
  }
  
  const byteArray = await response.Body.transformToByteArray();
  return Buffer.from(byteArray);
}

export async function deleteObject(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  return client.send(command);
}