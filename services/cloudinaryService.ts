// Cloudinary Upload Service
// Free tier alternative to Firebase Storage

const CLOUD_NAME = (import.meta as any).env?.VITE_CLOUDINARY_CLOUD_NAME || 'dapkfv2kt';
const UPLOAD_PRESET = (import.meta as any).env?.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

export interface CloudinaryUploadResponse {
    secure_url: string;
    public_id: string;
    format: string;
    width: number;
    height: number;
    bytes: number;
    url: string;
}

/**
 * Upload an image to Cloudinary
 */
export async function uploadImageToCloudinary(
    file: File,
    folder: string = 'answer-sheets',
    onProgress?: (progress: number) => void
): Promise<CloudinaryUploadResponse> {
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);
        formData.append('folder', folder);

        const xhr = new XMLHttpRequest();

        // Progress tracking
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable && onProgress) {
                const progress = (e.loaded / e.total) * 100;
                onProgress(progress);
            }
        });

        // Success handler
        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                resolve(response);
            } else {
                reject(new Error(`Upload failed with status ${xhr.status}`));
            }
        });

        // Error handler
        xhr.addEventListener('error', () => {
            reject(new Error('Network error during upload'));
        });

        // Abort handler
        xhr.addEventListener('abort', () => {
            reject(new Error('Upload cancelled'));
        });

        // Send request
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);
        xhr.send(formData);
    });
}

/**
 * Upload a PDF to Cloudinary
 */
export async function uploadPdfToCloudinary(
    file: File,
    folder: string = 'model-answers',
    onProgress?: (progress: number) => void
): Promise<CloudinaryUploadResponse> {
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);
        formData.append('folder', folder);
        formData.append('resource_type', 'raw'); // For PDFs

        const xhr = new XMLHttpRequest();

        // Progress tracking
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable && onProgress) {
                const progress = (e.loaded / e.total) * 100;
                onProgress(progress);
            }
        });

        // Success handler
        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                resolve(response);
            } else {
                reject(new Error(`Upload failed with status ${xhr.status}`));
            }
        });

        // Error handler
        xhr.addEventListener('error', () => {
            reject(new Error('Network error during upload'));
        });

        // Send request
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`);
        xhr.send(formData);
    });
}

/**
 * Delete an image from Cloudinary (requires backend - for reference only)
 * Note: For security, deletion should be done from backend with API secret
 */
export function getCloudinaryPublicId(url: string): string | null {
    // Extract public_id from Cloudinary URL
    // Example: https://res.cloudinary.com/cloud-name/image/upload/v1234567890/folder/filename.jpg
    const matches = url.match(/\/v\d+\/(.+)\.[^.]+$/);
    return matches ? matches[1] : null;
}
