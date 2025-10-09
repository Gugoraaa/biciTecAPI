import pool from "../config/database";
import { Station } from "../types/station.types";

export const getAllStations = async (): Promise<Station[]> => {
    const [rows] = await pool.query<Station[]>("SELECT * FROM Estaciones");
    return rows;
};

export const getStationById = async (id: number): Promise<Station | undefined> => {
    const [rows] = await pool.query<Station[]>("SELECT * FROM Estaciones WHERE id = ?", [id]);
    return rows[0];
};

export const updateStationBikeCount = async (stationId: number, change: number): Promise<void> => {
    await pool.query(
        "UPDATE Estaciones SET bicicletas = bicicletas + ? WHERE id = ?",
        [change, stationId]
    );
};
