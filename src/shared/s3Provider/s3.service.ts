import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  private readonly s3: S3Client;
  private readonly bucketName: string;
  private readonly logger = new Logger(S3Service.name);

  constructor() {
    this.s3 = new S3Client({
      forcePathStyle: true,
      region: process.env.AWS_REGION,
      endpoint: process.env.AWS_ENDPOINT,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    this.bucketName = process.env.AWS_S3_BUCKET_NAME;
  }

  async uploadFile(filePath: string, fileType: string): Promise<void> {
    const fileContent = fs.readFileSync(filePath);

    const fileName = path.basename(filePath);

    const params = {
      Bucket: this.bucketName,
      Key: `${fileName}`,
      Body: fileContent,
      ContentType: fileType,
      ContentDisposition: 'inline',
    };

    try {
      await this.s3.send(new PutObjectCommand(params));

      console.log(
        `Arquivo enviado com sucesso para o bucket ${this.bucketName}/${fileName}.`,
      );

      fs.unlinkSync(filePath);
    } catch (error) {
      this.logger.error(
        `Erro ao enviar arquivo para o bucket: ${error.message}`,
      );
      throw error;
    }
  }
}
