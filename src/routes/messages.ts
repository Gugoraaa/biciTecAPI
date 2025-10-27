import { Router } from "express";
import { sendMessage, getMessages } from "../controller/messageController";
const router = Router();

router.post("/sendMessage", sendMessage);
router.get("/getMessages/:id", getMessages);



export default router;
    