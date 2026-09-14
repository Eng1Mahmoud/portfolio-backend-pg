import { Request, Response } from "express";
import { authService } from "../services/authService.js";

class AuthController {
  async register(req: Request, res: Response) {
    return authService.register(req, res);
  }

  async login(req: Request, res: Response) {
    return authService.login(req, res);
  }
}

export const authController = new AuthController();
