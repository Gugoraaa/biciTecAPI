import pool from "../config/database";
import { User, UserRole } from "../types/user.types";

export const createUser = async (user: Omit<User, 'id'>): Promise<User> => {
    const [result] = await pool.execute(
        'INSERT INTO Usuario (nombre, apellido, matricula, password, rol) VALUES (?, ?, ?, ?, ?)',
        [user.nombre, user.apellido, user.matricula, user.password, user.rol]
    );
    
    const userId = (result as any).insertId;
    return { id: userId, ...user };
};

export const findUserByMatricula = async (matricula: string, includePassword = false): Promise<User | null> => {
    const fields = includePassword 
        ? 'id, nombre, apellido, matricula, password, rol' 
        : 'id, nombre, apellido, matricula, rol';
        
    const [rows] = await pool.execute(
        `SELECT ${fields} FROM Usuario WHERE matricula = ?`,
        [matricula]
    );
    
    const users = rows as User[];
    return users.length > 0 ? users[0] : null;
};

export const getUserById = async (id: number): Promise<User | null> => {
    const [rows] = await pool.execute(
        'SELECT id, nombre, apellido, matricula, rol FROM Usuario WHERE id = ?',
        [id]
    );
    
    const users = rows as User[];
    return users.length > 0 ? users[0] : null;
};
