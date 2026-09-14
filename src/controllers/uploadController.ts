// src/controllers/uploadController.ts
import express from "express";
import { uploadService } from "../services/uploadService.js";

class UploadController {
  async uploadImage(req: express.Request, res: express.Response) {
    return uploadService.uploadImage(req, res);
  }
}

export const uploadController = new UploadController();
