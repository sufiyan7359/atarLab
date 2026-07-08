export interface UploadResult {
  url: string;
  publicId: string;
}

export const UPLOAD_PORT = Symbol('UPLOAD_PORT');

export interface UploadPort {
  uploadImage(file: Buffer, originalName: string): Promise<UploadResult>;
}
