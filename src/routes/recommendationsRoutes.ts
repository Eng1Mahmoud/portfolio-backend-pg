import { Request, Response, Router } from "express";
import { recommendationsController } from "../controllers/recommendationsController.js";

const router = Router();

router.post("/", (req: Request, res: Response) => {
  recommendationsController.createRecommendation(req, res);
});

router.put("/:id", (req: Request, res: Response) => {
  recommendationsController.updateRecommendation(req, res);
});

router.delete("/:id", (req: Request, res: Response) => {
  recommendationsController.deleteRecommendation(req, res);
});

router.get("/:id", (req: Request, res: Response) => {
  recommendationsController.getRecommendationById(req, res);
});

router.get("/", (req: Request, res: Response) => {
  recommendationsController.getAllRecommendations(req, res);
});

export default router;
