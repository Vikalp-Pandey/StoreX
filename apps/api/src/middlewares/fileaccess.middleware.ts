import Files from '@/models/fileModels/file.model';
import Folders from '@/models/fileModels/folder.model';
import sharedItem from '@/models/fileModels/sharedItem.model';
import { asyncHandler, sendResponse } from '@packages/httputils';
import { Request, Response, NextFunction } from 'express';

const findAncestorShare = async (
  folderId: string,
  userId: string,
): Promise<any | null> => {
  let currentFolderId: string | null = folderId;
  const visited = new Set<string>(); // prevent infinite loops

  while (currentFolderId) {
    if (visited.has(currentFolderId)) break;
    visited.add(currentFolderId);

    const shareRecord = await sharedItem.findOne({
      userId: userId,
      folderId: currentFolderId,
    });

    if (shareRecord) return shareRecord;

    const folder = await Folders.findById(currentFolderId);
    if (!folder || !folder.parentFolder) break;
    currentFolderId = folder.parentFolder as string;
  }

  return null;
};

export const validatePermissions = (
  requiredPermission: 'read' | 'create' | 'delete',
) => {
  return asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?.id;
      if (!userId) return sendResponse(res, 401, 'Authentication Required');

      const targetFolderId =
        req.query.parentFolder ||
        req.body.parentFolder ||
        req.query.folderId ||
        req.body.folderId;
      const targetFileId = req.query.fileId || req.body.fileId;

      if (!targetFolderId && !targetFileId) {
        return next();
      }

      const ownedResource = targetFolderId
        ? await Folders.findOne({ _id: targetFolderId, userId })
        : await Files.findOne({ _id: targetFileId, userId });

      if (ownedResource) return next();

      const directShareFilter: any = { userId };
      if (targetFolderId) directShareFilter.folderId = targetFolderId;
      else if (targetFileId) directShareFilter.fileId = targetFileId;

      const directShare = await sharedItem.findOne(directShareFilter);

      if (directShare) {
        if (!directShare.permissions.includes(requiredPermission)) {
          return sendResponse(
            res,
            403,
            `Access Denied: ${requiredPermission} permission required`,
          );
        }
        return next();
      }

      let ancestorShare: any = null;

      if (targetFolderId) {
        const folder = await Folders.findById(targetFolderId);
        if (folder && folder.parentFolder) {
          ancestorShare = await findAncestorShare(
            folder.parentFolder as string,
            userId,
          );
        }
      } else if (targetFileId) {
        const file = await Files.findById(targetFileId);
        if (file && file.parentFolder) {
          ancestorShare = await findAncestorShare(
            file.parentFolder as string,
            userId,
          );
        }
      }

      if (ancestorShare) {
        if (!ancestorShare.permissions.includes(requiredPermission)) {
          return sendResponse(
            res,
            403,
            `Access Denied: ${requiredPermission} permission required`,
          );
        }
        return next();
      }

      return sendResponse(
        res,
        403,
        'Access Denied: No shared access to this resource',
      );
    },
  );
};
