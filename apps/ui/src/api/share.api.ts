import { api } from '@/lib/axios';

export interface ShareItemPayload {
  email: string;
  fileId?: string;
  folderId?: string;
  permissions: string[];
}

export interface SharedItem {
  _id: string;
  shareId: string;
  item: any;
  itemType: 'file' | 'folder';
  permissions: string[];
  sharedBy: { name: string; email: string };
  sharedAt: string;
}

export interface ShareRecord {
  _id: string;
  recipient: { _id: string; name: string; email: string };
  permissions: string[];
  sharedAt: string;
}

export const shareItem = async (data: ShareItemPayload) => {
  try {
    const res = await api.post('/files/share', data);
    console.log(res.data);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const getSharedWithMe = async (): Promise<SharedItem[]> => {
  const res = await api.get('/files/shared-with-me');
  console.log(res.data?.data);

  return res?.data?.data;
};

export const revokeShare = async (shareId: string) => {
  const res = await api.delete(`/files/share/${shareId}`);
  return res.data;
};

export const getSharesForItem = async (
  itemId: string,
  itemType: 'file' | 'folder',
): Promise<ShareRecord[]> => {
  const res = await api.get(`/files/shares/${itemId}`, {
    params: { itemType },
  });
  return res.data.data;
};

export interface SearchedUser {
  _id: string;
  name: string;
  email: string;
}

export const searchUsers = async (query: string): Promise<SearchedUser[]> => {
  const res = await api.get('/files/search-users', {
    params: { q: query },
  });
  return res.data.data;
};
