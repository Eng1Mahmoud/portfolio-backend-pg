import { Request, Response } from "express";
import { experienceService } from "../services/experienceService.js";

class ExperienceController {
  async createExperience(req: Request, res: Response) {
    return experienceService.createExperience(req, res);
  }

  async updateExperience(req: Request, res: Response) {
    return experienceService.updateExperience(req, res);
  }

  async deleteExperience(req: Request, res: Response) {
    return experienceService.deleteExperience(req, res);
  }

  async getExperienceById(req: Request, res: Response) {
    return experienceService.getExperienceById(req, res);
  }

  async getAllExperiences(req: Request, res: Response) {
    return experienceService.getAllExperiences(req, res);
  }
}

export const experienceController = new ExperienceController();
