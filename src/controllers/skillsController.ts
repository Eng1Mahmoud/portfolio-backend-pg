import { Request, Response } from 'express';
import { skillsService } from '../services/skillsService.js';

class SkillsController {
    // creat a new skill
    async createSkill(req: Request, res: Response) {
        return skillsService.createSkill(req, res);
    }

    // update a skill
    async updateSkill(req: Request, res: Response) {
        return skillsService.updateSkill(req, res);
    }

    // delete a skill
    async deleteSkill(req: Request, res: Response) {
        return skillsService.deleteSkill(req, res);
    }

    // Get all skills
    async getSkills(req: Request, res: Response) {
        return skillsService.getAllSkills(req, res);
    }

    // get a skill by id
    async getSkillById(req: Request, res: Response) {
        return skillsService.getSkillById(req, res);
    }
}

export const skillsController = new SkillsController();