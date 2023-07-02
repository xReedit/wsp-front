import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
// import imageCompression from 'browser-image-compression';
// import * as sharp from 'sharp';
// import * as Jimp from 'jimp';
import Compressor from 'compressorjs';

import { PUBLIC_AWS_ACCESS_KEY_ID, PUBLIC_AWS_REGION, PUBLIC_AWS_SECRET_ACCESS_KEY, PUBLIC_BUCKET_NAME, PUBLIC_URL_VIEW_BUCKET } from '$env/static/public'

export class S3ImageUploader {    
    private s3Client: S3Client;
    private bucketName = PUBLIC_BUCKET_NAME

    constructor() {
        // Configura las credenciales y la región de AWS
        this.s3Client = new S3Client({
            region: PUBLIC_AWS_REGION, // Reemplaza 'tu-region' con la región de tu bucket de S3
            credentials: {
                accessKeyId: PUBLIC_AWS_ACCESS_KEY_ID,
                secretAccessKey: PUBLIC_AWS_SECRET_ACCESS_KEY
            }
        });
    }

    async uploadImage(fileName: string, fileData: Buffer): Promise<string> {

        const _fileData = await this.optimizeImage(fileData);

        const putObjectCommand = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: 'files-bot/'+fileName,
            Body: _fileData,
            ContentType: 'image/jpeg'
        });


        try {
            await this.s3Client.send(putObjectCommand)
            return `${PUBLIC_URL_VIEW_BUCKET}${fileName}`;
        } catch (error) {
            console.error('Error al subir la imagen:', error);
            throw error;
        }
    }

    getImageUrl(fileName: string): string {
        return `${PUBLIC_URL_VIEW_BUCKET}${fileName}`;
    }    

    async optimizeImage(file: File): Promise<Blob> {
        const maxFileSize = 800 * 1024; // Tamaño máximo permitido en bytes
        const quality = 0.8; // Calidad de compresión JPEG (0.8 es un ejemplo, puedes ajustarlo según tus necesidades)

        return new Promise<Blob>((resolve, reject) => {
            new Compressor(file, {
                quality,
                maxWidth: 1200, // Ajusta el ancho máximo de la imagen según tus necesidades
                maxHeight: 1200, // Ajusta la altura máxima de la imagen según tus necesidades
                success(result) {
                    if (result.size <= maxFileSize) {
                        resolve(result);
                    } else {
                        // Si el tamaño de la imagen aún excede el límite permitido, vuelva a comprimir con una calidad menor
                        const newQuality = quality - 0.1;
                        if (newQuality >= 0.1) {
                            resolve(optimizeImage(result));
                        } else {
                            reject(new Error('No se pudo reducir el tamaño de la imagen dentro del límite permitido.'));
                        }
                    }
                },
                error(error) {
                    reject(error);
                },
            });
        });
    }
}
