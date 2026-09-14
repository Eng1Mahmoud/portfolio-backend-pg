import { Router, Request, Response } from 'express';
import { skillsController } from '../controllers/skillsController.js';

const router = Router();

// create a new skill
router.post("/", (req: Request, res: Response) => {
  skillsController.createSkill(req, res);
});
// get all skills
router.get("/", (req: Request, res: Response) => {
  skillsController.getSkills(req, res);
});

// update a skill
router.put("/:id", (req: Request, res: Response) => {
  skillsController.updateSkill(req, res);
});
// delete a skill
router.delete("/:id", (req: Request, res: Response) => {
  skillsController.deleteSkill(req, res);
});
// get a skill by id
router.get("/:id", (req: Request, res: Response) => {
  skillsController.getSkillById(req, res);
});

export default router;
