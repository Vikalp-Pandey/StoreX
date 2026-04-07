import Files, { FileSchema } from '@/models/fileModels/file.model';
import Folders, { FolderSchema } from '@/models/fileModels/folder.model';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import commonService from '../common.service';
import env from '@packages/env';
import sharedItem from '@/models/fileModels/sharedItem.model';

export const createFile = async (file: FileSchema) => {
  const newFile = await Files.create(file);
  return newFile;
};

export const createFolder = async (folder: FolderSchema) => {
  const newFolder = await Folders.create(folder);
  return newFolder;
};

const deleteFolderRecursive = async (folderId: string, s3Client: any) => {
  const files = await commonService.findInstance(
    Files,
    'parentFolder',
    folderId,
  );

  const subFolders = await commonService.findInstance(
    Folders,
    'parentFolder',
    folderId,
  );

  for (const file of files) {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: env!.BUCKET_NAME,
        Key: file.key,
      }),
    );
    await Files.deleteOne({ _id: file._id });
    await sharedItem.deleteMany({ fileId: file._id.toString() });
  }

  for (const subFolder of subFolders) {
    await deleteFolderRecursive(subFolder._id.toString(), s3Client);
  }

  await Folders.deleteOne({ _id: folderId });
  await sharedItem.deleteMany({ folderId });
};

const shareFolderRecursive = async (
  folderId: string,
  senderId: string,
  recipientId: string,
  permissions: string[],
) => {
  await sharedItem.findOneAndUpdate(
    { folderId, userId: recipientId },
    { $set: { permissions, sharedBy: senderId } },
    { upsert: true },
  );

  const [subFiles, subFolders] = await Promise.all([
    Files.find({ parentFolder: folderId, userId: senderId }),
    Folders.find({ parentFolder: folderId, userId: senderId }),
  ]);

  const filePromises = subFiles.map((file) =>
    sharedItem.findOneAndUpdate(
      { fileId: file._id.toString(), userId: recipientId },
      { $set: { permissions, sharedBy: senderId } },
      { upsert: true },
    ),
  );
  await Promise.all(filePromises);

  for (const folder of subFolders) {
    await shareFolderRecursive(
      folder._id.toString(),
      senderId,
      recipientId,
      permissions,
    );
  }
};

export const getSharedFolderRecursive = async (folderId: string) => {
  const [subFolders, subFiles] = await Promise.all([
    Folders.find({ parentFolder: folderId }).lean(),
    Files.find({ parentFolder: folderId }).lean(),
  ]);

  const nestedFolders: any = await Promise.all(
    subFolders.map(async (folder) => {
      const contents = await getSharedFolderRecursive(folder._id.toString());

      return {
        ...folder,
        itemType: 'folder',
        folders: contents.folders, // Nested sub-folders
        files: contents.files, // Nested sub-files
      };
    }),
  );

  return {
    folders: nestedFolders,
    files: subFiles.map((file) => ({ ...file, itemType: 'file' })),
  };
};

const fileService = {
  createFile,
  createFolder,
  getSharedFolderRecursive,
  deleteFolderRecursive,
  shareFolderRecursive,
};

export default fileService;
