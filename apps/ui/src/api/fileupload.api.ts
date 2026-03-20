import { api } from '@/lib/axios';
import axios from 'axios';

export const getItems = async (parentFolder?: string) => {
  const res = await api.get('/files/get-items', {
    params: { parentFolder },
  });
  return res.data.data;
};

export interface FilePayload {
  fileName: string;
  fileType: string;
  parentFolder?: string;
}

export const getUploadUrl = async (data: FilePayload) => {
  const res = await api.post('/files/file-upload', data);
  return res.data;
};

export interface SaveFilePayload {
  itemName: string;
  size?: number;
  mimeType?: string;
  key?: string;
  fileUrl?: string;
  parentFolder?: string;
}

export const saveFiles = async (data: SaveFilePayload) => {
  const res = await api.post('/files/save-file', data);
  return res.data;
};

export const deleteFile = async (fileId: string) => {
  const res = await api.delete('/files/delete-file', { params: { fileId } });
  return res.data;
};

export interface SaveFolderPayload {
  name: string;
  size?: number;
  parentFolder?: string;
}

export const saveFolders = async (data: SaveFolderPayload) => {
  const res = await api.post('/files/save-folder', data);
  return res.data;
};

export interface DeleteFolderSchema {
  folderId: string;
  parentFolderId?: string;
}

export const deleteFolder = async (data: DeleteFolderSchema) => {
  const res = await api.delete('/files/delete-folder', {
    params: { folderId: data.folderId, parentFolderId: data.parentFolderId },
  });
  return res.data;
};

type UploadFilePayload = {
  file: File;
  parentFolder?: string;
  onProgress?: (percent: number) => void;
};

export const uploadFileToS3 = async ({
  file,
  parentFolder,
  onProgress,
}: UploadFilePayload) => {
  // try {
  const response = await getUploadUrl({
    fileName: file.name,
    fileType: file.type,
    parentFolder,
  });

  const { fileUrl, uploadUrl, key } = response.data;

  await axios.put(uploadUrl, file, {
    headers: {
      'Content-Type': file.type,
    },
    onUploadProgress: (progressEvent) => {
      const percent = Math.round(
        (progressEvent.loaded * 100) / (progressEvent.total || 1),
      );
      onProgress?.(percent);
    },
  });

  await saveFiles({
    itemName: file.name,
    size: file.size,
    mimeType: file.type,
    key,
    fileUrl,
    parentFolder,
  });

  return { fileUrl, key, parentFolder };
};

export const downloadFileBlob = async (url: string, fileName: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName; // This is the magic line for the "Save As" behavior

    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Download failed:', error);
    throw error; // Re-throw so the dashboard toast can catch it
  }
};

export const createFolder = async (
  name: string,
  size: number,
  parentFolder?: string,
) => {
  return saveFolders({
    name,
    size,
    parentFolder,
  });
};
