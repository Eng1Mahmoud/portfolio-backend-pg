import { Request, Response } from 'express';
import { chatService } from '../services/chatService.js';

class ChatController {
    async chat(req: Request, res: Response) {
        return chatService.getChatResponse(req, res);
    }
}

export const chatController = new ChatController();
