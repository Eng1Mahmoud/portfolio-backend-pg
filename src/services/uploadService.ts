import { Request, Response } from "express";
import { uploadToSirv } from "../config/sirv.js";

class UploadService {
    async uploadImage(req: Request, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: "No file uploaded" });
            }

            const filename = req.file.originalname || "upload.jpg";
            const imageUrl = await uploadToSirv(req.file.buffer, filename);
            res.status(201).json({
                url: imageUrl,
            });
        } catch (error) {
            console.error("Full error:", error);
            res.status(500).json({ message: "Server error", error: String(error) });
        }
    }
}

export const uploadService = new UploadService();
