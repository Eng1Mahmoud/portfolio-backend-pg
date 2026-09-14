import { Request, Response } from 'express';
import { profileService } from '../services/profileService.js';

class ProfileController {
    // create profile
    async createProfile(req: Request, res: Response) {
        return profileService.createProfile(req, res);
    }

    // update profile - update first profile
    async updateProfile(req: Request, res: Response) {
        return profileService.updateProfile(req, res);
    }

    // get profile - get first profile
    async getProfile(req: Request, res: Response) {
        return profileService.getProfile(req, res);
    }
}

export const profileController = new ProfileController();