import { RowDataPacket, OkPacket } from 'mysql2';
import pool from "../config/database";

export interface Trip extends RowDataPacket {
    id: number;
    id_usuario: number;
    id_bicicleta: number;
    fecha_uso: Date;
    tiempo_uso: number | null;
    fecha_terminado: Date | null;
    distancia: number | null;
    created_at: Date;
    updated_at: Date;
}

interface BikeRow extends RowDataPacket {
    id: number;
}

interface UserStatusRow extends RowDataPacket {
    id: number;
    en_viaje: boolean;
}

export const startTrip = async (userId: number, bikeId: number): Promise<number> => {
    const [result] = await pool.query<OkPacket>(
        `INSERT INTO viajes (id_usuario, id_bicicleta, fecha_uso) 
         VALUES (?, ?, NOW())`,
        [userId, bikeId]
    );
    return result.insertId;
};

export const endTrip = async (tripId: number, stationId: number): Promise<void> => {
    // Get trip start time
    const [trip] = await pool.query<Trip[]>(
        'SELECT * FROM viajes WHERE id = ?',
        [tripId]
    );
    
    if (!trip[0]) {
        throw new Error('Trip not found');
    }

    const startTime = new Date(trip[0].fecha_uso);
    const endTime = new Date();
    

    // Update trip with end time and duration
    await pool.query(
    `UPDATE viajes
    SET fecha_terminado = NOW(),
        tiempo_uso = TIMESTAMPDIFF(MINUTE, fecha_uso, NOW())
    WHERE id = ?`,
    [tripId]
);
return;
};

export const getActiveTrip = async (userId: number): Promise<Trip | null> => {
    const [trips] = await pool.query<Trip[]>(
        `SELECT * FROM viajes 
         WHERE id_usuario = ? AND fecha_terminado IS NULL 
         ORDER BY fecha_uso DESC 
         LIMIT 1`,
        [userId]
    );
    return trips[0] || null;
};

export const getAvailableBikeAtStation = async (stationId: number): Promise<number | null> => {
    const [bikes] = await pool.query<BikeRow[]>(
        `SELECT id FROM bicicletas 
         WHERE estacion = ? AND estado = 'Available' 
         LIMIT 1`,
        [stationId]
    );
    return bikes.length > 0 ? bikes[0].id : null;
};

export const getUserStatus = async (userID: number): Promise<{id: number, en_viaje: boolean} | null> => {
    const [rows] = await pool.query<UserStatusRow[]>(
        'SELECT id, en_viaje FROM Usuario WHERE id = ?',
        [userID]
    );
    return rows.length > 0 ? {
        id: rows[0].id,
        en_viaje: Boolean(rows[0].en_viaje)
    } : null;
};

export const updateBikeStation = async (bikeId: number): Promise<boolean> => {
    const [result] = await pool.query<OkPacket>(
        'UPDATE bicicletas SET estacion = NULL, estado = ? WHERE id = ?',
        ['InUse', bikeId]
    );
    return result.affectedRows > 0;
};

export const updateBikesAtStation = async (stationId: number): Promise<boolean> => {
    const [result] = await pool.query<OkPacket>(
        'UPDATE Estaciones SET bicicletas = bicicletas - 1 WHERE id = ?',
        [stationId]
    );
    return result.affectedRows > 0;
};

export const updateUserStatus = async (userId: number): Promise<boolean> => {
    const [result] = await pool.query<OkPacket>(
        'UPDATE Usuario SET en_viaje = TRUE WHERE id = ?',
        [userId]
    );
    return result.affectedRows > 0;
};