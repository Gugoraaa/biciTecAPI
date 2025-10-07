import { Request, Response } from "express";
import pool from "../config/database";

export const getStations = async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query("SELECT * FROM Estaciones");
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};