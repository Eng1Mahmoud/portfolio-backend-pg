import { Request, Response } from "express";
import { educationService } from "../services/educationService.js";

class EducationController {
  async createEducation(req: Request, res: Response) {
    return educationService.createEducation(req, res);
  }

  async updateEducation(req: Request, res: Response) {
    return educationService.updateEducation(req, res);
  }

  async deleteEducation(req: Request, res: Response) {
    return educationService.deleteEducation(req, res);
  }

  async getEducationById(req: Request, res: Response) {
    return educationService.getEducationById(req, res);
  }

  async getAllEducations(req: Request, res: Response) {
    return educationService.getAllEducations(req, res);
  }
}

export const educationController = new EducationController();
