import { Request, Response, Router } from "express";
import { projectsController } from "../controllers/projectsController.js";

const router = Router();
// create new project
router.post("/", (req: Request, res: Response) => {
  projectsController.createProject(req, res);
});
// update project
router.put("/:id", (req: Request, res: Response) => {
  projectsController.updateProject(req, res);
});
// delete project
router.delete("/:id", (req: Request, res: Response) => {
  projectsController.deleteProject(req, res);
});
// get project by id
router.get("/:id", (req: Request, res: Response) => {
  projectsController.getProjectById(req, res);
});
// get all projects
router.get("/", (req: Request, res: Response) => {
  projectsController.getProjects(req, res);
});

export default router;
