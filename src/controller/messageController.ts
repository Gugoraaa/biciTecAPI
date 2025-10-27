import { Request, Response } from "express";
import * as messageModel from "../models/messageModel";


export const sendMessage = async (req: Request, res: Response) => {
    try {
        const {title, body,type,sender,receiver=null } = req.body;

        if (!title || !body || !type || !sender) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        if (type === 'news' ) { 
            try {
                await messageModel.sendNew(title, body, sender);
            } catch (error) {
                console.error(error);
                return res.status(500).json({ error: "Internal server error" });
            }
        }else{
            try {
                await messageModel.sendPrivate(title, body, sender, receiver,type);
            } catch (error) {
                console.error(error);
                return res.status(500).json({ error: "Internal server error" });
            }   
        }

        res.json({ message: "Message sent successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getMessages = async (req: Request, res: Response) => {

    try {
        const {id} = req.params;
        if (!id) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const messages = await messageModel.getMessages(Number(id));
        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};