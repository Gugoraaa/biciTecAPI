import { Request, Response } from "express";
import * as bikeModel from "../models/bikeModel";
import { BikeStatus } from "../types/bike.types";
import * as stationModel from "../models/stationModel";

export const getBikes = async (req: Request, res: Response) => {
    try {
        const bikes = await bikeModel.getAllBikes();
        res.json(bikes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getBike = async (req: Request, res: Response) => {
    try {
        const bike = await bikeModel.getBikeById(Number(req.params.id));
        if (!bike) {
            return res.status(404).json({ error: "Bike not found" });
        }
        res.json(bike);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const updateBikeStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.body;
        if (!Object.values(BikeStatus).includes(status as BikeStatus)) {
            return res.status(400).json({ error: "Invalid status" });
        }
        await bikeModel.updateBikeStatus(Number(req.params.id), status);
        res.json({ message: "Bike status updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getBikeTripLogs = async (req: Request, res: Response) => {
    try {
        const bikeId = Number(req.params.id);
        if (isNaN(bikeId)) {
            return res.status(400).json({ error: "Invalid bike ID" });
        }
        
        const logs = await bikeModel.getBikeTripLogs(bikeId);
        res.json(logs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener el historial de viajes" });
    }
};


export const updateBikeStation = async (req: Request, res: Response) => {
    try {
        const { stationId } = req.body;
        await bikeModel.updateBikeStation(
            Number(req.params.id),
            stationId === null ? null : Number(stationId)
        );
        res.json({ message: "Bike station updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const addBike = async (req: Request, res: Response) => {
    try {
        const {station,size } = req.body;
        await bikeModel.addBike(station,size);
        await stationModel.updateStationBikeCount(Number(station),1);
        res.json({ message: "Bike added successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};
