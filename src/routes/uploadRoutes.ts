// src/routes/uploadRoutes.ts
import { Request, Response, Router } from "express";
import { uploadController } from "../controllers/uploadController.js";
import upload from "../middlewares/uploadImages.js";
const router = Router();
// Define routes for upload following the skills route pattern
router.post(
  "/",
  upload.single("image"),
  async (req: Request, res: Response) => {
    uploadController.uploadImage(req, res);
  }
);

export default router;
