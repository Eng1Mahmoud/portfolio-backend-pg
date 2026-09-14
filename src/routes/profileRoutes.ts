import { Request, Response, Router } from 'express';
import { profileController } from '../controllers/profileController.js';
const router = Router();

// Use the imported controller instance directly
router.post('/', (req: Request, res: Response) => {
    profileController.createProfile(req, res);
});
router.get('/', (req: Request, res: Response) => {
    profileController.getProfile(req, res);
});
router.put('/', (req: Request, res: Response) => {
    profileController.updateProfile(req, res);
});

export default router;
