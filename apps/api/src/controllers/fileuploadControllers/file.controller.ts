import env from '@packages/env';
import { asyncHandler, logger, sendResponse } from '@packages/httputils';
import { generateUploadUrl, S3 } from '@services/fileupload';
import { Request, Response } from 'express';
import Files from '@/models/fileModels/file.model';
import Folders from '@/models/fileModels/folder.model';
import commonService from '@/services/common.service';
import fileService from '@/services/fileServices/file.service';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

export const fileUpload = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { fileName, fileType, parentFolder } = req.body;
  console.log(parentFolder);

  const uniqueFileName = fileName + userId + parentFolder;

  const uploadUrlObject = await generateUploadUrl(uniqueFileName, fileType, {
    bucket_name: env.BUCKET_NAME,
    region: env.AWS_REGION,
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  });

  return sendResponse(res, 200, 'Temp Url for file', uploadUrlObject);
});

export const saveFiles = asyncHandler(async (req: Request, res: Response) => {
  const { itemName, size, mimeType, key, fileUrl, parentFolder } = req.body;

  const userId = req.user?.id;
  if (!userId) {
    return sendResponse(res, 404, 'User not Authenticated');
  }

  if (!itemName || !size || !mimeType || !key) {
    return sendResponse(res, 400, 'Missing required fields');
  }

  if (!key.startsWith('uploads/')) {
    return sendResponse(res, 400, 'Invalid key');
  }
  const isExisting = await commonService.findInstance(
    Files,
    'itemName',
    itemName,
  );

  // isExisting uses find inside which returns an array, therefore [] also means truthy, so we have to check it with length.

  if (isExisting.length > 0) {
    return sendResponse(res, 409, `${itemName} already exists.`);
  }
  const file = await fileService.createFile({
    userId,
    itemName,
    size,
    mimeType,
    key,
    fileUrl,
    parentFolder,
  });
  return sendResponse(res, 201, 'File saved successfully', file);
});

export const saveFolders = asyncHandler(async (req: Request, res: Response) => {
  const { name, size, parentFolder } = req.body;
  logger('INFO', name, size);

  const userId = req.user?.id;
  if (!userId) {
    return sendResponse(res, 404, 'User not Authenticated');
  }

  if (!parentFolder) {
    const folder = await Folders.create({
      userId,
      name,
      size,
    });

    return sendResponse(res, 200, 'Folder saved successfully', folder);
  }
  const folder = await fileService.createFolder({
    userId,
    name,
    size,
    parentFolder,
  });
  return sendResponse(res, 200, 'Folder saved successfully', folder);
});

// Get Root Items from  Db
export const getItems = asyncHandler(async (req: Request, res: Response) => {
  const { parentFolder } = req.query;

  const userId = req.user?.id;

  if (!userId) {
    return sendResponse(res, 404, 'User not Authenticated');
  }

  if (parentFolder && typeof parentFolder !== 'string') {
    return sendResponse(res, 403, 'Invalid parentFolder');
  }
  const filter = {
    userId,
    parentFolder: parentFolder || null,
  };

  // 2. Fetch both Files and Folders in parallel for better performance
  const [files, folders] = await Promise.all([
    Files.find(filter).sort({ createdAt: -1 }).lean(),
    Folders.find(filter).sort({ createdAt: -1 }).lean(),
  ]);

  const items = [...files, ...folders];
  return sendResponse(res, 200, 'Items retrieved successfully', items);
});

export const deleteFile = asyncHandler(async (req: Request, res: Response) => {
  const { fileId } = req.query;
  const userId = req.user?.id;

  if (!userId) {
    return sendResponse(res, 404, 'User not Authenticated');
  }

  const file = await commonService.findObject(Files, { _id: fileId, userId });

  if (!file) {
    return sendResponse(res, 404, 'File not found');
  }

  const s3Client = await S3();

  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: env.BUCKET_NAME,
      Key: file.key,
    }),
  );

  await Files.deleteOne({ _id: fileId });

  return sendResponse(res, 200, `${file.itemName} deleted successfully`);
});

export const deleteFolder = asyncHandler(
  async (req: Request, res: Response) => {
    const { folderId } = req.query; // parentFolderId usually isn't needed for the target folder
    const userId = req.user?.id;

    if (!userId) {
      return sendResponse(res, 404, 'User not Authenticated');
    }

    const folder = await commonService.findObject(Folders, { _id: folderId });

    if (!folder) {
      return sendResponse(res, 404, 'Folder not found');
    }

    const s3Client = await S3();

    // Start the recursive deletion
    await fileService.deleteFolderRecursive(folderId as string, s3Client);

    return sendResponse(
      res,
      200,
      'Folder and all nested contents deleted successfully',
    );
  },
);

const fileUploadController = {
  fileUpload,
  saveFiles,
  saveFolders,
  getItems,
  deleteFile,
  deleteFolder,
};

export default fileUploadController;
