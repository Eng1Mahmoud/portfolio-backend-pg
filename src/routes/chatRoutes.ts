import { Router, Request, Response, RequestHandler } from "express";
import { chatController } from "../controllers/chatController.js";

const chatRouter: Router = Router();

chatRouter.post("/", (async (req: Request, res: Response) => {
    await chatController.chat(req, res);
}) as RequestHandler);

export default chatRouter;
