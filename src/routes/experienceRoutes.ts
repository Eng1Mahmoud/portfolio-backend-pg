import { Request, Response, Router } from "express";
import { experienceController } from "../controllers/experienceController.js";

const router = Router();

router.post("/", (req: Request, res: Response) => {
  experienceController.createExperience(req, res);
});

router.put("/:id", (req: Request, res: Response) => {
  experienceController.updateExperience(req, res);
});

router.delete("/:id", (req: Request, res: Response) => {
  experienceController.deleteExperience(req, res);
});

router.get("/:id", (req: Request, res: Response) => {
  experienceController.getExperienceById(req, res);
});

router.get("/", (req: Request, res: Response) => {
  experienceController.getAllExperiences(req, res);
});

export default router;
