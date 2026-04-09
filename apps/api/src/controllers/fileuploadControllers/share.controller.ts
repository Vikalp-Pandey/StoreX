import { asyncHandler, sendResponse } from '@packages/httputils';
import { Request, Response } from 'express';
import sharedItem from '@/models/fileModels/sharedItem.model';
import Files from '@/models/fileModels/file.model';
import Folders from '@/models/fileModels/folder.model';
import User from '@/models/authModels/user.model';
import fileService from '@/services/fileServices/file.service';

export const shareItem = asyncHandler(async (req: Request, res: Response) => {
  const senderId = req.user?.id;
  const { email, fileId, folderId, permissions } = req.body;

  if (!senderId) return sendResponse(res, 401, 'Authentication Required');
  if (!email) return sendResponse(res, 400, 'Recipient email is required');
  if (!fileId && !folderId)
    return sendResponse(res, 400, 'Target ID (file or folder) is required');

  if (!permissions || !Array.isArray(permissions) || permissions.length === 0) {
    return sendResponse(res, 400, 'At least one permission is required');
  }

  const recipientUser = await User.findOne({ email });
  if (!recipientUser)
    return sendResponse(res, 404, 'User with this email not found');

  const recipientId = recipientUser._id.toString();
  if (recipientId === senderId)
    return sendResponse(res, 400, 'Cannot share items with yourself');

  if (fileId) {
    const file = await Files.findOne({ _id: fileId, userId: senderId });
    if (!file)
      return sendResponse(res, 403, 'Access Denied: You do not own this file');
  }

  if (folderId) {
    const folder = await Folders.findOne({ _id: folderId, userId: senderId });
    if (!folder)
      return sendResponse(
        res,
        403,
        'Access Denied: You do not own this folder',
      );
  }


  // This filter prevents the E11000 error by finding the exact combination of user+item
  const shareFilter = {
    userId: recipientId,
    fileId: fileId || null,
    folderId: folderId || null,
  };

  try {
    const shareRecord = await sharedItem.findOneAndUpdate(
      shareFilter,
      {
        $set: { permissions },
        $setOnInsert: { sharedBy: senderId },
      },
      {
        upsert: true, // Create if not exists, Update if does
        runValidators: true,
      },
    );
    console.log(shareRecord);
  } catch (error) {
    console.log(error);
  }


  if (folderId) {
    await fileService.shareFolderRecursive(
      folderId,
      senderId,
      recipientId,
      permissions,
    );
  }

 
  return sendResponse(
    res,
    200,
    'Item shared successfully',
  );
});

export const getSharedWithMe = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return sendResponse(res, 401, 'Authentication Required');
    }

    const shares = await sharedItem.find({ userId }).lean();

    const sharedFolderIds = shares
      .map((s) => s.folderId?.toString())
      .filter(Boolean)
      .filter((id): id is string => !!id);
    const sharedFileIds = shares
      .map((s) => s.fileId?.toString())
      .filter(Boolean)
      .filter((id): id is string => !!id);

    const [folders, files] = await Promise.all([
      Folders.find({ _id: { $in: sharedFolderIds } }).lean(),
      Files.find({ _id: { $in: sharedFileIds } }).lean(),
    ]);

    const rootFolders = folders.filter((folder) => {
      const parentId = folder.parentFolder?.toString();
      return !parentId || !sharedFolderIds.includes(parentId);
    });

    const rootFiles = files.filter((file) => {
      const parentId = file.parentFolder?.toString();
      return !parentId || !sharedFolderIds.includes(parentId);
    });

    const sharedByIds = shares.map((s) => s.sharedBy).filter(Boolean);
    const sharedByUsers = await User.find({ _id: { $in: sharedByIds } })
      .select('name email')
      .lean();

    const result = [];

    for (const folder of rootFolders) {
      const share = shares.find(
        (s) => s.folderId?.toString() === folder._id.toString(),
      );
      const owner = sharedByUsers.find(
        (u) => u._id.toString() === share?.sharedBy?.toString(),
      );

      const fullTree = await fileService.getSharedFolderRecursive(
        folder._id.toString(),
      );

      result.push({
        item: {
          ...folder,
          folders: fullTree.folders, // Nested sub-folders
          files: fullTree.files, // Nested sub-files
        },
        itemType: 'folder',
        permissions: share?.permissions || [],
        sharedBy: owner || null,
        isShared: true,
      });
    }

    for (const file of rootFiles) {
      const share = shares.find(
        (s) => s.fileId?.toString() === file._id.toString(),
      );
      const owner = sharedByUsers.find(
        (u) => u._id.toString() === share?.sharedBy?.toString(),
      );

      result.push({
        item: file,
        itemType: 'file',
        permissions: share?.permissions || [],
        sharedBy: owner || null,
        isShared: true,
      });
    }
    for (const element of result) {
      console.log(element.item);
    }

    return sendResponse(
      res,
      200,
      'Shared items retrieved successfully',
      result,
    );
  },
);

export const revokeShare = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { shareId } = req.params;

  if (!userId) {
    return sendResponse(res, 401, 'Authentication Required');
  }

  const share = await sharedItem.findById(shareId);

  if (!share) {
    return sendResponse(res, 404, 'Share record not found');
  }

  // Only the sender (owner) can revoke
  if (share.sharedBy !== userId) {
    return sendResponse(res, 403, 'Only the item owner can revoke access');
  }

  await sharedItem.deleteOne({ _id: shareId });

  return sendResponse(res, 200, 'Access revoked successfully');
});

export const getSharesForItem = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { itemId } = req.params;
    const { itemType } = req.query; // 'file' or 'folder'
    if (!userId) {
      return sendResponse(res, 401, 'Authentication Required');
    }
    const filter: any = {};
    if (itemType === 'file') {
      const file = await Files.findOne({ _id: itemId, userId });
      if (!file) {
        return sendResponse(
          res,
          403,
          'You can only view shares for items you own',
        );
      }
      filter.fileId = itemId;
    } else {
      const folder = await Folders.findOne({ _id: itemId, userId });
      if (!folder) {
        return sendResponse(
          res,
          403,
          'You can only view shares for items you own',
        );
      }
      filter.folderId = itemId;
    }
    const shares = await sharedItem.find(filter).lean();
    const enrichedShares = await Promise.all(
      shares.map(async (share) => {
        const recipient = await User.findById(share.userId)
          .select('name email')
          .lean();
        return {
          _id: share._id,
          recipient,
          permissions: share.permissions,
          sharedAt: (share as any).createdAt,
        };
      }),
    );
    return sendResponse(res, 200, 'Shares retrieved', enrichedShares);
  },
);

export const searchUsers = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { q } = req.query;

  if (!userId) {
    return sendResponse(res, 401, 'Authentication Required');
  }

  if (!q || typeof q !== 'string' || q.trim().length < 1) {
    return sendResponse(res, 200, 'No results', []);
  }

  const searchRegex = new RegExp(q.trim(), 'i');

  const users = await User.find({
    _id: { $ne: userId }, // Exclude self
    $or: [
      { name: { $regex: searchRegex } },
      { email: { $regex: searchRegex } },
    ],
  })
    .select('name email')
    .limit(10)
    .lean();

  return sendResponse(res, 200, 'Users found', users);
});

const shareController = {
  shareItem,
  getSharedWithMe,
  revokeShare,
  getSharesForItem,
  searchUsers,
};

export default shareController;
