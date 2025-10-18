import { RowDataPacket } from 'mysql2';
import pool from "../config/database";
import { Bike, BikeStatus, BikePriority } from "../types/bike.types";
import { BikeTripLog, FormattedBikeTripLog } from "../types/bikeTripLog.types";

export const getAllBikes = async (): Promise<Bike[]> => {
    const [rows] = await pool.query<Bike[]>("SELECT * FROM bicicletas");
    return rows;
};

export const getBikeById = async (id: number): Promise<Bike | undefined> => {
    const [rows] = await pool.query<Bike[]>("SELECT * FROM bicicletas WHERE id = ?", [id]);
    return rows[0];
};

export const updateBikeStatus = async (id: number, status: BikeStatus): Promise<void> => {
    await pool.query(
        "UPDATE bicicletas SET estado = ? WHERE id = ?",
        [status, id]
    );
};

export const updateBikeStation = async (bikeId: number, stationId: number | null): Promise<void> => {
    await pool.query(
        "UPDATE bicicletas SET estacion = ? WHERE id = ?",
        [stationId, bikeId]
    );
};


export const getBikeTripLogs = async (bikeId: number): Promise<FormattedBikeTripLog[]> => {
    const [rows] = await pool.query<BikeTripLog[] & RowDataPacket[][]>(
        `SELECT
        v.id,
        DATE_FORMAT(CONVERT_TZ(v.fecha_uso, '+00:00', 'America/Mexico_City'), '%Y-%m-%d %H:%i:%s') AS fecha,
        v.tiempo_uso AS tiempo,
        v.distancia,
        CONCAT(u.nombre, ' ', u.apellido) AS usuario
        FROM viajes v
        JOIN Usuario u ON v.id_usuario = u.id
        WHERE v.id_bicicleta = ?
        ORDER BY v.fecha_uso DESC;`,
        [bikeId]
    );  
    
    return (rows as any[]).map(row => ({
        id: row.id,
        fecha: row.fecha,
        tiempo: row.tiempo,
        distancia: row.distancia,
        usuario: row.usuario
    }));
};

export const addBike = async (station: number, size: number): Promise<void> => {
    await pool.query(
        "INSERT INTO bicicletas (estacion, estado, tamaño) VALUES (?, ?, ?)",
        [station, "Available", size]
    );
};
