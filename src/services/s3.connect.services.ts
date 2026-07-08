import Compressor from 'compressorjs';
import { PUBLIC_URL_VIEW_BUCKET } from '$env/static/public'
import { postDataJSON } from './httpClient.services'
import { showToastSwal } from './mi.swal'

const MAX_FILE_SIZE = 800 * 1024;
const MAX_DIMENSION = 1200;
const MIN_QUALITY = 0.1;

// Sube imágenes de la carta a S3 vía URL prefirmada del backend.
// Las credenciales AWS ya NO viven en el navegador: el backend firma una URL
// temporal (60s) que solo permite subir un jpeg a files-bot/.
export class S3ImageUploader {

    async uploadImage(fileName: string, fileData: File): Promise<string> {
        try {
            const _fileData = await this.optimizeImage(fileData);

            const presign: any = await postDataJSON('', 'presign-upload', { fileName });
            if (!presign?.success || !presign?.uploadUrl) {
                throw new Error(presign?.error || 'No se pudo obtener la URL de subida');
            }

            const rpt = await fetch(presign.uploadUrl, {
                method: 'PUT',
                headers: { 'Content-Type': 'image/jpeg' },
                body: _fileData
            });
            if (!rpt.ok) {
                throw new Error(`Error subiendo a S3: ${rpt.status}`);
            }

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
                            showToastSwal('warning', 'La imagen es muy grande, se subirá con compresión máxima', 3000)
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
