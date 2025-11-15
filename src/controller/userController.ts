import {Request, Response} from "express";
import * as userModel from "../models/userModel";
import {sendPrivate} from "../models/messageModel";
import { title } from "process";

export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await userModel.getUsers();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const updateUserState = async (req: Request, res: Response) => {
    try {
        const messageTitle = "Bicitec Account Manager";
        const { id } = req.params;
        const { state, body, type, adminId } = req.body as {
            state: string;
            body: string;
            type: string;
            adminId: number;
        };
        
        const user = await userModel.updateUserState(Number(id), state);
        await sendPrivate(
            messageTitle,
            body,
            adminId.toString(),
            id,
            type
        );
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const createAppeal = async (req: Request, res: Response) => {
    try {
        const { id, description } = req.body as {
            id: number;
            description: string;
        };
        
        const appeal = await userModel.createAppeal(id, description);
        res.json(appeal);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getAppeals = async (req: Request, res: Response) => {
    try {
        
        const appeals = await userModel.getAppeals();
        res.json(appeals);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const updateAppeal = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { description, state, adminId,userId   } = req.body 
        
        const appeal = await userModel.updateAppeal(Number(id), description, state, adminId, userId);
        res.json(appeal);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

