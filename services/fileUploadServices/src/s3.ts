import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import env from '@packages/env';

export const S3 = async () => {
  const s3Client = new S3Client({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  });
  return s3Client;
};

/*
 * Uploading a file to a specific S3 bucket
 */

export interface AwsS3Credentials {
  bucket_name: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export const generateUploadUrl = async (
  fileName: string,
  fileType: string,
  { bucket_name, region, accessKeyId, secretAccessKey }: AwsS3Credentials,
) => {
  const cleanFileName = fileName.replace(/[^\w.-]/g, '');
  // Path where uploaded file gets stored in S3 bucket
  const uniqueKey = `uploads/${cleanFileName}`;

  // ^ PutObjectCommand :"I want to upload a file into the bucket."
  const putCommand = new PutObjectCommand({
    Bucket: bucket_name,
    Key: uniqueKey,
    ContentType: fileType, // Required for the browser to know how to render it
    // Optional: Force the file to be private by default
    ACL: 'private',
  });

  const getCommand = new GetObjectCommand({
    Bucket: bucket_name,
    Key: uniqueKey,
  });
  const s3Client = await S3();

  //^ The File URL is the permanent location of the file inside the bucket.
  const fileUrl = `https://${bucket_name}.s3.${region}.amazonaws.com/${uniqueKey}`;

  // const fileUrl = await getSignedUrl(s3Client,getCommand,{expiresIn:300});

  /*
    * - This fileUrl will be presigned url that has some expiry always.
           Ex: https://backend-fileupload-bucket.s3.eu-north-1.amazonaws.com/uploads/Adharcard.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIA2D4O4F5LF7DOASTF%2F20260316%2Feu-north-1%2Fs3%2Faws4_request&X-Amz-Date=20260316T150603Z&X-Amz-Expires=300&X-Amz-Signature=f4b7e3ae8e81cf8ba30afd811845944b7bc87dcef56c9d4a208f42a2b6f63957&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject"
    *  - But Public Url for a file like case-1 will have no expiry.
    */

  // ^ An Upload URL is a temporary presigned URL that allows a client to upload a file directly to S3.
  // It is generated using the AWS SDK.
  const uploadUrl = await getSignedUrl(s3Client, putCommand, {
    expiresIn: 300,
  });

  return { fileUrl, uploadUrl, key: uniqueKey };
};
