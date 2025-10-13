import { RowDataPacket,ResultSetHeader } from 'mysql2';
import pool from "../config/database";
import { Report } from "../types/report.types";

export const createReport = async (id_usuario: number, id_bici: number, descripcion: string): Promise<Report> => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        await connection.query(
            `INSERT INTO Tickets (id_usuario, id_bici, descripcion, fecha_reporte, estado)
             VALUES (?, ?, ?, NOW(), 'Open')`,
            [id_usuario, id_bici, descripcion]
        );
        
        const [rows] = await connection.query<RowDataPacket[]>(
            'SELECT * FROM Tickets WHERE id = LAST_INSERT_ID()'
        );
        
        await connection.commit();
        
        if (rows.length === 0) {
            throw new Error('Failed to retrieve created report');
        }
        
        return rows[0] as unknown as Report;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

export const getReportById = async (id: number): Promise<Report | undefined> => {
    const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM Tickets WHERE id = ?',
        [id]
    );
    return rows[0] as unknown as Report;
};

export const getReports = async (): Promise<Report[]> => {
    const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM Tickets ORDER BY fecha_reporte DESC'
    );
    return rows as unknown as Report[];
};

export const updateReportStatus = async (id: number, status: 'Open' | 'InProgress' | 'Done'): Promise<Report> => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        const [result] = await connection.query<RowDataPacket[]>(
            'UPDATE Tickets SET estado = ?, fecha_entrega = NOW() WHERE id = ?',
            [status, id]
        );

        const [rows] = await connection.query<RowDataPacket[]>(
            'SELECT * FROM Tickets WHERE id = ?',
            [id]
        );

        await connection.commit();
        return rows[0] as unknown as Report;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

export const updateReportPriority = async (id: number, priority: 'Low' | 'Medium' | 'High'): Promise<Report> => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        const [result] = await connection.query<RowDataPacket[]>(
            'UPDATE Tickets SET prioridad = ? WHERE id = ?',
            [priority, id]
        );

        const [rows] = await connection.query<RowDataPacket[]>(
            'SELECT * FROM Tickets WHERE id = ?',
            [id]
        );

        await connection.commit();
        return rows[0] as unknown as Report;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

export const deleteReport = async (id: number): Promise<boolean> => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [result] = await connection.query<ResultSetHeader>(
            'DELETE FROM Tickets WHERE id = ?',
            [id]
        );

        await connection.commit();
        return result.affectedRows > 0;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};