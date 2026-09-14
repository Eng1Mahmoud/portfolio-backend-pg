import { Request, Response } from "express";
import { recommendationsService } from "../services/recommendationsService.js";

class RecommendationsController {
  async createRecommendation(req: Request, res: Response) {
    return recommendationsService.createRecommendation(req, res);
  }

  async updateRecommendation(req: Request, res: Response) {
    return recommendationsService.updateRecommendation(req, res);
  }

  async deleteRecommendation(req: Request, res: Response) {
    return recommendationsService.deleteRecommendation(req, res);
  }

  async getRecommendationById(req: Request, res: Response) {
    return recommendationsService.getRecommendationById(req, res);
  }

  async getAllRecommendations(req: Request, res: Response) {
    return recommendationsService.getAllRecommendations(req, res);
  }
}

export const recommendationsController = new RecommendationsController();
