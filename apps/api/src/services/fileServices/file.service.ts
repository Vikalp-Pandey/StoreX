import Files, { FileSchema } from '@/models/fileModels/file.model';
import Folders, { FolderSchema } from '@/models/fileModels/folder.model';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import commonService from '../common.service';
import env from '@packages/env';

export const createFile = async (file: FileSchema) => {
  const newFile = await Files.create(file);
  return newFile;
};

export const createFolder = async (folder: FolderSchema) => {
  const newFolder = await Folders.create(folder);
  return newFolder;
};

const deleteFolderRecursive = async (folderId: string, s3Client: any) => {
  // Find all immediate files in this folder
  const files = await commonService.findInstance(
    Files,
    'parentFolder',
    folderId,
  );

  // Find all immediate subfolders in this folder
  const subFolders = await commonService.findInstance(
    Folders,
    'parentFolder',
    folderId,
  );

  // Delete files in this folder from S3 and DB
  for (const file of files) {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: env.BUCKET_NAME,
        Key: file.key,
      }),
    );
    await Files.deleteOne({ _id: file._id });
  }

  // Recursively delete subfolders
  for (const subFolder of subFolders) {
    await deleteFolderRecursive(subFolder._id.toString(), s3Client);
  }

  // Finally, delete the folder itself
  await Folders.deleteOne({ _id: folderId });
};

const fileService = {
  createFile,
  createFolder,
  deleteFolderRecursive,
};
export default fileService;
