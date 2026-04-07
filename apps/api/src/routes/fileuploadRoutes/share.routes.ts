import shareController from '@/controllers/fileuploadControllers/share.controller';
import { Router } from 'express';

const router = Router();

router.post('/share', shareController.shareItem);
router.get('/shared-with-me', shareController.getSharedWithMe);
router.get('/search-users', shareController.searchUsers);
router.delete('/share/:shareId', shareController.revokeShare);
router.get('/shares/:itemId', shareController.getSharesForItem);

export default router;
