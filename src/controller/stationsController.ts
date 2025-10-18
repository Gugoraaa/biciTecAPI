import { Request, Response } from "express";
import * as stationModel from "../models/stationModel";

export const getStations = async (req: Request, res: Response) => {
    try {
        const stations = await stationModel.getAllStations();
        res.json(stations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getStation = async (req: Request, res: Response) => {
    try {
        const station = await stationModel.getStationById(Number(req.params.id));
        if (!station) {
            return res.status(404).json({ error: "Station not found" });
        }
        res.json(station);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const updateStationBikeCount = async (req: Request, res: Response) => {
    try {
        const { stationId } = req.body;
        await stationModel.updateStationBikeCount(Number(stationId),1);
        res.json({ message: "Bike count updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};
    