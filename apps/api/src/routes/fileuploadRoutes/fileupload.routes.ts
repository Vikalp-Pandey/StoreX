import fileUploadController from '@/controllers/fileuploadControllers/file.controller';
import { Router } from 'express';

const router = Router();

router.post('/file-upload', fileUploadController.fileUpload);
router.post('/save-file', fileUploadController.saveFiles);
router.post('/save-folder', fileUploadController.saveFolders);
router.get('/get-items', fileUploadController.getItems);
router.delete('/delete-file', fileUploadController.deleteFile);
router.delete('/delete-folder', fileUploadController.deleteFolder);

export default router;
