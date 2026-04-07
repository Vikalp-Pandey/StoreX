import fileUploadController from '@/controllers/fileuploadControllers/file.controller';
import { validatePermissions } from '@/middlewares/fileaccess.middleware';
import { Router } from 'express';

const router = Router();

router.post('/file-upload', fileUploadController.fileUpload);
router.post(
  '/save-file',
  validatePermissions('create'),
  fileUploadController.saveFiles,
);
router.post(
  '/save-folder',
  validatePermissions('create'),
  fileUploadController.saveFolders,
);
router.get('/get-items', fileUploadController.getItems);
router.delete(
  '/delete-file',
  validatePermissions('delete'),
  fileUploadController.deleteFile,
);
router.delete(
  '/delete-folder',
  validatePermissions('delete'),
  fileUploadController.deleteFolder,
);

export default router;
