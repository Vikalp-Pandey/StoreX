import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  shareItem,
  getSharedWithMe,
  revokeShare,
  getSharesForItem,
  ShareItemPayload,
} from '@/api/share.api';
import { toast } from 'react-toastify';

export const useSharedWithMe = () => {
  return useQuery({
    queryKey: ['shared-with-me'],
    queryFn: getSharedWithMe,
    staleTime: 5000,
  });
};

export const useSharesForItem = (
  itemId: string | null,
  itemType: 'file' | 'folder',
) => {
  return useQuery({
    queryKey: ['shares', itemId, itemType],
    queryFn: () => getSharesForItem(itemId!, itemType),
    enabled: !!itemId,
    staleTime: 5000,
  });
};

export const useShareItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ShareItemPayload) => shareItem(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['shares'] });
      toast.success(data?.detail || 'Item shared successfully');
    },
    onError: (err: any) => {
      const errorMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        'Failed to share item';
      toast.error(errorMessage);
    },
  });
};

export const useRevokeShare = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (shareId: string) => revokeShare(shareId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shares'] });
      queryClient.invalidateQueries({ queryKey: ['shared-with-me'] });
      toast.success('Access revoked');
    },
    onError: (err: any) => {
      const errorMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        'Failed to revoke access';
      toast.error(errorMessage);
    },
  });
};
