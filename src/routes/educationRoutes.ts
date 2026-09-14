import { Request, Response, Router } from "express";
import { educationController } from "../controllers/educationController.js";

const router = Router();

router.post("/", (req: Request, res: Response) => {
  educationController.createEducation(req, res);
});

router.put("/:id", (req: Request, res: Response) => {
  educationController.updateEducation(req, res);
});

router.delete("/:id", (req: Request, res: Response) => {
  educationController.deleteEducation(req, res);
});

router.get("/:id", (req: Request, res: Response) => {
  educationController.getEducationById(req, res);
});

router.get("/", (req: Request, res: Response) => {
  educationController.getAllEducations(req, res);
});

export default router;
