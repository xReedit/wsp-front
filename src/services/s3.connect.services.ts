import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import Compressor from 'compressorjs';
import { PUBLIC_AWS_ACCESS_KEY_ID, PUBLIC_AWS_REGION, PUBLIC_AWS_SECRET_ACCESS_KEY, PUBLIC_BUCKET_NAME, PUBLIC_URL_VIEW_BUCKET } from '$env/static/public'
import { showToastSwal } from './mi.swal'

const MAX_FILE_SIZE = 800 * 1024;
const MAX_DIMENSION = 1200;
const MIN_QUALITY = 0.1;

export class S3ImageUploader {    
    private s3Client: S3Client;
    private bucketName = PUBLIC_BUCKET_NAME

    constructor() {
        this.s3Client = new S3Client({
            region: PUBLIC_AWS_REGION,
            credentials: {
                accessKeyId: PUBLIC_AWS_ACCESS_KEY_ID,
                secretAccessKey: PUBLIC_AWS_SECRET_ACCESS_KEY
            }
        });
    }

    async uploadImage(fileName: string, fileData: File): Promise<string> {
        try {
            const _fileData = await this.optimizeImage(fileData);

            const putObjectCommand = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: 'files-bot/'+fileName,
                Body: _fileData,
                ContentType: 'image/jpeg'
            });

            await this.s3Client.send(putObjectCommand)
            return `${PUBLIC_URL_VIEW_BUCKET}${fileName}`;
        } catch (error) {
            showToastSwal('error', 'Error al subir la imagen', 3000)
            console.error('Error al subir la imagen:', error);
            throw error;
        }
    }

    getImageUrl(fileName: string): string {
        return `${PUBLIC_URL_VIEW_BUCKET}${fileName}`;
    }    

    async optimizeImage(file: File | Blob, quality: number = 0.8): Promise<Blob> {
        return new Promise<Blob>((resolve, reject) => {
            new Compressor(file as File, {
                quality,
                maxWidth: MAX_DIMENSION,
                maxHeight: MAX_DIMENSION,
                success: (result) => {
                    if (result.size <= MAX_FILE_SIZE) {
                        resolve(result);
                    } else {
                        const newQuality = quality - 0.1;
                        if (newQuality >= MIN_QUALITY) {
                            this.optimizeImage(result, newQuality)
                                .then(resolve)
                                .catch(reject);
                        } else {
                            showToastSwal('warning', 'La imagen es muy grande, se subir\u00e1 con compresi\u00f3n m\u00e1xima', 3000)
                            resolve(result);
                        }
                    }
                },
                error: (error) => {
                    showToastSwal('error', 'Error al comprimir la imagen', 3000)
                    reject(error);
                },
            });
        });
    }
}
