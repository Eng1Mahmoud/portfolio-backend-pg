import { Request, Response } from "express";
import { projectsService } from "../services/projectsService.js";

class ProjectsController {
  // create a new project
  async createProject(req: Request, res: Response) {
    return projectsService.createProject(req, res);
  }

  // update a project
  async updateProject(req: Request, res: Response) {
    return projectsService.updateProject(req, res);
  }

  // delete a project
  async deleteProject(req: Request, res: Response) {
    return projectsService.deleteProject(req, res);
  }

  // get a project by id
  async getProjectById(req: Request, res: Response) {
    return projectsService.getProjectById(req, res);
  }

  // Get all projects
  async getProjects(req: Request, res: Response) {
    return projectsService.getAllProjects(req, res);
  }
}

export const projectsController = new ProjectsController();
