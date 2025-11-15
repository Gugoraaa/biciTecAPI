import { Request, Response } from "express";
import * as tripModel from "../models/tripModel";
import pool from "../config/database";
import { getUserStatus } from "../models/userModel";
import { sendPrivate } from "../models/messageModel";

export const handleTrip = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const userId = Number(req.params.userId);
    const stationId = Number(req.body.stationId);
    const distance = Number(req.body.distance);

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    const user = await tripModel.getUserTripStatus(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (!distance || isNaN(distance)) {
      return res.status(400).json({ error: "Invalid distance" });
    }
    
    const userStatus = await getUserStatus(userId);
    

    if (userStatus === "banned") {
      await sendPrivate(
        "Bicitec Account Manager",
        "Intentaste iniciar un viaje, pero parece que tu cuenta esta suspendida",
        "1",
        String(userId),
        "account_notification"
      );
      return res.status(403).json({ error: "User is banned" });
    }


    await connection.beginTransaction();

    if (user.en_viaje) {
      if (!stationId) {
        return res
          .status(400)
          .json({ error: "Station ID is required to end a trip" });
      }

      const activeTrip = await tripModel.getActiveTrip(userId);
      if (!activeTrip) {
        return res.status(400).json({ error: "No active trip found" });
      }

      await tripModel.endTrip(activeTrip.id, distance);

      await Promise.all([
        connection.query(
          "UPDATE bicicletas SET estacion = ?, estado = ?,total_km = total_km + ? WHERE id = ?",
          [stationId, "Available", distance, activeTrip.id_bicicleta]
        ),
        connection.query(
          "UPDATE Estaciones SET bicicletas = bicicletas + 1 WHERE id = ?",
          [stationId]
        ),
        connection.query("UPDATE Usuario SET en_viaje = FALSE WHERE id = ?", [
          userId,
        ]),
      ]);

      await connection.commit();

      return res.json({
        message: "Trip ended successfully",
        endTime: new Date(),
      });
    } else {
      if (!stationId) {
        return res
          .status(400)
          .json({ error: "Station ID is required to start a trip" });
      }

      const bikeId = await tripModel.getAvailableBikeAtStation(stationId);
      if (!bikeId) {
        return res
          .status(400)
          .json({ error: "No available bikes at this station" });
      }

      const tripId = await tripModel.startTrip(userId, bikeId);

      await Promise.all([
        tripModel.updateBikeStation(bikeId),
        tripModel.updateBikesAtStation(stationId),
        tripModel.updateUserStatus(userId),
      ]);

      await connection.commit();

      return res.status(201).json({
        message: "Trip started successfully",
        tripId,
        bikeId,
        startTime: new Date(),
      });
    }
  } catch (error) {
    await connection.rollback();
    console.error("Error in handleTrip:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  } finally {
    connection.release();
  }
};

export const getActiveTrip = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId);

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const activeTrip = await tripModel.getActiveTrip(userId);
    if (!activeTrip) {
      return res.status(404).json({ message: "No active trip found" });
    }

    return res.json(activeTrip);
  } catch (error) {
    console.error("Error in getActiveTrip:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
