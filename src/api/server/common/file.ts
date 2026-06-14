import axios from 'axios';
import { ApiResponse } from '@/utils/request';

export interface FileUploadResult {
  bucket: string;
  objectKey: string;
  url: string;
  proxyUrl: string;
  fileName: string;
  size: number;
  contentType: string;
}

/** 上传文件到 MinIO */
export function uploadFile(file: File, folder?: string) {
  const formData = new FormData();
  formData.append('file', file);
  const query = folder ? `?folder=${encodeURIComponent(folder)}` : '';
  return axios.post<FormData, ApiResponse<FileUploadResult>>(
    `/api/File/upload${query}`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );
}
