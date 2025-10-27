import pool from "../config/database";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";

export const sendNew = async (title: string, message: string, sender: string, ) => {
  try {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO Mensajes (titulo, cuerpo, remitente, tipo) 
       VALUES (?, ?, ?, 'news')`,
      [title, message, sender]
    );
    
    const messageId = result.insertId;
    
    const [users] = await pool.execute<RowDataPacket[]>(
      "SELECT id FROM Usuario"
    );
    
    if (users.length > 0) {
      const bandejaValues = users.map((user: any) => [
        user.id,
        messageId,
        false
      ]);
      
      await pool.query(
        `INSERT INTO Bandeja (id_usuario, id_mensaje, leido) 
         VALUES ?`,
        [bandejaValues]
      );
    }
    
    
    return { success: true, messageId };
    
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
 
};

export const getMessages = async (userId: number) => {
  try {
    const [result] = await pool.execute<RowDataPacket[]>(
      `SELECT 
    m.id AS id_mensaje,
    m.titulo,
    m.cuerpo,
    m.fecha,
    m.tipo,
    m.remitente,
    b.leido
    FROM Bandeja b
    JOIN Mensajes m ON b.id_mensaje = m.id
    WHERE b.id_usuario = ?`,
      [userId]
    );
    
    return result;
    
  } catch (error) {
    console.error("Error getting messages:", error);
    throw error;
  }
 
};
export const sendPrivate = async (title: string, message: string, sender: string, receiver: string, type: string) => {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO Mensajes (titulo, cuerpo, remitente, tipo) 
       VALUES (?, ?, ?, 'news')`,
      [title, message, sender]
    );
    
    const messageId = result.insertId;
    
      const bandejaValues = [
        receiver,
        messageId,
        false
      ];
      
      await pool.query(
        `INSERT INTO Bandeja (id_usuario, id_mensaje, leido) 
         VALUES ?`,
        [bandejaValues]
      );
    
    return { success: true, messageId };
    
    } catch (error) {
        console.error("Error sending message:", error);
        throw error;
    }
}