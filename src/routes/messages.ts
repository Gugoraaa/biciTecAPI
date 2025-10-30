import { Router } from "express";
import { sendMessage, getMessages, updateMessageState } from "../controller/messageController";
const router = Router();

router.post("/sendMessage", sendMessage);
router.get("/getMessages/:id", getMessages);
router.patch("/markAsRead/:id", updateMessageState);


export default router;
    