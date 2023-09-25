import aws from "aws-sdk";

export class AwsStorage {
  private readonly s3: aws.S3;
  private readonly bucket: string;
  private readonly expiration: number;
  constructor(
    accessKey: string,
    secretKey: string,
    region: string,
    bucket: string,
    expiration: number
  ) {
    if (
      accessKey.trim().length == 0 ||
      secretKey.trim().length == 0 ||
      region.trim().length == 0 ||
      bucket.trim().length == 0 ||
      expiration == 0
    ) {
      throw new Error(
        "Invalid constructor for aws storage... please make sure all items are valid..."
      );
    }
    this.s3 = new aws.S3({
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
      region: region,
    });
    this.bucket = bucket;
    this.expiration = expiration;
  }

  generateSignedUrl: (key: string) => string = (key) => {
    const params = {
      Bucket: this.bucket,
      Key: key,
      Expires: this.expiration,
    };
    const presignedUrl = this.s3.getSignedUrl("getObject", params);
    return presignedUrl;
  };
}
